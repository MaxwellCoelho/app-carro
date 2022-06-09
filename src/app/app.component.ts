import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public userLogged;
  public nav = NAVIGATION;
  public showLoader: boolean;

  constructor(
    public authService: AuthService,
    public utils: UtilsService,
    public router: Router,
    public toastController: ToastController
  ) {}

  public checkUser() {
    this.userLogged = this.utils.returnLoggedUser();
  }

  public checkClickedItem($event) {
    switch ($event) {
      case this.nav.logout.route:
        this.logoutUser();
        break;
    }
  }

  public logoutUser() {
    this.showLoader = true;

    this.authService.logoutUser().subscribe(
      res => {
        this.utils.localStorageRemoveItem('userSession');
        this.router.navigate([`/`]);
        this.showLoader = false;
        this.showToast('success');
      },
      err => {
        this.showLoader = false;
        this.showToast('danger');
      }
    );
  }

  public showToast(type: string): void {
    let title;
    let msg;
    let icon;

    if (type === 'success') {
      title = 'Tudo certo!';
      icon = 'checkmark';
      msg = 'Você saiu da área logada com sucesso!';
    } else {
      title = 'Atenção!';
      icon = 'warning';
      msg = 'Erro durando logout! Tente novamente mais tarde.';
    }

    this.toastController.create({
      header: title,
      message: msg,
      duration: 4000,
      position: 'middle',
      icon: `${icon}-outline`,
      color: type
    }).then(toast => {
      toast.present();
    });
  }
}
