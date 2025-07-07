/**
 * src/utils/debounce.ts
 * (Clone mis à jour de debounce.ts pour vérification indépendante)
 */
export function debounce<F extends (...args: any[]) => void>(
  fn: F,
  wait = 200,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
