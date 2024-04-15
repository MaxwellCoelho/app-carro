/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-car-category',
  templateUrl: './car-category.page.html',
  styleUrls: ['./car-category.page.scss'],
})
export class CarCategoryPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public categories: Array<any>;
  public showLoader: boolean;
  public formCategories: FormGroup;
  public activeChecked = true;

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
    this.getCategories();
  }

  public initForm() {
    this.formCategories = this.fb.group({
      editCategoryId: this.fb.control(''),
      newCategoryName: this.fb.control('', [Validators.required, Validators.minLength(3)])
    });
  }

  public getCategories(): void {
    this.showLoader = true;
    const subCategories = this.dbService.getItens(environment.categoriesAction).subscribe(
      res => {
        if (!subCategories.closed) { subCategories.unsubscribe(); }
        this.categories = res.categories;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createCategory(action: string) {
    this.showLoader = true;
    const categoryId = this.formCategories.value.editCategoryId;
    const data = {
      name: this.formCategories.value.newCategoryName,
      active: this.activeChecked
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subCategories = this.dbService.createItem(environment.categoriesAction, jwtData, categoryId).subscribe(
      res => {
        if (!subCategories.closed) { subCategories.unsubscribe(); }
        this.formCategories.reset();
        this.categories = res.categories;
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
        this.ngOnInit();
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editCategory(category) {
    this.formCategories.reset({
      editCategoryId: category['_id'],
      newCategoryName: category.name
    });

    this.activeChecked = category.active;

    this.content.scrollToTop(700);
  }

  public deleteCategory(categoryId: string, action: string) {
    this.showLoader = true;
    const subCategories = this.dbService.deleteItem(environment.categoriesAction, categoryId).subscribe(
      res => {
        if (!subCategories.closed) { subCategories.unsubscribe(); }
        this.categories = res.categories;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, category: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${category.newCategoryName || category.name || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteCategory(category['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createCategory('Item criado');
          break;
        case 'editar':
          this.createCategory('Item editado');
          break;
        case 'limpar':
          this.formCategories.reset();
          this.activeChecked = true;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formCategories.reset();
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
      message: item ? `Nome: ${item.name}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
