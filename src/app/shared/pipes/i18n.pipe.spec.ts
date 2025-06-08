import { I18nPipe } from './i18n.pipe';
import { I18nService } from '../../core/services/i18n.service';

describe('I18nPipe', () => {
  it('create an instance', () => {
    const mockI18nService = {
      t: (key: string) => key
    } as I18nService;

    const pipe = new I18nPipe(mockI18nService);
    expect(pipe).toBeTruthy();
  });
});
