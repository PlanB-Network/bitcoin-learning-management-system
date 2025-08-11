import type { LanguageOption } from '#src/types/language.ts';

/**
 * Shared language selection logic used across multiple hooks and components
 */

/**
 * Determines the default language code based on availability and preferences
 * Priority: English (if available) → Original language (if available) → First available
 */
export function getDefaultLanguageCode(
  options: LanguageOption[],
  originalLanguage: string,
): string {
  // First priority: English if available
  const englishAvail = options.find((o) => o.code === 'en' && o.available);
  if (englishAvail) return 'en';

  // Second priority: Original language if available
  const originalAvail = options.find(
    (o) => o.code === originalLanguage && o.available,
  );
  if (originalAvail) return originalLanguage;

  // Last resort: First available language
  const firstAvail = options.find((o) => o.available)?.code;
  return firstAvail ?? originalLanguage;
}

/**
 * Determines the default transcript language code with different priority
 * Priority: Original language (if available) → English (if available) → First available
 */
export function getDefaultTranscriptLanguageCode(
  options: LanguageOption[],
  originalLanguage: string,
): string {
  // First priority: Original language if available
  const originalAvail = options.find(
    (o) => o.code === originalLanguage && o.available,
  );
  if (originalAvail) return originalLanguage;

  // Second priority: English if available
  const englishAvail = options.find((o) => o.code === 'en' && o.available);
  if (englishAvail) return 'en';

  // Last resort: First available language
  const firstAvail = options.find((o) => o.available)?.code;
  return firstAvail ?? '';
}

/**
 * Normalizes language code to lowercase for consistent database queries
 */
export function normalizeLanguageCode(language: string): string {
  return language.toLowerCase();
}

/**
 * Checks if a language is available in the options
 */
export function isLanguageAvailable(
  options: LanguageOption[],
  languageCode: string,
): boolean {
  return options.some((o) => o.code === languageCode && o.available);
}
