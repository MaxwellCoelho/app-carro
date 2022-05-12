import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-melhores',
  templateUrl: 'melhores.page.html',
  styleUrls: ['melhores.page.scss'],
})
export class MelhoresPage {

  public nav = NAVIGATION;

  constructor() {}

}
