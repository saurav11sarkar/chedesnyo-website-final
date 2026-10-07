const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const test = require("node:test");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const React = require("react");
const { createRoot } = require("react-dom/client");
const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
const { act } = React;

function loadPanel(mocks) {
  const filename = path.join(__dirname, "..", "src/components/stripe/StripeAccountPanel.tsx");
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const requireActual = compiled.require.bind(compiled);
  compiled.require = (name) => Object.hasOwn(mocks, name) ? mocks[name] : requireActual(name);
  compiled._compile(outputText, filename);
  return compiled.exports.default;
}

async function fixture(t, { sessionStatus = "authenticated", language = "en", handler } = {}) {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "https://example.test/stripe-account-success" });
  const redirects = [];
  const testWindow = Object.create(dom.window);
  Object.defineProperty(testWindow, "location", { value: { assign: (url) => redirects.push(url) } });
  const keys = ["window", "document", "navigator", "Node", "HTMLElement", "MutationObserver", "fetch", "IS_REACT_ACT_ENVIRONMENT"];
  const originalGlobals = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
  const originalApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const state = {
    language,
    session: {
      status: sessionStatus,
      data: sessionStatus === "authenticated" ? { user: { id: "seller-id", accessToken: "test-token", role: "seles" } } : null,
    },
  };
  const calls = [];
  const fetchMock = async (url, options) => {
    calls.push({ url, options });
    const response = await handler(url, options);
    return { ok: response.status === undefined || response.status === 200, status: response.status || 200, json: async () => ({ success: response.status === undefined || response.status === 200, data: response.data }) };
  };
  for (const key of keys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === "window" ? testWindow : key === "fetch" ? fetchMock : key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key] });
  }
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://backend.example.test/api/v1/";
  const Panel = loadPanel({
    "next-auth/react": { useSession: () => state.session },
    "@/provider/TranslateProvider": { useLanguage: () => ({ language: state.language }) },
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "@/components/ui/button": { Button: ({ children, variant, ...props }) => React.createElement("button", props, children) },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const container = dom.window.document.getElementById("root");
  const root = createRoot(container);
  async function flush() { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 15)); }); }
  async function render(mode = "return") {
    await act(async () => root.render(React.createElement(React.StrictMode, null,
      React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Panel, { mode })),
    )));
    await flush();
  }
  async function click(label) {
    const button = [...container.querySelectorAll("button")].find((node) => node.textContent === label);
    assert.ok(button, `Missing button: ${label}`);
    await act(async () => button.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    await flush();
  }
  t.after(async () => {
    await act(async () => root.unmount());
    queryClient.clear();
    dom.window.close();
    keys.forEach((key, index) => {
      if (originalGlobals[index]) Object.defineProperty(globalThis, key, originalGlobals[index]);
      else delete globalThis[key];
    });
    if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_BACKEND_API_URL;
    else process.env.NEXT_PUBLIC_BACKEND_API_URL = originalApiUrl;
  });
  return { state, container, calls, redirects, render, click, flush };
}

const disconnected = { hasAccount: false, detailsSubmitted: false, payoutsEnabled: false, chargesEnabled: false, needsMoreInformation: false, verificationPending: false };
const complete = { ...disconnected, hasAccount: true, detailsSubmitted: true, payoutsEnabled: true, chargesEnabled: true };

test("both callback pages require sign-in, preserve the callback path, and switch language immediately", async (t) => {
  const ui = await fixture(t, { sessionStatus: "unauthenticated", language: "nl", handler: () => { throw new Error("Unauthenticated requests are forbidden"); } });
  await ui.render("return");
  assert.equal(ui.container.querySelector("h1").textContent, "Log in om verder te gaan");
  assert.equal(ui.container.querySelector("section").getAttribute("translate"), "no");
  assert.equal(new URL(ui.container.querySelector("a").href).searchParams.get("callbackUrl"), "/stripe-account-success");
  ui.state.language = "en";
  await ui.render("refresh");
  assert.equal(ui.container.querySelector("h1").textContent, "Sign in to continue");
  assert.equal(new URL(ui.container.querySelector("a").href).searchParams.get("callbackUrl"), "/connect/refresh");
  assert.equal(ui.calls.length, 0);
});

