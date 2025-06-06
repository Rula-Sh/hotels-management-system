import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nPipe } from '../../../pipes/i18n.pipe';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, I18nPipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}
