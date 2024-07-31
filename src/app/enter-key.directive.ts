import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnterKey]',
})
export class EnterKeyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown.enter', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    event.preventDefault();
    const form = this.el.nativeElement.closest('form');
    if (form) {
      const inputs = Array.from(
        form.querySelectorAll('input, select, textarea')
      );
      const index = inputs.indexOf(this.el.nativeElement);
      if (index > -1 && index < inputs.length - 1) {
        (inputs[index + 1] as HTMLElement).focus();
      }
    }
  }
}
