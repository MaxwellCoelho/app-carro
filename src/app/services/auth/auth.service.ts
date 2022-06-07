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
    const myAction = 'login';

    const url = `${environment.middlewareEndpoint}/${myAction}`;
    return this.http.post(url, data, { withCredentials: true });
  }

  public checkUser(): any {
    const myAction = 'me';
    const url = `${environment.middlewareEndpoint}/${myAction}`;

    return this.http.post(url, null, { withCredentials: true });
  }

  public logoutUser(): any {
    const myAction = 'logout';
    const url = `${environment.middlewareEndpoint}/${myAction}`;

    return this.http.post(url, null, { withCredentials: true });
  }
}
