import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-comparar',
  templateUrl: 'comparar.page.html',
  styleUrls: ['comparar.page.scss'],
})
export class CompararPage implements ViewWillEnter {

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Comparar modelos');
  }

}
