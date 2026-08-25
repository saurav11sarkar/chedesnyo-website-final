export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900">Contact</h1>
      <p className="mt-6 text-lg text-gray-600">Heb je een vraag over je account, opdracht, cursus of betaling? Neem contact op met ons supportteam.</p>
      <a className="mt-8 inline-flex rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700" href="mailto:support@dealclosed.nl">
        E-mail support
      </a>
    </main>
  );
}
