import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

  constructor(
    private http: HttpClient,
  ) { }

  public getItens(action: string): any {
    const url = `${environment.middlewareEndpoint}/${action}`;
    return this.http.get(url, { withCredentials: true });
  }

  public deleteItem(action: string, itemId: string): any {
    const myAction = `${action}/${itemId}`;
    const url = `${environment.middlewareEndpoint}/${myAction}`;
    return this.http.delete(url, { withCredentials: true });
  }

  public createItem(action: string, data: any, itemId: string): any {
    const myAction = itemId ? `${action}/${itemId}` : action;

    const url = `${environment.middlewareEndpoint}/${myAction}`;
    return this.http.post(url, data, { withCredentials: true });
  }

  public filterItem(action: string, data: any): any {
    const url = `${environment.middlewareEndpoint}/${action}`;
    return this.http.post(url, data, { withCredentials: true });
  }
}
