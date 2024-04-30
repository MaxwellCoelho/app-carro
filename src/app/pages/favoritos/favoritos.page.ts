import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-favoritos',
  templateUrl: 'favoritos.page.html',
  styleUrls: ['favoritos.page.scss'],
})
export class FavoritosPage implements ViewWillEnter {

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Meus favoritos');
  }

}
