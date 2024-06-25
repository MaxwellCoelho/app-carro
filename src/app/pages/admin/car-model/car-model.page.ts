/* eslint-disable @typescript-eslint/naming-convention */
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
  selector: 'app-car-model',
  templateUrl: './car-model.page.html',
  styleUrls: ['./car-model.page.scss'],
})
export class CarModelPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public reviewModels: Array<any>;
  public models: Array<any>;
  public finalModels: Array<any>;
  public categories: Array<any>;
  public brands: Array<any>;
  public showLoader: boolean;
  public formModels: FormGroup;
  public activeChecked = true;
  public pendingReview = false;
  public generations = {};
  public brandFilter: string;

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
    this.getBrands();
    this.getModels(true);
  }

  public initForm() {
    this.formModels = this.fb.group({
      editModelId: this.fb.control(''),
      newModelName: this.fb.control('', [Validators.required, Validators.minLength(2)]),
      newModelCategory: this.fb.control('', [Validators.required]),
      newModelBrand: this.fb.control('', [Validators.required]),
      newModelYearStart: this.fb.control(''),
      newModelYearEnd: this.fb.control('')
    });
  }

  public getGenAsArray(): object[] {
    return this.generations ? Object.entries(this.generations) : [];
  }

  public includeGen() {
    const genLeng = this.getGenAsArray().length;
    const obj = {
      yearStart: parseInt(this.formModels.value.newModelYearStart, 10),
      yearEnd: parseInt(this.formModels.value.newModelYearEnd, 10)
    };

    if (genLeng) {
      this.generations[`g${this.getGenAsArray().length + 1}`] = obj;
    } else {
      this.generations = {[`g${this.getGenAsArray().length + 1}`]: obj};
    }
    this.formModels.controls.newModelYearStart.reset();
    this.formModels.controls.newModelYearEnd.reset();
  }

  public excludeGen(genKey: string) {
    delete this.generations[genKey];
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

  public getBrands(): void {
    this.showLoader = true;
    const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = res.brands;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public getModels(review?: boolean, brandId?: string): void {
    this.showLoader = true;
    const myFilter = review ? { review: true } : { review: false};

    if (brandId) {
      myFilter['brand._id'] = brandId;
    }

    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        const myList = review ? 'reviewModels' : 'models';
        this[myList] = res.models;
        this[myList].forEach(model => {
          if (model.generation) {
            let plainGen = '';
            Object.entries(model.generation).forEach(ent => {
              plainGen += `${plainGen.length > 0 ? ', ' : ''}${ent[0]}: ${ent[1]['yearStart']}-${ent[1]['yearEnd']}`;
            });
            model['generations'] = plainGen;
          } else {
            model['generations'] = '-';
          }
        });

        const reviews = this.reviewModels || [];
        const models = this.models || [];
        this.finalModels = [...reviews, ...models];
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public filterByBrand($event) {
    this.brandFilter = $event.detail.value;
    if (this.brandFilter === 'nothing') {
      this.brandFilter = null;
      this.models = [];
      this.finalModels = this.reviewModels;
    } else {
      this.getModels(false, this.brandFilter);
    }
  }

  public createModel(action: string) {
    this.showLoader = true;
    const modelId = this.formModels.value.editModelId;
    const category = this.categories.find(cat => cat['_id'] === this.formModels.value.newModelCategory);
    const brand = this.brands.find(bra => bra['_id'] === this.formModels.value.newModelBrand);
    const data = {
      name: this.formModels.value.newModelName,
      category: {
        _id: category['_id'],
        name: category['name'],
        active: category['active']
      },
      brand: {
        _id: brand['_id'],
        name: brand['name'],
        url: brand['url'],
        active: brand['active'],
        review: brand['review']
      },
      generation: this.generations,
      active: this.activeChecked,
      review: this.pendingReview
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subModels = this.dbService.createItem(environment.modelsAction, jwtData, modelId).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }

        if (this.reviewModels.find(mod => mod['_id'] === modelId) || this.pendingReview) {
          this.getModels(true);
          if (this.brandFilter) {
            this.getModels(false, this.brandFilter);
          }
        } else {
          this.getModels(false, this.brandFilter);
        }

        this.formModels.reset();
        this.showLoader = false;
        this.activeChecked = true;
        this.pendingReview = false;
        this.generations = {};
        this.showToast(action, res.saved);
        this.utils.setShouldUpdate(['opinions'], true);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editModel(model) {
    this.formModels.reset({
      editModelId: model['_id'],
      newModelName: model.name,
      newModelCategory: model.category ? model.category['_id'] : '',
      newModelBrand: model.brand['_id'],
      generation: model['generation'],
    });

    this.generations = model.generation;
    this.activeChecked = model.active;
    this.pendingReview = model.review;

    this.content.scrollToTop(700);
  }

  public deleteModel(modelId: string, action: string) {
    this.showLoader = true;
    const subModels = this.dbService.deleteItem(environment.modelsAction, modelId).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }

        if (this.reviewModels.find(mod => mod['_id'] === modelId) || this.pendingReview) {
          this.getModels(true);
          if (this.brandFilter) {
            this.getModels(false, this.brandFilter);
          }
        } else {
          this.getModels(false, this.brandFilter);
        }

        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
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
          this.pendingReview = false;
          this.generations = {};
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formModels.reset();
          this.activeChecked = true;
          this.pendingReview = false;
          this.generations = {};
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
      message: item ? `Marca: ${item.brand.name}, Modelo: ${item.name}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
