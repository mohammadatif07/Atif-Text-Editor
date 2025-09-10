
export interface GrammarError {
  errorText: string;
  explanation: string;
  suggestions: string[];
}

export interface TranslationResult {
  directTranslation: string;
  improvedTranslation: string;
}

export enum ActiveTab {
  Grammar = 'GRAMMAR',
  Translate = 'TRANSLATE',
}
