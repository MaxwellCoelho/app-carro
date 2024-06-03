import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.page.html',
  styleUrls: ['./recuperar-senha.page.scss'],
})
export class RecuperarSenhaPage implements OnInit, ViewWillEnter {

  public nav = NAVIGATION;
  public showLoader: boolean;
  public formPassword: FormGroup;
  public newPasswordType = 'password';
  public repeatNewPasswordType = 'password';
  public token: string;

  constructor(
    public utils: UtilsService,
    public toastController: ToastController,
    public router: Router,
    public fb: FormBuilder,
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Recuperar senha');
    this.checkTokenParam();
  }

  public initForm() {
    this.formPassword = this.fb.group({
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      repeatNewPassword: this.fb.control('', [Validators.required, Validators.minLength(4)])
    });
  }

  public checkTokenParam(): void {
    const urlParams = location.search.replace('?','').split('&');

    urlParams.find(param => {
      const splitted = param.split('=');
      if (splitted[0] === 'token') {
        this.token = splitted[1];
      }
    });

    if (!this.token) {
      this.showToast('danger');
    }
  }

  public showToast(type: string): void {
    this.showLoader = false;

    this.toastController.create({
      header: type === 'danger' ? 'Atenção!' : 'Senha alterada com sucesso!',
      message: type === 'danger' ? 'Token inválido ou expirado.' : 'Realize o login com sua nova senha.',
      duration: 4000,
      position: 'middle',
      icon: 'paper-plane-outline',
      color: type
    }).then(toast => {
      toast.present();
      this.router.navigate([NAVIGATION.login.route]);
    });
  }

  public showOrHideField(field: string): void {
    this[field] = this[field] === 'password' ? 'text' : 'password';
  }

  public submitChangePassword(): void {
    this.showLoader = true;

    const data = {
      token: this.token,
      password: this.formPassword.value.repeatNewPassword
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subCustomers = this.dbService.createItem(environment.resetPassword, jwtData).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;
        this.showToast('success');
      },
      err => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;
        this.showToast('danger');
      }
    );
  }
}
