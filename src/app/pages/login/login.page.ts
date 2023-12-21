import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, INVALID_USER, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public showLoader: boolean;
  public formLogin: FormGroup;

  constructor(
    public authService: AuthService,
    public cryptoService: CryptoService,
    public utils: UtilsService,
    public router: Router,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initForm();
  }

  public initForm() {
    this.formLogin = this.fb.group({
      userEmail: this.fb.control('', [Validators.required]),
      userPassword: this.fb.control('', [Validators.required, Validators.minLength(4)])
    });
  }

  public authUser(): void {
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
        this.router.navigate([`/${this.nav.garage.route}`]);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public forgotPassword(): void {
    console.log('esqueceu');
  }

  public showErrorAlert(err) {
    console.error(err);

    const alertObj = {
      header: 'Ops...',
      message: err.status === 404 ? NOT_FOUND : GENERIC,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          id: 'cancel-button'
        }
      ]
    };

    this.showLoader = false;

    this.alertController.create(alertObj).then(alert => {
      alert.present();
    });
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

}
