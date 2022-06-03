import { FormControl } from '@angular/forms';
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.page.html',
  styleUrls: ['./permission.page.scss'],
})
export class PermissionPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public roles: Array<any>;
  public showLoader: boolean;
  public formRoles: FormGroup;

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
  }

  public initForm() {
    this.formRoles = this.fb.group({
      editRoleId: this.fb.control(''),
      newRoleName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newRoleLevel: this.fb.control('', [Validators.required])
    });
  }

  public onlyNumbers($event): void {
    const onlyNumbers = $event.srcElement.value.replace(/\D/g, '');
    $event.srcElement.value = onlyNumbers;
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
        this.showLoader = false;
        console.error(err);

        if (err.status !== 404) {
          this.showErrorAlert(err);
        }
      }
    );
  }

  public createRole(action: string) {
    this.showLoader = true;
    const roleId = this.formRoles.value.editRoleId;
    const data = {
      name: this.formRoles.value.newRoleName,
      level: this.formRoles.value.newRoleLevel
    };

    const jwtData = { roleData: this.cryptoService.encondeJwt(data)};

    const subRoles = this.dbService.createItem(environment.rolesAction, jwtData, roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.formRoles.reset();
        this.roles = res.roles;
        this.showLoader = false;
        this.showToast(action, res.saved);
      },
      err => {
        this.showErrorAlert(err);
      }
    );
  }

  public editRole(role) {
    this.formRoles.reset({
      editRoleId: role['_id'],
      newRoleName: role.name,
      newRoleLevel: role.level
    });

    this.content.scrollToTop(700);
  }

  public deleteRole(roleId: string, action: string) {
    this.showLoader = true;
    const subRoles = this.dbService.deleteItem(environment.rolesAction, roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.roles = res.roles;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorAlert(err);
      }
    );
  }

  public showConfirmAlert(action: string, role: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${role.newRoleName || role.name || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteRole(role['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createRole('Item criado');
          break;
        case 'editar':
          this.createRole('Item editado');
          break;
        case 'limpar':
          this.formRoles.reset();
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formRoles.reset();
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

  public showErrorAlert(err) {
    console.error(err);
    const genericError = 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
    const notFoundError = 'Infelizmente o que você procura foi excluído ou não existe mais.';

    const alertObj = {
      header: 'Ops...',
      message: err.status === 404 ? notFoundError : genericError,
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

  public showToast(action: string, item?: any) {
    this.toastController.create({
      header: `${action} com sucesso!`,
      message: item ? `Nome: ${item.name}, nível: ${item.level}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'primary'
    }).then(toast => {
      toast.present();
    });
  }
}
