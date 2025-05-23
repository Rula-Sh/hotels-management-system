import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './services/i18n.service';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgbToastModule],
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

  test: any = false;
  async getLang() {
    this.lang = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
    await this.i18nService.loadTranslations(this.lang);
  }
}
