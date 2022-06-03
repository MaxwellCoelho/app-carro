import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
  ) { }

  public authUser(data: any): any {
    const myAction = 'auth';

    const url = `${environment.middlewareEndpoint}/${myAction}`;
    return this.http.post(url, data);
  }
}
