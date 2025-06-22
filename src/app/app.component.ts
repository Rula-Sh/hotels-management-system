import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n.service';
import { HeaderComponent } from './shared/components/layout/header/header.component';
import { FooterComponent } from './shared/components/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hotels-management-system';
  lang: 'en' | 'ar' = 'en';
  constructor(private titleService: Title, private i18nService: I18nService) {}

  async ngOnInit() {
    await this.getLang();
    this.titleService.setTitle(this.i18nService.t('app.title'));
  }

  async getLang() {
    this.lang = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
    await this.i18nService.loadTranslations(this.lang);
  }
}
