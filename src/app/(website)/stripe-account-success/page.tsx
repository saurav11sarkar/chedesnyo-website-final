import StripeAccountPanel from "@/components/stripe/StripeAccountPanel";

export default function StripeAccountSuccessPage() {
  return (
    <main className="px-6 py-20">
      <StripeAccountPanel mode="return" />
    </main>
  );
}
