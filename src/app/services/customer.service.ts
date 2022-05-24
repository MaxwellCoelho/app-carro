import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(
    private http: HttpClient,
  ) { }

  public getRoles(): any {
    const action = 'roles';
    const url = `${environment.middlewareEndpoint}/${action}`;
    return this.http.get(url);
  }

  public deleteRole(roleId: string): any {
    const action = `roles/${roleId}`;
    const url = `${environment.middlewareEndpoint}/${action}`;
    return this.http.delete(url);
  }

  public createRole(data: any, roleId: string): any {
    const action = roleId ? `roles/${roleId}` : 'roles';

    const url = `${environment.middlewareEndpoint}/${action}`;
    return this.http.post(url, data);
  }
}
