import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  translations: Record<string, string> | null = null;
  currentLanguage: 'en' | 'ar' = 'en';

  constructor(private http: HttpClient) {}

  async loadTranslations(lang: 'en' | 'ar'): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get<Record<string, string>>(`assets/i18n/${lang}.json`)
      );
      console.log('Loaded translations:', res);
      this.translations = res;
      this.currentLanguage = lang;
      localStorage.setItem('lang', 'en');
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      return true;
    } catch {
      return false;
    }
  }
  t(key: string): string {
    if (!this.translations) return key;
    const keys = key.split('.');
    let value: unknown = this.translations;
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, string>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }
  getLanguage(): 'en' | 'ar' {
    return this.currentLanguage;
  }
}
