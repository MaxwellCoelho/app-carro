import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  public selectedModel: object;

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
}
