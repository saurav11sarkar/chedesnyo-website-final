const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const test = require("node:test");
const ts = require("typescript");
const { JSDOM } = require("jsdom");
const React = require("react");
const { createRoot } = require("react-dom/client");
const { act } = React;

function loadTypeScript(relativePath, mocks = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = compiled.require.bind(compiled);
  compiled.require = (request) =>
    Object.hasOwn(mocks, request) ? mocks[request] : originalRequire(request);
  compiled._compile(outputText, filename);
  return compiled.exports;
}

const { installGoogleTranslateDomPatch } = loadTypeScript("src/lib/google-translate-dom.ts");
const translation = loadTypeScript("src/lib/translation.ts");

function fixture(t, url = "https://www.dealclosedpartner.com/path?keep=1") {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url });
  t.after(() => dom.window.close());
  return dom.window;
}

function install(t, window) {
  const release = installGoogleTranslateDomPatch(window.document.body);
  t.after(release);
  return release;
}

function simulateGoogleTranslation(window, source, value, atomic = false) {
  const font = window.document.createElement("font");
  font.style.verticalAlign = "inherit";
  const inner = window.document.createElement("font");
  inner.style.verticalAlign = "inherit";
  inner.textContent = value;
  font.appendChild(inner);
  const parent = source.parentNode;
  if (atomic) parent.replaceChild(font, source);
  else {
    parent.insertBefore(font, source);
    parent.removeChild(source);
  }
  return font;
}

function exposeWindow(window) {
  const keys = ["window", "document", "navigator", "Node", "HTMLElement", "MutationObserver"];
  const descriptors = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
  const actDescriptor = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
  keys.forEach((key) => Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value: key === "window" ? window : window[key],
  }));
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  return () => {
    keys.forEach((key, index) => {
      if (descriptors[index]) Object.defineProperty(globalThis, key, descriptors[index]);
      else delete globalThis[key];
    });
    if (actDescriptor) Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", actDescriptor);
    else delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  };
}

test("React can insert, update and remove text replaced by Google without losing siblings", (t) => {
  const window = fixture(t);
  const restoreGlobals = exposeWindow(window);
  install(t, window);
  const container = window.document.createElement("div");
  window.document.body.appendChild(container);
  const root = createRoot(container);
  const View = ({ count, prefix = false, show = true }) => React.createElement("p", null,
    prefix && React.createElement("strong", null, "prefix"),
    show && String(count),
    React.createElement("span", null, "end"),
  );
  try {
    act(() => root.render(React.createElement(View, { count: 1 })));
    const source = container.querySelector("p").firstChild;
    simulateGoogleTranslation(window, source, "one");
    act(() => root.render(React.createElement(View, { count: 2, prefix: true })));
    assert.equal(container.querySelector("p").textContent, "prefix2end");
    assert.equal(source.nodeValue, "2");
    assert.equal(source.parentNode, container.querySelector("p"));
    simulateGoogleTranslation(window, source, "two");
    act(() => root.render(React.createElement(View, { count: 2, prefix: true, show: false })));
    assert.equal(container.querySelector("p").textContent, "prefixend");
    assert.equal(container.querySelector("font"), null);
  } finally {
    act(() => root.unmount());
    restoreGlobals();
  }
});

test("known translated references retain inserted and moved nodes in the right order", (t) => {
  const window = fixture(t);
  install(t, window);
  const { document } = window;
  const parent = document.createElement("p");
  const other = document.createElement("p");
  document.body.append(parent, other);
  const source = document.createTextNode("origineel");
  parent.appendChild(source);
  const translated = simulateGoogleTranslation(window, source, "translated");
  const added = document.createElement("b");
  added.textContent = "before";
  assert.equal(parent.insertBefore(added, source), added);
  assert.equal(parent.textContent, "beforetranslated");
  assert.equal(other.appendChild(source), source);
  assert.equal(translated.parentNode, other);
  assert.equal(parent.textContent, "before");
  assert.equal(other.textContent, "translated");
  assert.equal(other.removeChild(source), source);
  assert.equal(other.textContent, "");
});

