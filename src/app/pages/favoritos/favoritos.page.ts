/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ViewWillEnter } from '@ionic/angular';
import { FavoriteService } from 'src/app/services/favorite/favorite.service';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-favoritos',
  templateUrl: 'favoritos.page.html',
  styleUrls: ['favoritos.page.scss'],
})
export class FavoritosPage implements ViewWillEnter {

  public nav = NAVIGATION;
  public favoriteModels = [];

  constructor(
    public utils: UtilsService,
    public favorite: FavoriteService,
    public router: Router,
    public toastController: ToastController,
    public alertController: AlertController
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Meus favoritos', 'Opiniões reais e sincera dos donos de carros de todas as marcas e modelos.');
    this.getFavoriteModels();
  }

  public getFavoriteModels(): void {
    const recovered = this.favorite.recoveryFavorites();
    const lastUser = this.utils.localStorageGetItem('lastUser');
    const from = lastUser ? lastUser : 'local';
    const favorites = recovered[from];
    this.favoriteModels = favorites ? favorites.reverse() : [];

    this.favoriteModels.forEach(fav => {
      fav['img'] = this.utils.getModelImg(fav['url'], fav['generation']);
    });
  }

  public clickCarItem(page: string, brand: string, model: string) {
    const pageUrl = `/${page}/${brand}/${model}`;
    this.router.navigate([pageUrl]);
  }

  public clickOtherCars() {
    this.router.navigate(['/busca']);
  }

  public showConfirmAlert(car: any) {
    const alertMessage = `Deseja realmente remover o <strong>${car['brand']['name']} ${car['name']}</strong> de seus favoritos?`;

    const confirmHandler = () => {
      this.favorite.addOrRemoveFavorite(car);
      this.showFavoriteToast(car);
      this.getFavoriteModels();
    };

    const alertObj = {
      header: 'Atenção!',
      message: alertMessage,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          id: 'cancel-button'
        }, {
          text: 'Confirmar',
          id: 'confirm-button',
          handler: confirmHandler
        }
      ]
    };

    this.alertController.create(alertObj).then(alert => {
      alert.present();
    });
  }

  public showFavoriteToast(car: string): void {
    this.toastController.create({
      header: 'Favoritos:',
      message: `${car['brand']['name']} ${car['name']} removido com sucesso!`,
      duration: 4000,
      position: 'middle',
      icon: `${this.nav.favorite.icon}-outline`,
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
