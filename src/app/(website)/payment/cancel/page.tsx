import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Betaling geannuleerd</h1>
      <p className="mt-4 text-gray-600">Er is niets afgeschreven. Je kunt teruggaan en het later opnieuw proberen.</p>
      <Link className="mt-8 inline-flex rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800" href="/">Terug naar home</Link>
    </main>
  );
}
