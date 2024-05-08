import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-termo-de-uso',
  templateUrl: './termo-de-uso.page.html',
  styleUrls: ['./termo-de-uso.page.scss'],
})
export class TermoDeUsoPage implements ViewWillEnter {

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Termo de uso');
  }

}