test("atomic Google replacements and a changed FONT remain associated with original text", async (t) => {
  const window = fixture(t);
  install(t, window);
  const parent = window.document.createElement("p");
  window.document.body.appendChild(parent);
  const source = window.document.createTextNode("origineel");
  parent.appendChild(source);
  const first = simulateGoogleTranslation(window, source, "first", true);
  await Promise.resolve();
  const second = window.document.createElement("font");
  second.style.verticalAlign = "inherit";
  second.textContent = "second";
  parent.replaceChild(second, first);
  source.nodeValue = "new value";
  assert.equal(parent.firstChild, source);
  assert.equal(parent.textContent, "new value");
  assert.equal(parent.querySelector("font"), null);
});

for (const property of ["nodeValue", "data", "textContent"]) {
  test(`${property} changes restore original Text instead of leaving stale translation`, (t) => {
    const window = fixture(t);
    install(t, window);
    const parent = window.document.createElement("p");
    window.document.body.appendChild(parent);
    const source = window.document.createTextNode("origineel");
    parent.appendChild(source);
    simulateGoogleTranslation(window, source, "translated");
    source[property] = "updated";
    assert.equal(parent.firstChild, source);
    assert.equal(parent.textContent, "updated");
  });
}

test("replacing translated text removes its wrapper and preserves new content", (t) => {
  const window = fixture(t);
  install(t, window);
  const parent = window.document.createElement("p");
  window.document.body.appendChild(parent);
  const source = window.document.createTextNode("origineel");
  parent.appendChild(source);
  simulateGoogleTranslation(window, source, "translated");
  assert.equal(parent.replaceChild(source, source), source);
  const added = window.document.createElement("em");
  added.textContent = "replacement";
  assert.equal(parent.replaceChild(added, source), source);
  assert.equal(parent.textContent, "replacement");
  assert.equal(parent.querySelector("font"), null);
});

test("unrelated DOM mismatches still throw and leave their actual parent untouched", (t) => {
  const window = fixture(t);
  install(t, window);
  const parent = window.document.createElement("p");
  const other = window.document.createElement("p");
  window.document.body.append(parent, other);
  const source = window.document.createTextNode("unrelated");
  other.appendChild(source);
  assert.throws(() => parent.removeChild(source), { name: "NotFoundError" });
  assert.equal(source.parentNode, other);
  assert.throws(() => parent.insertBefore(window.document.createTextNode("new"), source), {
    name: "NotFoundError",
  });
  assert.equal(parent.childNodes.length, 0);
  const plainFont = window.document.createElement("font");
  plainFont.textContent = "ordinary font";
  other.replaceChild(plainFont, source);
  assert.throws(() => other.removeChild(source), { name: "NotFoundError" });
  assert.equal(plainFont.parentNode, other);
});

test("a text node moved elsewhere is never removed through an adjacent Google FONT", (t) => {
  const window = fixture(t);
  install(t, window);
  const parent = window.document.createElement("p");
  const other = window.document.createElement("p");
  window.document.body.append(parent, other);
  const source = window.document.createTextNode("moved by another owner");
  parent.appendChild(source);
  const font = window.document.createElement("font");
  font.style.verticalAlign = "inherit";
  font.textContent = "neighbor";
  parent.insertBefore(font, source);
  other.appendChild(source);
  assert.throws(() => parent.removeChild(source), { name: "NotFoundError" });
  assert.equal(font.parentNode, parent);
  assert.equal(source.parentNode, other);
});

test("cleanup is idempotent, supports concurrent users and restores native descriptors", (t) => {
  const window = fixture(t);
  const prototype = window.Node.prototype;
  const originalRemove = prototype.removeChild;
  const originalInsert = prototype.insertBefore;
  const originalAppend = prototype.appendChild;
  const originalReplace = prototype.replaceChild;
  const originalNodeValue = Object.getOwnPropertyDescriptor(prototype, "nodeValue");
  const releaseFirst = installGoogleTranslateDomPatch(window.document.body);
  const releaseSecond = installGoogleTranslateDomPatch(window.document.body);
  releaseFirst();
  releaseFirst();
  assert.notEqual(prototype.removeChild, originalRemove);
  releaseSecond();
  assert.equal(prototype.removeChild, originalRemove);
  assert.equal(prototype.insertBefore, originalInsert);
  assert.equal(prototype.appendChild, originalAppend);
  assert.equal(prototype.replaceChild, originalReplace);
  assert.deepEqual(Object.getOwnPropertyDescriptor(prototype, "nodeValue"), originalNodeValue);
  // This is the effect cleanup/setup sequence React Strict Mode performs.
  const releaseReplay = installGoogleTranslateDomPatch(window.document.body);
  assert.notEqual(prototype.removeChild, originalRemove);
  releaseReplay();
  assert.equal(prototype.removeChild, originalRemove);
});

