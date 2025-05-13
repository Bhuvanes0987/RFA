import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCamelCase]',
  standalone: true
})
export class CamelCaseDirective {

  constructor() { }

}
 
@Directive({
  selector: '[appNoInitialSpace]',
  standalone: true
})
export class NoInitialSpaceDirective {
  constructor(private el: ElementRef) {}
 
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' && this.el.nativeElement.selectionStart === 0) {
      event.preventDefault();
    }
  }
}
 
@Directive({
  selector: '[appCaseSensitive]',
  standalone: true
})
export class CaseSensitiveDirective {
 
  constructor(private el: ElementRef) {}
 
  @HostListener('input', ['$event'])
  onInput(event: any): void {
    let inputValue = event.target.value;

    // Prevent leading space by trimming the inputValue and reassigning it
    if (inputValue.length > 0 && inputValue.charAt(0) === ' ') {
      inputValue = inputValue.trimStart();
    }

    // Convert to Title Case
    event.target.value = this.toTitleCase(inputValue);
  }

  private toTitleCase(input: string): string {
    return input.replace(/\w\S*/g, (word: string) => {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
  }

}
 
 
