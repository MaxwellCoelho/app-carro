/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { FavoriteService } from 'src/app/services/favorite/favorite.service';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, INVALID_USER, UNAUTHORIZED } from 'src/app/helpers/error.helper';

@Component({
  selector: 'app-opinar-send',
  templateUrl: './opinar-send.component.html',
  styleUrls: ['../opinar.page.scss'],
})
export class OpinarSendComponent implements OnInit {

  @Input() selectedModel: object;
  @Output() stepSend = new EventEmitter<any>();
  @Output() clickForeward = new EventEmitter<any>();

  public nav = NAVIGATION;
  public formOpinarSend: FormGroup;
  public formLogin: FormGroup;
  public formRecovery: FormGroup;
  public sessionUser = this.utils.sessionUser;
  public newPasswordType = 'password';
  public repeatNewPasswordType = 'password';
  public userPasswordType = 'password';
  public showForgotPassword = false;
  public showLoader: boolean;

  constructor(
    public fb: FormBuilder,
    public utils: UtilsService,
    public alertController: AlertController,
    public toastController: ToastController,
    public authService: AuthService,
    public cryptoService: CryptoService,
    public router: Router,
    public favorite: FavoriteService,
  ) { }

  ngOnInit() {
    if (this.sessionUser) {
      this.saveFormOpinarSend(true);
    } else {
      this.initForm();
    }
  }

  public initForm() {
    this.formLogin = this.fb.group({
      userEmail: this.fb.control('', [Validators.required]),
      userPassword: this.fb.control('', [Validators.required, Validators.minLength(4)])
    });

    this.formOpinarSend = this.fb.group({
      opinarNome: this.fb.control('', [Validators.required]),
      opinarEmail: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      repeatNewPassword: this.fb.control('', [Validators.required, Validators.minLength(4)])
    });
  }

  public initRecoveryForm() {
    this.formRecovery = this.fb.group({
      userEmail: this.fb.control('', [Validators.required])
    });
  }

  public goBack() {
    this.clickForeward.emit();
  }

  public saveFormOpinarSend(logged?: boolean) {
    if (logged) {
      const userInfoData = {
        name: this.sessionUser.name,
        email: this.sessionUser.email
      };

      this.stepSend.emit(userInfoData);
    } else {
      if (this.formOpinarSend.status !== 'INVALID') {
        this.showConfirmEmailAlert();
      }
    }
  }

  public showConfirmEmailAlert() {
    const userInfoData = {
      name: this.formOpinarSend.value.opinarNome,
      email: this.formOpinarSend.value.opinarEmail,
      password: this.formOpinarSend.value.repeatNewPassword
    };

    const confirmHandler = () => {
      this.stepSend.emit(userInfoData);
    };

    const alertObj = {
      header: `Confirme seu email!`,
      message: `<strong>${userInfoData.email}</strong><br><br>Está correto?<br>Ele será usado para login e recuperação de senha.`,
      buttons: [
        {
          text: 'Corrigir',
          role: 'cancel',
          id: 'cancel-button'
        }, {
          text: 'Está correto',
          id: 'confirm-button',
          handler: confirmHandler
        }
      ]
    };

    this.alertController.create(alertObj).then(alert => {
      alert.present();
    });
  }

  public showOrHideField(field: string): void {
    this[field] = this[field] === 'password' ? 'text' : 'password';
  }

  public authUser(): void {
    if (this.formLogin.status !== 'INVALID') {
      this.showLoader = true;

      const data = {
        email: this.formLogin.value.userEmail,
        password: this.formLogin.value.userPassword
      };

      const jwtData = { data: this.cryptoService.encondeJwt(data)};

      const subCustomers = this.authService.authUser(jwtData).subscribe(
        res => {
          if (!subCustomers.closed) { subCustomers.unsubscribe(); }
          this.showLoader = false;

          this.formLogin.reset();
          this.utils.localStorageSetItem('userSession', this.cryptoService.encondeJwt(res.authorized));
          this.utils.localStorageSetItem('lastUser', res.authorized['_id']);
          this.utils.returnLoggedUser();
          this.favorite.syncFavorites(true);
          this.sessionUser = res.authorized;
          this.saveFormOpinarSend(true);
        },
        err => {
          this.showErrorToast(err);
        }
      );
    }
  }

  public showErrorToast(err) {
    let response;

    switch (err.status) {
      case 404:
        response = INVALID_USER;
        break;
      case 401:
        response = UNAUTHORIZED;
        break;
      default:
        response = GENERIC;
    }

    this.showLoader = false;
    console.error(err);

    this.toastController.create({
      header: 'Atenção!',
      message: response,
      duration: 4000,
      position: 'middle',
      icon: 'warning-outline',
      color: 'danger'
    }).then(toast => {
      toast.present();
    });
  }

  public backToLogin(): void {
    this.formLogin.controls.userEmail.patchValue(this.formRecovery.controls.userEmail.value);
    this.showForgotPassword = false;
  }

  public sendRecovery(): void {
    if (this.formRecovery.status !== 'INVALID') {
      this.showLoader = true;

      const data = {
        email: this.formRecovery.value.userEmail
      };

      const jwtData = { data: this.cryptoService.encondeJwt(data)};

      const submit = () => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;

        this.showRecoveryToast();
        this.backToLogin();
      };

      const subCustomers = this.authService.recoveryPassword(jwtData).subscribe(
        res => {
          submit();
        },
        err => {
          submit();
        }
      );
    }
  }

  public showRecoveryToast() {
    this.showLoader = false;

    this.toastController.create({
      header: 'Senha enviada com sucesso!',
      message: 'Verifique a sua caixa de email e retorne aqui posteriormente.',
      duration: 4000,
      position: 'middle',
      icon: 'paper-plane-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }

  public forgotPassword(): void {
    this.initRecoveryForm();
    this.formRecovery.controls.userEmail.patchValue(this.formLogin.controls.userEmail.value);
    this.showForgotPassword = true;
  }

  checkKey($event) {
    const id = $event.target.offsetParent.id;
    const keyCode = $event.keyCode;

    if (keyCode === 13) {
      switch (id) {
        case 'userPassword':
          this.authUser();
          break;
        case 'userEmail':
          this.sendRecovery();
          break;
        case 'repeatNewPassword':
          this.saveFormOpinarSend();
          break;
      }
    }
  }
}
