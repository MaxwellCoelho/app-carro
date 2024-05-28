/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public nav = NAVIGATION;
  public showLoader: boolean;

  constructor(
    public authService: AuthService,
    public utils: UtilsService,
    public router: Router,
    public toastController: ToastController,
    public alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.checkUser();
  }

  public checkUser(): void {
    const sessionStorage = this.utils.localStorageGetItem('userSession');

    if (sessionStorage) {
      let authSubscription = new Subscription();
      authSubscription = this.authService.checkUser()
      .subscribe(
        res => {
          if (!authSubscription.closed) {authSubscription.unsubscribe(); }
          if (!res['authorized'].active) {
            this.rejectUser();
          } else {
            this.utils.returnLoggedUser();
          }
        },
        () => {
          if (!authSubscription.closed) {authSubscription.unsubscribe(); }
          this.rejectUser();
        }
      );
    }
  }

  public rejectUser(): void {
    this.utils.localStorageRemoveItem('userSession');
    this.utils.returnLoggedUser();
  }

  public checkClickedItem($event) {
    switch ($event) {
      case this.nav.logout.route:
        this.showConfirmAlert();
        break;
    }
  }

  public logoutUser() {
    this.showLoader = true;

    this.authService.logoutUser().subscribe(
      res => {
        this.utils.localStorageRemoveItem('userSession');
        this.utils.returnLoggedUser();
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

  public showConfirmAlert() {
    const alertMessage = `Deseja realmente sair da área logada?`;

    const confirmHandler = () => {
      this.logoutUser();
    };

    const alertObj = {
      header: 'Atenção!',
      message: alertMessage,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          id: 'cancel-button'
        }, {
          text: 'Confirmar',
          id: 'confirm-button',
          handler: confirmHandler
        }
      ]
    };

    this.alertController.create(alertObj).then(alert => {
      alert.present();
    });
  }
}