test("language cookie parsing handles malformed, legacy and conflicting cookies", () => {
  for (const header of ["", "garbage", "site-language=fr", "googtrans=/nl/fr", "googtrans=%E0%A4%A"]) {
    assert.equal(translation.readLanguage(header), "nl", header);
  }
  assert.equal(translation.readLanguage("googtrans=/auto/en"), "en");
  assert.equal(translation.readLanguage("googtrans=%2Fnl%2Fen"), "en");
  assert.equal(translation.readLanguage("googtrans=/nl/en; site-language=nl; googtrans=/auto/en"), "nl");
  assert.equal(translation.readLanguage("googtrans=/nl/nl; site-language=en; googtrans=/nl/nl"), "en");
  assert.equal(translation.readLanguage("site-language=unsupported; googtrans=/nl/en"), "en");
});

test("cookie domain candidates cover host and parent domains, excluding local addresses", () => {
  for (const hostname of ["localhost", "127.0.0.1", "::1", "[::1]"]) {
    assert.deepEqual(translation.cookieDomains(hostname), []);
  }
  assert.deepEqual(translation.cookieDomains("dealclosedpartner.com"), ["dealclosedpartner.com"]);
  assert.deepEqual(translation.cookieDomains("www.dealclosedpartner.com"), [
    "www.dealclosedpartner.com", "dealclosedpartner.com",
  ]);
});

test("saving language clears duplicate Google cookies and writes persistent source/target", (t) => {
  const window = fixture(t);
  const restoreGlobals = exposeWindow(window);
  const writes = [];
  Object.defineProperty(window.document, "cookie", {
    configurable: true,
    get: () => "",
    set: (value) => writes.push(value),
  });
  try {
    translation.saveLanguage("en");
    assert.equal(writes.length, 5);
    assert.match(writes[0], /^googtrans=; Max-Age=0;/);
    assert.match(writes[1], /Domain=www\.dealclosedpartner\.com;/);
    assert.match(writes[2], /Domain=dealclosedpartner\.com;/);
    assert.match(writes[3], /^site-language=en; Max-Age=31536000;/);
    assert.match(writes[4], /^googtrans=\/nl\/en; Max-Age=31536000;/);
    for (const write of writes) {
      assert.match(write, /Path=\/; SameSite=Lax; Secure$/);
    }
    translation.saveLanguage("nl");
    assert.match(writes.at(-1), /^googtrans=\/nl\/nl; Max-Age=31536000;/);
  } finally {
    restoreGlobals();
  }
});

test("provider survives Strict Mode and initializes once when Google's callback arrives late", (t) => {
  const window = fixture(t);
  const restoreGlobals = exposeWindow(window);
  const scripts = [];
  const Script = (props) => { scripts.push(props); return null; };
  const { default: TranslateProvider } = loadTypeScript("src/provider/TranslateProvider.tsx", {
    "@/lib/translation": translation,
    "next/script": Script,
  });
  const previousCallback = () => {};
  window.TranslateInit = previousCallback;
  window.document.cookie = "site-language=en; path=/";
  const container = window.document.createElement("div");
  window.document.body.appendChild(container);
  const root = createRoot(container);
  let initialized = 0;
  try {
    act(() => root.render(React.createElement(React.StrictMode, null,
      React.createElement(TranslateProvider, null, React.createElement("p", null, "content")),
    )));
    assert.equal(window.document.documentElement.lang, "en");
    assert.equal(initialized, 0);
    assert.equal(typeof window.TranslateInit, "function");
    // The script arrives after hydration/effect replay; no polling deadline is needed.
    window.google = { translate: { TranslateElement: class {
      constructor(options, id) {
        initialized += 1;
        assert.equal(options.pageLanguage, "nl");
        assert.equal(options.includedLanguages, "nl,en");
        const combo = window.document.createElement("select");
        combo.className = "goog-te-combo";
        window.document.getElementById(id).appendChild(combo);
      }
    } } };
    act(() => { window.TranslateInit(); window.TranslateInit(); scripts.at(-1).onReady(); });
    assert.equal(initialized, 1);
    assert.equal(window.document.querySelectorAll(".goog-te-combo").length, 1);
  } finally {
    act(() => root.unmount());
    assert.equal(window.TranslateInit, previousCallback);
    restoreGlobals();
  }
});
