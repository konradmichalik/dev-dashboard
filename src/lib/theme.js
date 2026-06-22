const KEY = 'theme';

/** Current theme as resolved by the inline head script ('light' | 'dark'). */
export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Apply a theme to the document and persist the choice. */
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // ignore unavailable storage
  }
}
