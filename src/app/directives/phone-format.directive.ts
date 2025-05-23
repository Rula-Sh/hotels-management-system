import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPhoneFormat]',
})
export class PhoneFormatDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, ''); // remove non-digit characters

    // Apply formatting: 3-3-4 (e.g. 079 814 8433)
    if (value.length > 3 && value.length <= 6) {
      value = `${value.slice(0, 3)} ${value.slice(3)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`;
    }

    input.value = value;
  }
}