test("a return from incomplete onboarding does not claim success and offers a continuation", async (t) => {
  const ui = await fixture(t, { handler: () => ({ data: { ...disconnected, hasAccount: true, needsMoreInformation: true } }) });
  await ui.render();
  assert.equal(ui.container.querySelector("h1").textContent, "Stripe setup is not complete");
  assert.ok(ui.container.textContent.includes("Continue with Stripe"));
  assert.ok(!ui.container.textContent.includes("Open Stripe dashboard"));
  assert.equal(ui.calls[0].options.headers.Authorization, "Bearer test-token");
  assert.equal(ui.calls[0].options.cache, "no-store");
});

test("a pending verification remains pending until a status retry confirms enabled payouts", async (t) => {
  let status = { ...complete, payoutsEnabled: false, verificationPending: true };
  const ui = await fixture(t, { handler: () => ({ data: status }) });
  await ui.render();
  assert.equal(ui.container.querySelector("h1").textContent, "Stripe is reviewing your details");
  assert.ok(ui.container.textContent.includes("Open Stripe dashboard"));
  status = complete;
  await ui.click("Check status again");
  assert.equal(ui.container.querySelector("h1").textContent, "Stripe account connected");
  assert.ok(ui.container.textContent.includes("Payouts are enabled."));
  ui.state.language = "nl";
  await ui.render();
  assert.equal(ui.container.querySelector("h1").textContent, "Stripe-account gekoppeld");
  assert.ok(ui.container.textContent.includes("Stripe-dashboard openen"));
});

test("a 401 account-status response offers sign-in and its explanation also changes language", async (t) => {
  const ui = await fixture(t, { handler: () => ({ status: 401 }) });
  await ui.render();
  assert.equal(ui.container.querySelector("h1").textContent, "Sign in to continue");
  assert.equal(new URL(ui.container.querySelector("a").href).searchParams.get("callbackUrl"), "/stripe-account-success");
  assert.equal(ui.container.querySelector("button"), null);
  ui.state.language = "nl";
  await ui.render();
  assert.equal(ui.container.querySelector("h1").textContent, "Log in om verder te gaan");
});

test("an expired link requests one fresh authenticated onboarding URL under StrictMode", async (t) => {
  const ui = await fixture(t, { handler: () => ({ data: { url: "https://connect.stripe.com/setup/new-link" } }) });
  await ui.render("refresh");
  assert.equal(ui.calls.length, 1);
  assert.ok(ui.calls[0].url.endsWith("/user/create-stripe-account"));
  assert.equal(ui.calls[0].options.method, "POST");
  assert.equal(ui.calls[0].options.headers.Authorization, "Bearer test-token");
  assert.deepEqual(ui.redirects, ["https://connect.stripe.com/setup/new-link"]);
  ui.state.language = "nl";
  await ui.render("refresh");
  assert.equal(ui.calls.length, 1, "Language changes must not create another single-use link");
});

test("failed refreshes are recoverable, localize the error, and reject unexpected redirect hosts", async (t) => {
  let url = "https://malicious.example.test/stripe.com";
  const ui = await fixture(t, { handler: () => ({ data: { url } }) });
  await ui.render("refresh");
  assert.equal(ui.redirects.length, 0);
  assert.equal(ui.container.querySelector("p").textContent, "The server returned an invalid Stripe link.");
  ui.state.language = "nl";
  await ui.render("refresh");
  assert.equal(ui.container.querySelector("p").textContent, "De server heeft een ongeldige Stripe-link teruggestuurd.");
  url = "https://connect.stripe.com/setup/retry";
  await ui.click("Verder met Stripe");
  assert.deepEqual(ui.redirects, [url]);
});

test("unapproved or unverified users receive a useful 403 explanation without onboarding actions", async (t) => {
  const ui = await fixture(t, { handler: () => ({ status: 403 }) });
  await ui.render();
  assert.ok(ui.container.querySelector("p").textContent.includes("Verify your email address"));
  assert.equal(ui.container.querySelector("button"), null);
  assert.equal(ui.redirects.length, 0);
});
