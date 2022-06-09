/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public users: Array<any>;
  public roles: Array<any>;
  public showLoader: boolean;
  public formCustomers: FormGroup;
  public activeChecked = true;
  public passwordLastContent: string;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initForm();
    this.getRoles();
    this.getCustomers();
  }

  public initForm() {
    this.formCustomers = this.fb.group({
      editUserId: this.fb.control(''),
      newUserName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newUserEmail: this.fb.control('', [Validators.required]),
      newUserPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      newUserLevel: this.fb.control('', [Validators.required])
    });
  }

  public getRoles(): void {
    this.showLoader = true;
    const subRoles = this.dbService.getItens(environment.rolesAction).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.roles = res.roles;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public getCustomers(): void {
    this.showLoader = true;
    const subCustomers = this.dbService.getItens(environment.customersAction).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.users = res.customers;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createCustomer(action: string) {
    this.showLoader = true;
    const userId = this.formCustomers.value.editUserId;
    const data = {
      name: this.formCustomers.value.newUserName,
      email: this.formCustomers.value.newUserEmail,
      password: this.formCustomers.value.newUserPassword,
      role: this.formCustomers.value.newUserLevel,
      active: this.activeChecked
    };

    const jwtData = { customerData: this.cryptoService.encondeJwt(data)};

    const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.formCustomers.reset();
        this.users = res.customers;
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editCustomer(user) {
    this.formCustomers.reset({
      editUserId: user['_id'],
      newUserName: user.name,
      newUserEmail: user.email,
      newUserPassword: user.password,
      newUserLevel: user.role['_id']
    });

    this.activeChecked = user.active;

    this.content.scrollToTop(700);
  }

  public deleteCustomer(userId: string, action: string) {
    this.showLoader = true;
    const subCustomers = this.dbService.deleteItem(environment.customersAction, userId).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.users = res.customers;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, user: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${user.newUserName || user.name || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteCustomer(user['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createCustomer('Item criado');
          break;
        case 'editar':
          this.createCustomer('Item editado');
          break;
        case 'limpar':
          this.formCustomers.reset();
          this.activeChecked = true;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formCustomers.reset();
          this.activeChecked = true;
          this.showToast('Edição descartada');
          break;
      }
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

  public showErrorToast(err) {
    const genericError = 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
    const notFoundError = 'Infelizmente o que você procura foi excluído ou não existe mais.';
    const nonAuthorizedError = 'Você não está autorizado a fazer esse tipo de ação!';
    let response;

    switch (err.status) {
      case 404:
        response = notFoundError;
        break;
      case 401:
        response = nonAuthorizedError;
        break;
      default:
        response = genericError;
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

  public showToast(action: string, item?: any) {
    let savedRole;

    if (item) {
      savedRole = this.roles.find(role => role['_id'] === item.role);
    }

    this.toastController.create({
      header: `${action} com sucesso!`,
      message: item ? `Nome: ${item.name}, nível: ${savedRole.level} - ${savedRole.name}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }

  public clearField($event): void {
    this.passwordLastContent = $event.srcElement.value;
    $event.srcElement.value = '';
  }

  public recoverField($event): void {
    if ($event.srcElement.value === '') {
      $event.srcElement.value = this.passwordLastContent;
      this.passwordLastContent = null;
    }
  }
}
