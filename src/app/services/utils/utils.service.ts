/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@angular/core';
import { CryptoService } from 'src/app/services/crypto/crypto.service';

export type UpdateTypes = 'opinions' | 'bests' | 'versions';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  public sessionUser;

  public update = {
    opinions: false,
    bests: false,
    app: false
  };

  constructor(
    public cryptoService: CryptoService,
  ) { }

  public sanitizeText(text: string): string {
    return text
      ? text.replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/([^\w]+|\s+)/g, '-') // Substitui espaço e outros caracteres por hífen
        .replace(/\-\-+/g, '-')	// Substitui multiplos hífens por um único hífen
        .replace(/(^-+|-+$)/, '') // Remove hífens extras do final ou do inicio da string
        .toLowerCase() // converte para caixa baixa
      : '';
  }

  public returnLoggedUser(): void {
    const sessionUser = this.localStorageGetItem('userSession');

    if (sessionUser) {
      this.sessionUser = this.cryptoService.decodeJwt(sessionUser);
    } else {
      this.sessionUser = null;
    }
  }

  public storageAvailable(type: string): boolean {
    const storage = window[type];
    try {
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0;
    }
  }

  public sessionStorageGetItem(name: string): any {
    if (this.storageAvailable('sessionStorage')) {
      return window.sessionStorage.getItem(name) || '';
    }
  }

  public sessionStorageSetItem(name: string, value: string): void {
    if (this.storageAvailable('sessionStorage')) {
      window.sessionStorage.setItem(name, value);
    }
  }

  public sessionStorageRemoveItem(name: string): void {
    if (this.storageAvailable('sessionStorage')) {
      window.sessionStorage.removeItem(name);
    }
  }

  public sessionStorageClear(): void {
    if (this.storageAvailable('sessionStorage')) {
      window.sessionStorage.clear();
    }
  }

  public localStorageGetItem(name: string): any {
    if (this.storageAvailable('localStorage')) {
      return window.localStorage.getItem(name) || '';
    }
  }

  public localStorageSetItem(name: string, value: string): void {
    if (this.storageAvailable('localStorage')) {
      window.localStorage.setItem(name, value);
    }
  }

  public localStorageRemoveItem(name: string): void {
    if (this.storageAvailable('localStorage')) {
      window.localStorage.removeItem(name);
    }
  }

  public localStorageClear(): void {
    if (this.storageAvailable('localStorage')) {
      window.localStorage.clear();
    }
  }

  public setShouldUpdate(itens: Array<UpdateTypes>, status: boolean): void {
    itens.forEach(item => this.update[item] = status);
  }

  public getShouldUpdate(item: UpdateTypes): boolean {
    return this.update[item];
  }

  public saveCreatedItem(myItem: any, itemName: string): void {
    const recovered = this.recoveryCreatedItem(itemName);
    const alreadyExists = recovered.find(item => item['_id'] === myItem['_id']);

    if (!alreadyExists) {
      recovered.push(myItem);
      const encoded = this.cryptoService.encondeJwt(recovered);
      this.localStorageSetItem(itemName, encoded);
    }
  }

  public recoveryCreatedItem(itemName: string): any {
    const encoded = this.localStorageGetItem(itemName);
    const recovered = encoded ? this.cryptoService.decodeJwt(encoded) : [];
    return recovered;
  }

  public onlyNumbers($event): void {
    const onlyNumbers = $event.srcElement.value.replace(/\D/g, '');
    $event.srcElement.value = onlyNumbers;
  }

  public capitalize($event): void {
    if ($event.srcElement.value) {
      const capitalized = $event.srcElement.value.replace(/^./, $event.srcElement.value[0].toUpperCase());
      $event.srcElement.value = capitalized;
    }
  }

  public setPageTitle(newTitle: string, newDescription?: string, newKeywords?: string): void {
    const defaultTitle = 'Opinião dos donos';
    const defaultDescription = 'Para quem busca mais informação na hora de decidir qual carro comprar.';
    const defaultKeywords = 'opinião, opiniões, dono, donos, opinar, carro, carros, automóvel, positivo, negativo, marca, fabricante, montadora, garagem, dirigir, conforto, autonomia, ano, motor, krro, krros, karro, karros';
    const defaultCanonical = 'https://krro.com.br';
    const currentPath = location.pathname;
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const linkCanonical = document.querySelector('link[rel="canonical"]');

    document.title = `Krro - ${newTitle} - ${defaultTitle}`;
    metaDescription['content'] = metaDescription && newDescription ? `${newDescription} ${defaultDescription}` : defaultDescription;
    metaKeywords['content'] = metaKeywords && newKeywords ? `${newKeywords}, ${defaultKeywords}` : defaultKeywords;
    linkCanonical['href'] = linkCanonical && !currentPath.includes('melhores') ? `${defaultCanonical}${currentPath}` : defaultCanonical;
  }

  public getModelImg(modelUrl: string, generations: object, yearModel?: string): string {
    let imgName = `${modelUrl}.png`;

    if (generations && Object.keys(generations).length) {
      const myYear = yearModel ? parseInt(yearModel, 10) : null;

      if (myYear) {
        let foundName;
        let gen = 0;

        Object.entries(generations).forEach(entrie => {
          gen++;
          if (myYear >= parseInt(entrie[1].yearStart, 10) && myYear <= parseInt(entrie[1].yearEnd, 10)) {
            foundName = `${modelUrl}-${entrie[0]}.png`;
          }
        });

        imgName = foundName ? foundName : `${modelUrl}-g${gen}.png`;
      } else {
        imgName = `${modelUrl}-${Object.keys(generations)[Object.keys(generations).length - 1]}.png`;
      }
    }

    return imgName;
  }

  public sortByReview(itens: any): any {
    return itens && itens.length ? itens.sort((a, b) => (!a['review']) || -1) : itens;
  }

  public findActiveModel(models: object[], brandUrl: string): object {
    const foundModels = models.filter(mod => mod['brand'].url === brandUrl && mod['active']);
    let foundModel;

    if (!foundModels.length) {
      return null;
    }

    foundModels.forEach(model => {
      const recoveredReviewBrands = this.recoveryCreatedItem('createdBrand');
      const recoveredReviewModel = this.recoveryCreatedItem('createdModel');
      let checkReviewBrand = false;
      let checkReviewModel = false;

      if (!model['brand'].review || (model['brand'].review && recoveredReviewBrands.find(item => item['_id'] === model['brand']['_id']))) {
        checkReviewBrand = true;
      }

      if (!model['review'] || (model['review'] && recoveredReviewModel.find(item => item['_id'] === model['_id']))) {
        checkReviewModel = true;
      }

      if (checkReviewBrand && checkReviewModel) {
        foundModel = model;
      }
    });

    return foundModel;
  }
}
