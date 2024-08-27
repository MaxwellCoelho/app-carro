/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public finalUsers: Array<any> = [];
  public orderBy = 'default';
  public roles: Array<any>;
  public showLoader: boolean;
  public formCustomers: FormGroup;
  public activeChecked = true;
  public passwordLastContent: string;
  public page = 1;
  public pagination = 20;
  public customerFilter = 'nothing';
  public excludedItem = false;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController,
    public utils: UtilsService,
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
    if (!this.roles) {
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
  }

  public getCustomers(): void {
    this.showLoader = true;

    const isRecent = this.customerFilter === 'nothing';
    const myFilter = {};
    const page = isRecent ? '1' : this.page.toString();
    const pagination = isRecent ? '5' : this.pagination.toString();
    const sort = !isRecent && this.orderBy === 'default' ? {name: 'name', value: 'asc'} : {name: '_id', value: 'desc'};

    if (!isRecent && this.customerFilter) {
      myFilter['role._id'] = this.customerFilter;
    }

    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subCustomers = this.dbService.filterItem(environment.filterCustomersAction, jwtData, page, pagination, sort).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.finalUsers = [...this.finalUsers, ...res.customers];
        this.showLoader = false;
        this.page++;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public filterByLevel($event, type: 'filter' | 'order') {
    switch (type) {
      case 'filter':
        this.customerFilter = $event.detail.value;
        break;
      case 'order':
        this.orderBy = $event.detail.value;
        break;
    }

    this.finalUsers = [];
    this.page = 1;
    this.excludedItem = false;
    this.getCustomers();
  }

  public createCustomer(action: string) {
    this.showLoader = true;
    const userId = this.formCustomers.value.editUserId;
    const role = this.roles.find(rol => rol['_id'] === this.formCustomers.value.newUserLevel);

    const data = {
      name: this.formCustomers.value.newUserName,
      email: this.formCustomers.value.newUserEmail,
      password: this.formCustomers.value.newUserPassword,
      role: {
        _id: role['_id'],
        name: role['name'],
        level: role['level'],
      },
      active: this.activeChecked
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.formCustomers.reset();
        this.updateItem(res.saved, 'update');
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public updateItem(item: any, type: 'update' | 'delete'): void {
    const finalUsersCopy = [...this.finalUsers];
    let foundItem = false;
    this.finalUsers = [];

    for (let i = 0; i < finalUsersCopy.length; i++) {
      if (item['_id'] === finalUsersCopy[i]['_id']) {
        foundItem = true;

        if (type === 'delete') {
          finalUsersCopy.splice(i, 1);
        } else {
          finalUsersCopy[i]['active'] = item['active'];
          finalUsersCopy[i]['name'] = item['name'];
          finalUsersCopy[i]['email'] = item['email'];
          finalUsersCopy[i]['url'] = item['url'];
          finalUsersCopy[i]['modified'] = item['modified'];
          finalUsersCopy[i]['modified_by'] = item['modified_by'];
          finalUsersCopy[i]['role'] = item['role'];
        }
      }
    }

    if (type === 'update' && !foundItem) {
      finalUsersCopy.unshift(item);
    }

    setTimeout(() => {
      this.finalUsers = finalUsersCopy;
    }, 50);
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
        this.updateItem(res.removed, 'delete');
        this.excludedItem = true;
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
    let response;

    switch (err.status) {
      case 404:
        response = NOT_FOUND;
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

  public showToast(action: string, item?: any) {
    this.toastController.create({
      header: `${action} com sucesso!`,
      message: item ? `Nome: ${item.name}, nível: ${item.role.level} - ${item.role.name}` : '',
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
