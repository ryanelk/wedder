import { useEffect, useState } from 'react';

const KEY = 'wp-theme';
const systemTheme = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const savedTheme = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

// Follows the system setting until you pick a theme; your pick is remembered in this browser.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || savedTheme() || systemTheme());

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (!savedTheme()) setTheme(systemTheme()); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
    setTheme(next);
  };

  return (
    <button className="theme-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Light or dark mode">
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  );
}
