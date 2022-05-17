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
}
