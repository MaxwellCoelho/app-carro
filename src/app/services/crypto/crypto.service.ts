import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import * as jwt_encode from 'jwt-encode';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  public encondeJwt(payload: any): string {
    const tokenJwt = payload ? jwt_encode(payload, environment.jstSecret) : null;
    return tokenJwt;
  }

  public decodeJwt(tokenJwt: string): any {
    const decodedJwt = tokenJwt ? jwt_decode(tokenJwt) : null;
    return decodedJwt;
  }

}
