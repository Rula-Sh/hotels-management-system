import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({
  name: 'translate',
  pure: false,
  // when pure is true, the pipe is pure, meaning that the transform() method is invoked only when its input arguments change. Pipes are pure by default.
  // If the pipe has internal state (that is, the result depends on state other than its arguments), set pure to false. In this case, the pipe is invoked on each change-detection cycle, even if the arguments have not changed.
})
export class I18nPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(key: string): string {
    return this.i18n.t(key);
  }
}
