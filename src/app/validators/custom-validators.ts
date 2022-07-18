import { Validators, AbstractControl } from '@angular/forms';

export class CustomValidators extends Validators {

  static maxYear(control: AbstractControl): any {

    if (control.value && control.value > 2021) {
        return false;
    }

    return true;
  }
}
