'use client';

export type AuthIntent = 'signin' | 'workspace';

/**
 * Play the circular-reveal exit from the submit button, then hand off to the
 * destination page. The destination reads `tf-intro` and plays the welcome
 * curtain. Skipped entirely for reduced-motion users.
 */
export async function playAuthExit(form: HTMLFormElement | null, intent: AuthIntent) {
  sessionStorage.setItem('tf-intro', intent);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const rect = button?.getBoundingClientRect();
  const root = document.documentElement;
  root.style.setProperty('--veil-x', rect ? `${rect.left + rect.width / 2}px` : '50%');
  root.style.setProperty('--veil-y', rect ? `${rect.top + rect.height / 2}px` : '50%');

  document.body.classList.add('auth-leaving');
  await new Promise((resolve) => window.setTimeout(resolve, 700));
}
