"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/provider/TranslateProvider";

const messages = {
  nl: {
    connectionMissing: "De verbinding met de server is niet ingesteld.",
    sessionExpired: "Je sessie is verlopen. Log opnieuw in om verder te gaan.",
    forbidden: "Verifieer je e-mailadres en controleer of je account is goedgekeurd om Stripe te gebruiken.",
    requestFailed: "De Stripe-verbinding is mislukt. Probeer het opnieuw.",
    noData: "De server heeft geen Stripe-gegevens teruggestuurd.",
    invalidLink: "De server heeft een ongeldige Stripe-link teruggestuurd.",
    connectTitle: "Stripe-account koppelen",
    connectDescription: "Voeg je bankgegevens veilig toe via Stripe om uitbetalingen te ontvangen.",
    refreshTitle: "Stripe-verbinding vernieuwen",
    refreshDescription: "Je wordt doorgestuurd naar een nieuwe Stripe-link.",
    checkingTitle: "Stripe-account controleren",
    checkingDescription: "We halen de actuele status van je account op bij Stripe.",
    loginTitle: "Log in om verder te gaan",
    loginDescription: "Log in met het account waarmee je de Stripe-verbinding bent gestart.",
    unavailableTitle: "Stripe niet beschikbaar",
    unavailableDescription: "Een Stripe-account kan worden gekoppeld met een bedrijfs- of verkoopaccount.",
    errorTitle: "Stripe kon niet worden geopend",
    readyTitle: "Stripe-account gekoppeld",
    readyDescription: "Stripe heeft je accountgegevens ontvangen. Uitbetalingen zijn ingeschakeld.",
    incompleteTitle: "Stripe-account nog niet voltooid",
    incompleteDescription: "Stripe heeft nog aanvullende gegevens nodig. Ga verder om je bankgegevens of accountgegevens aan te vullen.",
    pendingTitle: "Stripe controleert je gegevens",
    restrictedTitle: "Uitbetalingen nog niet ingeschakeld",
    pendingDescription: "Je gegevens zijn ontvangen, maar uitbetalingen zijn nog niet ingeschakeld. Controleer je Stripe-dashboard of bekijk de status opnieuw.",
    login: "Inloggen",
    continue: "Verder met Stripe",
    connect: "Stripe-account koppelen",
    dashboard: "Stripe-dashboard openen",
    retry: "Status opnieuw controleren",
    profile: "Terug naar profiel",
  },
  en: {
    connectionMissing: "The server connection has not been configured.",
    sessionExpired: "Your session has expired. Sign in again to continue.",
    forbidden: "Verify your email address and make sure your account is approved to use Stripe.",
    requestFailed: "The Stripe connection failed. Please try again.",
    noData: "The server did not return Stripe account information.",
    invalidLink: "The server returned an invalid Stripe link.",
    connectTitle: "Connect your Stripe account",
    connectDescription: "Add your bank details securely through Stripe to receive payouts.",
    refreshTitle: "Refreshing your Stripe connection",
    refreshDescription: "You will be redirected to a new Stripe link.",
    checkingTitle: "Checking your Stripe account",
    checkingDescription: "We are checking your current account status with Stripe.",
    loginTitle: "Sign in to continue",
    loginDescription: "Sign in with the account you used to start connecting to Stripe.",
    unavailableTitle: "Stripe is not available",
    unavailableDescription: "A Stripe account can be connected with a business or sales account.",
    errorTitle: "Stripe could not be opened",
    readyTitle: "Stripe account connected",
    readyDescription: "Stripe has received your account details. Payouts are enabled.",
    incompleteTitle: "Stripe setup is not complete",
    incompleteDescription: "Stripe needs more information. Continue to complete your bank or account details.",
    pendingTitle: "Stripe is reviewing your details",
    restrictedTitle: "Payouts are not enabled yet",
    pendingDescription: "Your details have been received, but payouts are not enabled yet. Check your Stripe dashboard or check the status again.",
    login: "Sign in",
    continue: "Continue with Stripe",
    connect: "Connect Stripe account",
    dashboard: "Open Stripe dashboard",
    retry: "Check status again",
    profile: "Back to profile",
  },
};

type StripeAccountStatus = {
  hasAccount: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  needsMoreInformation: boolean;
  verificationPending: boolean;
};

class StripeRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function stripeRequest<T>(
  path: string,
  token: string,
  copy: typeof messages.nl,
  method = "GET",
  signal?: AbortSignal,
): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) throw new Error(copy.connectionMissing);

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/user/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new StripeRequestError(
      response.status === 401
        ? copy.sessionExpired
        : response.status === 403 ? copy.forbidden : copy.requestFailed,
      response.status,
    );
  }
  if (!result.data) throw new Error(copy.noData);
  return result.data as T;
}

