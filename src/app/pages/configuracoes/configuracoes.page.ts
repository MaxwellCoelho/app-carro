import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { ViewWillEnter } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
})
export class ConfiguracoesPage implements ViewWillEnter {

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Configurações');
  }

}
