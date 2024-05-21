import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ViewWillEnter } from '@ionic/angular';
import { FavoriteService } from 'src/app/services/favorite/favorite.service';

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
    public favorite: FavoriteService
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Meus favoritos');
    this.getFavoriteModels();
  }

  public getFavoriteModels(): void {
    this.favoriteModels = this.favorite.recoveryFavorites();
  }

  public removeFavorite(car: any): void {
    this.favorite.addOrRemoveFavorite(car);
    this.getFavoriteModels();
  }
}
