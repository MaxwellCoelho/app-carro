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
  selector: 'app-car-brand',
  templateUrl: './car-brand.page.html',
  styleUrls: ['./car-brand.page.scss'],
})
export class CarBrandPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public brands: Array<any>;
  public showLoader: boolean;
  public formBrands: FormGroup;
  public activeChecked = true;
  public pendingReview = false;

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
    this.getBrands();
  }

  public initForm() {
    this.formBrands = this.fb.group({
      editBrandId: this.fb.control(''),
      newBrandName: this.fb.control('', [Validators.required, Validators.minLength(3)])
    });
  }

  public getBrands(): void {
    this.showLoader = true;
    const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = this.utils.sortByReview(res.brands);
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createBrand(action: string) {
    this.showLoader = true;
    const brandId = this.formBrands.value.editBrandId;
    const data = {
      name: this.formBrands.value.newBrandName,
      active: this.activeChecked,
      review: this.pendingReview
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subBrands = this.dbService.createItem(environment.brandsAction, jwtData, brandId).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.formBrands.reset();
        this.brands = this.utils.sortByReview(res.brands);
        this.showLoader = false;
        this.activeChecked = true;
        this.pendingReview = false;
        this.showToast(action, res.saved);
        this.ngOnInit();
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editBrand(brand) {
    this.formBrands.reset({
      editBrandId: brand['_id'],
      newBrandName: brand.name
    });

    this.activeChecked = brand.active;
    this.pendingReview = brand.review;

    this.content.scrollToTop(700);
  }

  public deleteBrand(brandId: string, action: string) {
    this.showLoader = true;
    const subBrands = this.dbService.deleteItem(environment.brandsAction, brandId).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = this.utils.sortByReview(res.brands);
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, brand: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${brand.newBrandName || brand.name || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteBrand(brand['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createBrand('Item criado');
          break;
        case 'editar':
          this.createBrand('Item editado');
          break;
        case 'limpar':
          this.formBrands.reset();
          this.activeChecked = true;
          this.pendingReview = false;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formBrands.reset();
          this.activeChecked = true;
          this.pendingReview = false;
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
