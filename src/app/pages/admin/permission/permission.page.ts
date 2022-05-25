/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CustomerService } from 'src/app/services/customer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.page.html',
  styleUrls: ['./permission.page.scss'],
})
export class PermissionPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public roles: Array<any>;
  public users: Array<any>;
  public formRoles: FormGroup;

  constructor(
    public customerService: CustomerService,
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
      newRoleName: this.fb.control('', [Validators.required]),
      newRoleLevel: this.fb.control('', [Validators.required])
    });
  }

  public getRoles(): void {
    const subRoles = this.customerService.getRoles().subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.roles = res.roles;
      },
      err => {
        console.error(err);
      }
    );
  }

  public createRole(action: string) {
    const roleId = this.formRoles.value.editRoleId;
    const data = {
      name: this.formRoles.value.newRoleName,
      level: this.formRoles.value.newRoleLevel
    };

    const subRoles = this.customerService.createRole(data, roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.formRoles.reset();
        this.roles = res.roles;
        this.showToast(action, res.saved);
      },
      err => {
        console.error(err);
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
    const subRoles = this.customerService.deleteRole(roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.roles = res.roles;
        this.showToast(action, res.removed);
      },
      err => {
        console.error(err);
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
