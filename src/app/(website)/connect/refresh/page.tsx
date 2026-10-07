import StripeAccountPanel from "@/components/stripe/StripeAccountPanel";

export default function StripeConnectRefreshPage() {
  return (
    <main className="px-6 py-20">
      <StripeAccountPanel mode="refresh" />
    </main>
  );
}
