import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-comparar',
  templateUrl: 'comparar.page.html',
  styleUrls: ['comparar.page.scss'],
})
export class CompararPage {

  public nav = NAVIGATION;

  constructor() {}

}
