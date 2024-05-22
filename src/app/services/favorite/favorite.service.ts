/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(
    public utils: UtilsService,
    public cryptoService: CryptoService,
    public dbService: DataBaseService,
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
    const recoveredFavorites = this.recoveryFavorites(true);

    if (recoveredFavorites && recoveredFavorites.length) {
      const recIdx = recoveredFavorites.findIndex(rec => rec._id === model._id);

      if (recIdx > -1) {
        if (recoveredFavorites[recIdx]['removed']) {
          delete recoveredFavorites[recIdx]['removed'];
          this.saveFavorites(recoveredFavorites);
        } else {
          recoveredFavorites[recIdx]['removed'] = true;
          this.saveFavorites(recoveredFavorites);
          this.syncFavorites();
          return false;
        }
      } else {
        recoveredFavorites.push(this.resumeModelPayload(model));
        this.saveFavorites(recoveredFavorites);
      }
    } else {
      this.saveFavorites([this.resumeModelPayload(model)]);
    }

    this.syncFavorites();
    return true;
  }

  public resumeModelPayload(model: any): any {
    return {
      _id: model._id,
      name: model.name,
      url: model.url,
      brand: {
        _id: model.brand._id,
        name: model.brand.name,
        url: model.brand.url
      }
    };
  }

  public saveFavorites(favoritesArray: any[]): void {
    const jwtData = this.cryptoService.encondeJwt(favoritesArray);
    this.utils.localStorageSetItem('favorites', jwtData);
  }

  public recoveryFavorites(includeRemoved?: boolean): any[] {
    const jwtData = this.utils.localStorageGetItem('favorites');
    const decoded = this.cryptoService.decodeJwt(jwtData) || [];

    if (!includeRemoved) {
      for (let i = 0; i < decoded.length; i++) {
        if (decoded[i].removed) {
          decoded.splice(i, 1);
        }
      }
    }

    return decoded;
  }

  public syncFavorites(): void {
    if (this.utils.sessionUser) {
      const userId = this.utils.sessionUser['_id'];
      const baseFavorites = this.utils.sessionUser['favorites'] || [];
      const localFavorites = this.recoveryFavorites(true);

      localFavorites.forEach(fav => {
        if (fav['removed']) {
          const foundIdx = baseFavorites.findIndex(item => item._id === fav['_id']);

          if (foundIdx > -1) {
            baseFavorites.splice(foundIdx, 1);
          }
        } else {
          const found = baseFavorites.find(item => item._id === fav['_id']);

          if (!found) {
            baseFavorites.push(fav);
          }
        }
      });

      const data = {
        favorites: baseFavorites
      };

      const jwtData = { data: this.cryptoService.encondeJwt(data)};
      const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
        res => {
          if (!subCustomers.closed) { subCustomers.unsubscribe(); }
          this.utils.sessionUser['favorites'] = res['saved']['favorites'];
          this.saveFavorites(res['saved']['favorites']);
        }
      );
    }
  }
}
