"use client";

/**
 * Route error boundary: one human-readable message, a retry action and no
 * technical details leaked to the visitor (project.md §63, §114).
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
        Не вдалося завантажити новини
      </h1>
      <p className="mt-3 text-zinc-600">
        Сталася помилка під час отримання даних із RSS-джерел. Спробуйте
        ще раз за кілька секунд.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-10 rounded-sm bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Спробувати ще раз
      </button>
    </main>
  );
}
