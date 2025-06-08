import { Component } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { I18nPipe } from '../../../pipes/i18n.pipe';

@Component({
  selector: 'app-footer',
  imports: [I18nPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private i18nService: I18nService) {}

  lang: 'en' | 'ar' = 'en';

  changeLanguage(lang: 'en' | 'ar') {
    this.i18nService.loadTranslations(lang);
    this.lang = lang;
  }
}
