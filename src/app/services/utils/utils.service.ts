/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@angular/core';
import { CryptoService } from 'src/app/services/crypto/crypto.service';

export type UpdateTypes = 'opinions' | 'bests';

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

  public saveCreatedBrandOrModel(myItem: any, itemName: string): void {
    const recovered = this.recoveryCreatedBrandOrModel(itemName);
    const alreadyExists = recovered.find(item => item['_id'] === myItem['_id']);

    if (!alreadyExists) {
      recovered.push(myItem);
      const encoded = this.cryptoService.encondeJwt(recovered);
      this.localStorageSetItem(itemName, encoded);
    }
  }

  public recoveryCreatedBrandOrModel(itemName: string): any {
    const encoded = this.localStorageGetItem(itemName);
    const recovered = encoded ? this.cryptoService.decodeJwt(encoded) : [];
    return recovered;
  }
}
