/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  public selectedModel: object;
  public clearSearch$: Subject<any> = new Subject<any>();
  public allBrands = [];
  public allModels = [];
  public allCategories = [];

  constructor() { }

  public saveModel(model: object): void {
    this.selectedModel = model;
  }

  public getModel(): object {
    return this.selectedModel;
  }

  public clearModel(): void {
    this.selectedModel = null;
  }

  public clearSearch() {
    this.clearSearch$.next(true);
  }

  public clearAllBrands(): void {
    this.clearAllModels();
    this.allBrands = [];
  }

  public saveAllBrands(brands: object[]): void {
    this.allBrands = brands;
  }

  public getAllBrands(): object[] {
    return this.allBrands;
  }

  public clearAllModels(): void {
    this.allModels = [];
  }

  public getModelsByBrand(brandUrl: string): object[] {
    const filtered = this.allModels.filter(item => item.brand.url === brandUrl);
    return filtered;
  }

  public saveModels(models: object[]): void {
    if (models.length) {
      const alreadyHave = this.allModels.some(item => item.brand.url === models[0]['brand'].url);

      if (!alreadyHave) {
        this.allModels = [...this.allModels, ...models];
      }
    }
  }

  public clearAllCategories(): void {
    this.allCategories = [];
  }

  public saveAllCategories(categories: object[]): void {
    this.allCategories = categories;
  }

  public getAllCategories(): object[] {
    return this.allCategories;
  }
}
