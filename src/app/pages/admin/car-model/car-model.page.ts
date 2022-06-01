/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-car-model',
  templateUrl: './car-model.page.html',
  styleUrls: ['./car-model.page.scss'],
})
export class CarModelPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public models: Array<any>;
  public categories: Array<any>;
  public brands: Array<any>;
  public showLoader: boolean;
  public formModels: FormGroup;
  public activeChecked = true;

  constructor(
    public dbService: DataBaseService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initForm();
    this.getCategories();
    this.getBrands();
    this.getModels();
  }

  public initForm() {
    this.formModels = this.fb.group({
      editModelId: this.fb.control(''),
      newModelName: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newModelCategory: this.fb.control('', [Validators.required]),
      newModelBrand: this.fb.control('', [Validators.required])
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
        this.showLoader = false;
        console.error(err);

        if (err.status !== 404) {
          this.showErrorAlert(err);
        }
      }
    );
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

  public getModels(): void {
    this.showLoader = true;
    const subModels = this.dbService.getItens(environment.modelsAction).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.models = res.models;
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

  public createModel(action: string) {
    this.showLoader = true;
    const modelId = this.formModels.value.editModelId;
    const data = {
      name: this.formModels.value.newModelName,
      category: this.formModels.value.newModelCategory,
      brand: this.formModels.value.newModelBrand,
      active: this.activeChecked
    };

    const subModels = this.dbService.createItem(environment.modelsAction, data, modelId).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.formModels.reset();
        this.models = res.models;
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
      },
      err => {
        this.showErrorAlert(err);
      }
    );
  }

  public editModel(model) {
    this.formModels.reset({
      editModelId: model['_id'],
      newModelName: model.name,
      newModelCategory: model.category['_id'],
      newModelBrand: model.brand['_id']
    });

    this.activeChecked = model.active;

    this.content.scrollToTop(700);
  }

  public deleteModel(modelId: string, action: string) {
    this.showLoader = true;
    const subModels = this.dbService.deleteItem(environment.modelsAction, modelId).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.models = res.models;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorAlert(err);
      }
    );
  }

  public showConfirmAlert(action: string, model: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${model.newModelName || model.name || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteModel(model['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createModel('Item criado');
          break;
        case 'editar':
          this.createModel('Item editado');
          break;
        case 'limpar':
          this.formModels.reset();
          this.activeChecked = true;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formModels.reset();
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
    let savedBrand;

    if (item) {
      savedBrand = this.brands.find(brand => brand['_id'] === item.brand);
    }

    this.toastController.create({
      header: `${action} com sucesso!`,
      message: item ? `Marca: ${savedBrand.name}, Modelo: ${item.name}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'primary'
    }).then(toast => {
      toast.present();
    });
  }
}
