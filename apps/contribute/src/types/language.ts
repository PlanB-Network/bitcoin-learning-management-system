/**
 * Shared language-related types used across the contribute app
 */

export interface LanguageOption {
  code: string;
  name: string;
  available: boolean;
}

export interface LanguageSelectionHook {
  options: LanguageOption[];
  loading: boolean;
  error: Error | null;
  selected: string;
  setSelected: (lang: string) => void;
}

export interface TranscriptHook extends LanguageSelectionHook {
  contentCache: Record<string, string | null>;
  ensureContentLoaded: (lang: string) => Promise<void>;
}
