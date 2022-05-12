import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-garagem',
  templateUrl: 'garagem.page.html',
  styleUrls: ['garagem.page.scss'],
})
export class GaragemPage {

  public nav = NAVIGATION;

  constructor() {}

}