export default function StripeAccountPanel({
  mode = "manage",
}: {
  mode?: "manage" | "return" | "refresh";
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { language } = useLanguage();
  const copy = messages[language];
  const queryClient = useQueryClient();
  const token = session?.user?.accessToken || "";
  const allowed = ["business", "seles"].includes(session?.user?.role || "");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const requestController = useRef<AbortController | null>(null);
  const autoRefreshToken = useRef<string | null>(null);
  const callbackPath = mode === "return"
    ? "/stripe-account-success"
    : mode === "refresh" ? "/connect/refresh" : "/add_bank_account";
  const signInUrl = `/signin?callbackUrl=${encodeURIComponent(callbackPath)}`;

  const accountQuery = useQuery({
    queryKey: ["stripeAccountStatus", session?.user?.id],
    queryFn: ({ signal }) => stripeRequest<StripeAccountStatus>(
      "stripe-account-status", token, copy, "GET", signal,
    ),
    enabled: sessionStatus === "authenticated" && !!token && allowed && mode !== "refresh",
    retry: false,
    staleTime: 0,
  });

  const redirectToStripe = useCallback(async (target: "onboarding" | "dashboard") => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setBusy(true);
    setActionError(null);
    try {
      const result = await stripeRequest<{ url: string }>(
        target === "onboarding" ? "create-stripe-account" : "dashboard-link",
        token,
        copy,
        target === "onboarding" ? "POST" : "GET",
        controller.signal,
      );
      const url = new URL(result.url);
      if (url.protocol !== "https:" || !(url.hostname === "stripe.com" || url.hostname.endsWith(".stripe.com"))) {
        throw new Error(copy.invalidLink);
      }
      if (!controller.signal.aborted) window.location.assign(url.toString());
    } catch (error) {
      if (!controller.signal.aborted) {
        setActionError(error instanceof Error ? error : new Error(copy.requestFailed));
      }
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, [token, copy]);

  useEffect(() => () => requestController.current?.abort(), []);

  // Stripe's expired links must be replaced with a new authenticated Account Link.
  useEffect(() => {
    if (mode !== "refresh" || sessionStatus !== "authenticated" || !token || !allowed) return;
    if (autoRefreshToken.current === token) return;
    const timer = window.setTimeout(() => {
      autoRefreshToken.current = token;
      void redirectToStripe("onboarding");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mode, sessionStatus, token, allowed, redirectToStripe]);

  useEffect(() => {
    if (mode === "return" && accountQuery.data) {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    }
  }, [mode, accountQuery.data, queryClient]);

  const account = accountQuery.data;
  const error = actionError || accountQuery.error;
  const needsSignIn = sessionStatus === "unauthenticated" ||
    (sessionStatus === "authenticated" && !token) ||
    (error instanceof StripeRequestError && error.status === 401);
  const loading = sessionStatus === "loading" || busy ||
    (mode === "refresh" && sessionStatus === "authenticated" && !!token && allowed && !actionError) ||
    (sessionStatus === "authenticated" && !!token && allowed && mode !== "refresh" && accountQuery.isPending);
  const ready = !!account?.detailsSubmitted && !!account?.payoutsEnabled && !account?.needsMoreInformation;

  let title = copy.connectTitle;
  let description = copy.connectDescription;
  if (loading) {
    title = mode === "refresh" ? copy.refreshTitle : copy.checkingTitle;
    description = mode === "refresh" ? copy.refreshDescription : copy.checkingDescription;
  } else if (needsSignIn) {
    title = copy.loginTitle;
    description = copy.loginDescription;
  } else if (!allowed) {
    title = copy.unavailableTitle;
    description = copy.unavailableDescription;
  } else if (error) {
    title = copy.errorTitle;
    description = error.message;
  } else if (ready) {
    title = copy.readyTitle;
    description = copy.readyDescription;
  } else if (account?.needsMoreInformation) {
    title = copy.incompleteTitle;
    description = copy.incompleteDescription;
  } else if (account?.hasAccount) {
    title = account.verificationPending ? copy.pendingTitle : copy.restrictedTitle;
    description = copy.pendingDescription;
  }

  return (
    <section translate="no" className="notranslate mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
      <div aria-live="polite" aria-busy={loading}>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-4 text-gray-600">{description}</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {needsSignIn ? (
          <Link href={signInUrl} className="rounded-full bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">{copy.login}</Link>
        ) : allowed && !loading && !(error instanceof StripeRequestError && error.status === 403) ? (
          <>
            {(mode === "refresh" || !account?.hasAccount || account.needsMoreInformation || !account.detailsSubmitted) && (
              <Button onClick={() => { void redirectToStripe("onboarding"); }} className="h-auto rounded-full bg-green-700 px-6 py-3 hover:bg-green-800">
                {account?.hasAccount || mode === "refresh" ? copy.continue : copy.connect}
              </Button>
            )}
            {account?.detailsSubmitted && (
              <Button onClick={() => { void redirectToStripe("dashboard"); }} className="h-auto rounded-full bg-green-700 px-6 py-3 hover:bg-green-800">{copy.dashboard}</Button>
            )}
            {mode !== "refresh" && (
              <Button variant="outline" disabled={accountQuery.isFetching} onClick={() => { setActionError(null); void accountQuery.refetch(); }} className="h-auto rounded-full px-6 py-3">{copy.retry}</Button>
            )}
          </>
        ) : null}
        <Link href="/profile" className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">{copy.profile}</Link>
      </div>
    </section>
  );
}
