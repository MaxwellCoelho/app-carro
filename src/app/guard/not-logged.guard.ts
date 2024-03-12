import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { Router } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Injectable({
  providedIn: 'root'
})
export class NotLoggedGuard implements CanActivate {

  public nav = NAVIGATION;

  constructor(
    public authService: AuthService,
    public cryptoService: CryptoService,
    public utils: UtilsService,
    public router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const loggedUser = this.utils.sessionUser;

    if (loggedUser) {
      this.router.navigate([`/${this.nav.garage.route}`]);
      return false;
    }

    return true;
  }
}
