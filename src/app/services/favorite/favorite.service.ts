/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(
    public utils: UtilsService,
    public cryptoService: CryptoService,
  ) { }

  public isFavorite(model: any): boolean {
    const recoveredFavorites = this.recoveryFavorites();

    if (recoveredFavorites && recoveredFavorites.length) {
      const recIdx = recoveredFavorites.findIndex(rec => rec._id === model._id);

      if (recIdx > -1) {
        return true;
      }
    }

    return false;
  }

  public addOrRemoveFavorite(model: any): boolean {
    const recoveredFavorites = this.recoveryFavorites();

    if (recoveredFavorites && recoveredFavorites.length) {
      const recIdx = recoveredFavorites.findIndex(rec => rec._id === model._id);

      if (recIdx > -1) {
        recoveredFavorites.splice(recIdx, 1);
        this.saveFavorites(recoveredFavorites);
        return false;
      } else {
        recoveredFavorites.push(model);
        this.saveFavorites(recoveredFavorites);
      }
    } else {
      this.saveFavorites([model]);
    }

    return true;
  }

  public saveFavorites(favoritesArray: any[]): void {
    const jwtData = this.cryptoService.encondeJwt(favoritesArray);
    this.utils.localStorageSetItem('favorites', jwtData);
  }

  public recoveryFavorites(): any[] {
    const jwtData = this.utils.localStorageGetItem('favorites');
    return this.cryptoService.decodeJwt(jwtData);
  }
}
