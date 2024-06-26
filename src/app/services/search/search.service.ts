import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  public selectedModel: object;
  public clearSearch$: Subject<any> = new Subject<any>();

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
}
