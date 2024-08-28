/* eslint-disable max-len */
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
  public finalModels: Array<any> = [];
  public orderBy = 'default';
  public categories: Array<any>;
  public brands: Array<any>;
  public showLoader: boolean;
  public formModels: FormGroup;
  public activeChecked = true;
  public pendingReview = false;
  public generations = {};
  public page = 1;
  public pagination = 20;
  public brandFilter = 'nothing';
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
    this.getModels();
    this.getCategories();
    this.getBrands();
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
    if (!this.categories) {
      const subCategories = this.dbService.getItens(environment.categoriesAction).subscribe(
        res => {
          if (!subCategories.closed) { subCategories.unsubscribe(); }
          this.categories = res.categories;
        },
        err => {
          this.showErrorToast(err);
        }
      );
    }
  }

  public getBrands(): void {
    if (!this.brands) {
      const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
        res => {
          if (!subBrands.closed) { subBrands.unsubscribe(); }
          this.brands = res.brands;
        },
        err => {
          this.showErrorToast(err);
        }
      );
    }
  }

  public getModels(): void {
    this.showLoader = true;

    const isReview = this.brandFilter === 'nothing';
    const myFilter = {};
    const page = this.page.toString();
    const pagination = this.pagination.toString();
    let sort;

    if (this.orderBy !== 'default') {
      sort = [
        {name: '_id', value: 'desc'}
      ];
    }

    if (isReview) {
      myFilter['review'] = true;
    }

    if (!isReview && this.brandFilter) {
      myFilter['brand._id'] = this.brandFilter;
    }

    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData, page, pagination, sort).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }

        const myList = res.models;

        myList.forEach(model => {
          model['generations'] = this.formatGeneration(model.generation);
        });

        this.finalModels = [...this.finalModels, ...myList];
        this.showLoader = false;
        this.page++;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public formatGeneration(generations: any[]): string {
    if (generations && generations.length) {
      let plainGen = '';
      Object.entries(generations).forEach(ent => {
        plainGen += `${plainGen.length > 0 ? ', ' : ''}${ent[0]}: ${ent[1]['yearStart']}-${ent[1]['yearEnd']}`;
      });
      return plainGen;
    } else {
      return '-';
    }
  }

  public filterByBrand($event, type: 'filter' | 'order') {
    switch (type) {
      case 'filter':
        this.brandFilter = $event.detail.value;
        break;
      case 'order':
        this.orderBy = $event.detail.value;
        break;
    }

    this.finalModels = [];
    this.page = 1;
    this.excludedItem = false;
    this.getModels();
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

        this.updateItem(res.saved, 'update');
        this.formModels.reset();
        this.showLoader = false;
        this.activeChecked = true;
        this.pendingReview = false;
        this.generations = {};
        this.showToast(action, res.saved);
        this.utils.setShouldUpdate(['opinions', 'models'], true);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public updateItem(item: any, type: 'update' | 'delete'): void {
    const finalModelsCopy = [...this.finalModels];
    let foundItem = false;
    this.finalModels = [];

    for (let i = 0; i < finalModelsCopy.length; i++) {
      if (item['_id'] === finalModelsCopy[i]['_id']) {
        foundItem = true;

        if (type === 'delete') {
          finalModelsCopy.splice(i, 1);
        } else {
          finalModelsCopy[i]['active'] = item['active'];
          finalModelsCopy[i]['review'] = item['review'];
          finalModelsCopy[i]['name'] = item['name'];
          finalModelsCopy[i]['brand'] = item['brand'];
          finalModelsCopy[i]['url'] = item['url'];
          finalModelsCopy[i]['modified'] = item['modified'];
          finalModelsCopy[i]['modified_by'] = item['modified_by'];
          finalModelsCopy[i]['category'] = item['category'];
          finalModelsCopy[i]['generations'] = this.formatGeneration(item['generation']);
        }
      }
    }

    if (type === 'update' && !foundItem) {
      finalModelsCopy.unshift(item);
    }

    setTimeout(() => {
      this.finalModels = finalModelsCopy;
    }, 50);
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
