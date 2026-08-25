import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Betaling ontvangen</h1>
      <p className="mt-4 text-gray-600">Je betaling wordt veilig verwerkt. De definitieve status verschijnt in je bestelgeschiedenis zodra Stripe de betaling heeft bevestigd.</p>
      <Link className="mt-8 inline-flex rounded-lg bg-green-600 px-5 py-3 font-semibold text-white" href="/enrollment-history">Bekijk bestelgeschiedenis</Link>
    </main>
  );
}
