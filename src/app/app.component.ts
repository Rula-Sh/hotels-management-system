import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './services/i18n.service';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hotels-management-system';
  constructor(private titleService: Title, private i18nService: I18nService) {}

  async ngOnInit() {
    await this.getLang();
    this.titleService.setTitle(this.i18nService.t('app.title'));
  }

  test: any = false;
  async getLang() {
    const lang = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
    const result = await this.i18nService.loadTranslations(lang);
    this.test = typeof result === 'boolean' ? result : false;
  }
}
