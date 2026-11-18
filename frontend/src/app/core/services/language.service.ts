import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

export type SupportedLanguage = 'en';

export interface TranslationDictionary {
  topAnnouncement: string;
  home: string;
  collections: string;
  newArrivals: string;
  dashboard: string;
  cart: string;
  login: string;
  register: string;
  dropBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  exploreBtn: string;
  loginBtn: string;
  v1Title: string;
  v1Desc: string;
  v2Title: string;
  v2Desc: string;
  v3Title: string;
  v3Desc: string;
  v4Title: string;
  v4Desc: string;
  featuredBadge: string;
  featuredTitle: string;
  featuredSubtitle: string;
  viewAll: string;
  addCart: string;
  promoBadge: string;
  promoTitle: string;
  promoCode: string;
  joinBtn: string;
  aboutText: string;
  collectionsTitle: string;
  supportTitle: string;
  newsletterTitle: string;
  newsletterDesc: string;
  emailPlaceholder: string;
  subscribeBtn: string;
  rightsText: string;
  terms: string;
  privacy: string;
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  rememberMe: string;
  forgotPassword: string;
  loginSubmit: string;
  noAccount: string;
  registerLink: string;
  registerTitle: string;
  registerSubtitle: string;
  fullNameLabel: string;
  confirmPasswordLabel: string;
  registerSubmit: string;
  hasAccount: string;
  loginLink: string;
}

const englishTranslations: TranslationDictionary = {
  topAnnouncement: 'COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS OVER $250 • NEW SEASON DROP ACTIVE',
  home: 'Home',
  collections: 'Collections',
  newArrivals: 'New Drops',
  dashboard: 'Dashboard',
  cart: 'Bag',
  login: 'Sign In',
  register: 'Sign Up',
  dropBadge: 'CAPSULE 04 • AUTUMN / WINTER 2026',
  heroTitle1: 'Redefining the aesthetic of',
  heroTitle2: 'contemporary luxury',
  heroSubtitle:
    'A collision of brutalist silhouettes and refined tailoring for the next generation. Handcrafted tactile artifacts engineered between Tokyo urban kineticism and Parisian couture salons.',
  exploreBtn: 'Explore Capsule 04',
  loginBtn: 'Member Sign In',
  v1Title: 'Tactile Textiles',
  v1Desc: 'Custom milled 480gsm loopback organic cotton and Italian combed wool.',
  v2Title: '30-Day White Glove Returns',
  v2Desc: 'Complimentary worldwide return and fitting consultation service.',
  v3Title: 'Express Armored Transit',
  v3Desc: 'Priority 24-48 hour courier dispatch with tamper-evident seal.',
  v4Title: 'Private Atelier Client Care',
  v4Desc: 'Direct line to Parisian style advisors and bespoke runway alterations.',
  featuredBadge: 'Runway Archive Acquisitions',
  featuredTitle: 'Curated Drops',
  featuredSubtitle: 'Architectural silhouettes and avant-garde streetwear essentials',
  viewAll: 'Explore Entire Archive',
  addCart: '+ Add To Bag',
  promoBadge: 'WEAREZ MAISON PRIVILEGE',
  promoTitle: 'Unlock 15% complimentary credit on your first acquisition',
  promoCode: 'Apply protocol code WEAREZ15 at checkout console.',
  joinBtn: 'Request Invitation',
  aboutText:
    'Architectural silhouettes and hyper-curated contemporary luxury engineered for the global avant-garde. Designed in Paris & Tokyo.',
  collectionsTitle: 'Collections',
  supportTitle: 'Client Care',
  newsletterTitle: 'VIP Newsletter Protocol',
  newsletterDesc: 'Receive guaranteed drop priority 48 hours prior to global release.',
  emailPlaceholder: 'Enter your personal email protocol...',
  subscribeBtn: 'Join Inner Circle',
  rightsText: '© 2026 WEAREZ Global Luxury Maison. All Rights Reserved.',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  loginTitle: 'Sign In',
  loginSubtitle: 'Sign in to access your WEAREZ account',
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot password?',
  loginSubmit: 'Sign In',
  noAccount: "Don't have an account?",
  registerLink: 'Create an account',
  registerTitle: 'Create New Account',
  registerSubtitle: 'Join WEAREZ CLUB for priority runway access',
  fullNameLabel: 'Full Name',
  confirmPasswordLabel: 'Confirm Password',
  registerSubmit: 'Create Account',
  hasAccount: 'Already have an account?',
  loginLink: 'Sign in here',
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  readonly currentLang = signal<SupportedLanguage>('en');

  readonly t = computed(() => englishTranslations);

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const root = this.document.documentElement;
      root.lang = 'en';
      root.dataset['lang'] = 'en';
      if (this.document.body) {
        this.document.body.dataset['lang'] = 'en';
      }
      localStorage.setItem('wearez_lang', 'en');
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    this.currentLang.set(lang);
  }

  toggle(): void {
    this.setLanguage('en');
  }
}
