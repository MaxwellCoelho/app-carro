/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';

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

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initForm();
    this.getBrands();
  }

  public initForm() {
    this.formBrands = this.fb.group({
      editBrandId: this.fb.control(''),
      newBrandName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newBrandImage: this.fb.control('', [Validators.required, Validators.minLength(3)])
    });
  }

  public getBrands(): void {
    this.showLoader = true;
    const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = res.brands;
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

  public createBrand(action: string) {
    this.showLoader = true;
    const brandId = this.formBrands.value.editBrandId;
    const data = {
      name: this.formBrands.value.newBrandName,
      image: this.formBrands.value.newBrandImage,
      active: this.activeChecked
    };

    const jwtData = { brandData: this.cryptoService.encondeJwt(data)};

    const subBrands = this.dbService.createItem(environment.brandsAction, jwtData, brandId).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.formBrands.reset();
        this.brands = res.brands;
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
      },
      err => {
        this.showErrorAlert(err);
      }
    );
  }

  public editBrand(brand) {
    this.formBrands.reset({
      editBrandId: brand['_id'],
      newBrandName: brand.name,
      newBrandImage: brand.image
    });

    this.activeChecked = brand.active;

    this.content.scrollToTop(700);
  }

  public deleteBrand(brandId: string, action: string) {
    this.showLoader = true;
    const subBrands = this.dbService.deleteItem(environment.brandsAction, brandId).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = res.brands;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorAlert(err);
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
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formBrands.reset();
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
      message: item ? `Nome: ${item.name}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'primary'
    }).then(toast => {
      toast.present();
    });
  }
}
