/* eslint-disable @typescript-eslint/dot-notation */
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { Router } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { Subscription, Observable, Subject, of  } from 'rxjs';
import { finalize, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggedAdminGuard implements CanActivate {

  public nav = NAVIGATION;
  private loggedUser = new Subject();

  constructor(
    public authService: AuthService,
    public cryptoService: CryptoService,
    public utils: UtilsService,
    public router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let authSubscription = new Subscription();

    authSubscription = this.authService.checkUser()
      .pipe(
        map((res) => {
          if (!res['authorized'].active) {
            this.reject(res, this.nav.login.route);
          } else if (res['authorized'].active && res['authorized'].role.level > 1) {
            this.reject(res, this.nav.garage.route);
          } else {
            this.accept(res);
          }
        }),
        catchError((err) => {
          this.reject(err, this.nav.login.route);
          return this.loggedUser.asObservable();
        }),
        finalize(() => {
          if (!authSubscription.closed) {authSubscription.unsubscribe(); }
        })
      ).subscribe();

    return this.loggedUser.asObservable();
  }

  public accept(res): any {
    this.utils.localStorageSetItem('userSession', this.cryptoService.encondeJwt(res.authorized));
    this.utils.returnLoggedUser();
    this.loggedUser.next(true);
  }

  public reject(res, route): any {
    if (res.status !== 200) {
      this.utils.localStorageRemoveItem('userSession');
      this.utils.returnLoggedUser();
    }
    this.loggedUser.next(false);
    this.router.navigate([`/${route}`]);
  }
}
