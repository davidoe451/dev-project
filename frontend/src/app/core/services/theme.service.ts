import { DOCUMENT } from '@angular/common';
import { Injectable, signal, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(false);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wearez_theme');
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const initialDark = saved ? saved === 'dark' : !!prefersDark;
      this.setTheme(initialDark);
    }
  }

  toggle(): void {
    this.setTheme(!this.isDark());
  }

  private setTheme(dark: boolean): void {
    this.isDark.set(dark);
    const root = this.document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.dataset['theme'] = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset['theme'] = 'light';
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('wearez_theme', dark ? 'dark' : 'light');
    }
  }
}

