/* eslint-disable @typescript-eslint/dot-notation */
import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AlertController, ToastController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements ViewWillEnter {

  public nav = NAVIGATION;
  public showLoader: boolean;
  public showPasswordChange = false;
  public formPassword: FormGroup;
  public currentPasswordType = 'password';
  public newPasswordType = 'password';
  public repeatNewPasswordType = 'password';

  constructor(
    public authService: AuthService,
    public utils: UtilsService,
    public router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public fb: FormBuilder,
    public cryptoService: CryptoService,
    public dbService: DataBaseService,
  ) {}

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Meu perfil');
    this.initForm();
  }

  public initForm() {
    this.formPassword = this.fb.group({
      currentPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      repeatNewPassword: this.fb.control('', [Validators.required, Validators.minLength(4)])
    });
  }

  public logoutUser() {
    this.showLoader = true;

    this.authService.logoutUser().subscribe(
      res => {
        this.utils.localStorageRemoveItem('userSession');
        this.utils.returnLoggedUser();
        this.router.navigate([`/`]);
        this.showLoader = false;
        this.showToast('success', 'logout');
      },
      err => {
        this.showLoader = false;
        this.showToast('danger', 'logout');
      }
    );
  }

  public showToast(status: string, type: string): void {
    let title;
    let msg;
    let icon;

    if (status === 'success') {
      title = 'Tudo certo!';
      icon = 'checkmark';
      msg = type === 'password'
        ? 'Sua senha foi alterada com sucesso!'
        : 'Você saiu da área logada com sucesso!';
    } else {
      title = 'Atenção!';
      icon = 'warning';
      msg = type === 'password' ? 'Ocorreu um erro! Tente novamente mais tarde.' : 'Erro durando logout! Tente novamente mais tarde.';
    }

    this.toastController.create({
      header: title,
      message: msg,
      duration: 4000,
      position: 'middle',
      icon: `${icon}-outline`,
      color: status
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

  public clickPasswordChange(): void {
    this.showPasswordChange = true;
  }

  public closePasswordChange(): void {
    this.showPasswordChange = false;
    this.formPassword.reset();
    this.currentPasswordType = this.newPasswordType = this.repeatNewPasswordType = 'password';
  }

  public showOrHideField(field: string): void {
    this[field] = this[field] === 'password' ? 'text' : 'password';
  }

  public submitChangePassword(): void {
    this.showLoader = true;
    const userId = this.utils.sessionUser['_id'];

    const data = {
      currentPassword: this.formPassword.value.currentPassword,
      password: this.formPassword.value.repeatNewPassword
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;
        this.closePasswordChange();
        this.showToast('success', 'password');
      },
      err => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;

        if (err.status === 401) {
          this.formPassword.controls.currentPassword.setErrors({invalid: true});
        } else {
          this.closePasswordChange();
          this.showToast('danger', 'password');
        }
      }
    );
  }
}
