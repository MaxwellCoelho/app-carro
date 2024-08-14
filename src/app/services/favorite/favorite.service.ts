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
    const lastUser = this.utils.localStorageGetItem('lastUser');
    const from = lastUser ? lastUser : 'local';

    if (recoveredFavorites && recoveredFavorites[from]) {
      const recIdx = recoveredFavorites[from].findIndex(rec => rec._id === model._id);

      if (recIdx > -1) {
        return true;
      }
    }

    return false;
  }

  public addOrRemoveFavorite(model: any): boolean {
    const recoveredFavorites = this.recoveryFavorites(true);
    const lastUser = this.utils.localStorageGetItem('lastUser');
    const from = lastUser ? lastUser : 'local';

    if (recoveredFavorites && recoveredFavorites[from]) {
        const recIdx = recoveredFavorites[from].findIndex(rec => rec._id === model._id);

        if (recIdx > -1) {
          if (recoveredFavorites[from][recIdx]['removed']) {
            delete recoveredFavorites[from][recIdx]['removed'];
            this.saveFavorites(recoveredFavorites);
          } else {
            recoveredFavorites[from][recIdx]['removed'] = true;
            this.saveFavorites(recoveredFavorites);
            this.syncFavorites();
            return false;
          }
        } else {
          recoveredFavorites[from].push(this.resumeModelPayload(model));
          this.saveFavorites(recoveredFavorites);
        }
    } else {
      if (!recoveredFavorites) {
        this.saveFavorites({ [from]: [this.resumeModelPayload(model)]});
      } else {
        recoveredFavorites[from] = [this.resumeModelPayload(model)];
        this.saveFavorites(recoveredFavorites);
      }
    }

    this.syncFavorites();
    return true;
  }

  public resumeModelPayload(model: any): any {
    return {
      _id: model._id,
      name: model.name,
      url: model.url,
      generation: model.generation,
      brand: {
        _id: model.brand._id,
        name: model.brand.name,
        url: model.brand.url
      }
    };
  }

  public saveFavorites(favoritesArray: any, userId?: string): void {
    if (userId) {
      const recovered = this.recoveryFavorites(true);
      recovered[userId] = favoritesArray;
      delete recovered['local'];
      const jwtData = this.cryptoService.encondeJwt(recovered);
      this.utils.localStorageSetItem('favorites', jwtData);
    } else {
      const jwtData = this.cryptoService.encondeJwt(favoritesArray);
      this.utils.localStorageSetItem('favorites', jwtData);
    }
  }

  public recoveryFavorites(includeRemoved?: boolean): any[] {
    const jwtData = this.utils.localStorageGetItem('favorites');
    const decoded = this.cryptoService.decodeJwt(jwtData) || {};
    const lastUser = this.utils.localStorageGetItem('lastUser');

    if (lastUser && decoded[lastUser]) {
      if (!includeRemoved) {
        decoded[lastUser] = this.filterRemoved(decoded[lastUser]);
      }
    }

    if (decoded.local) {
      if (!includeRemoved) {
        decoded.local = this.filterRemoved(decoded.local);
      }
    }

    return decoded;
  }

  public filterRemoved(itens: any[]): any[] {
    for (let i = 0; i < itens.length; i++) {
      if (itens[i].removed) {
        itens.splice(i, 1);
      }
    }

    return itens;
  }

  public syncFavorites(): void {
    if (this.utils.sessionUser) {
      const userId = this.utils.sessionUser['_id'];
      const baseFavorites = this.utils.sessionUser['favorites'] || [];
      const localFavorites = this.recoveryFavorites(true);

      if (localFavorites && localFavorites['local'] && localFavorites['local'].length) {
        localFavorites['local'].forEach(fav => {
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
      }

      if (localFavorites && localFavorites[userId] && localFavorites[userId].length) {
        localFavorites[userId].forEach(fav => {
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
      }

      const data = {
        favorites: baseFavorites
      };

      const jwtData = { data: this.cryptoService.encondeJwt(data)};
      const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
        res => {
          if (!subCustomers.closed) { subCustomers.unsubscribe(); }
          this.utils.sessionUser['favorites'] = res['saved']['favorites'];
          this.saveFavorites(res['saved']['favorites'], this.utils.sessionUser._id);
        }
      );
    }
  }
}
