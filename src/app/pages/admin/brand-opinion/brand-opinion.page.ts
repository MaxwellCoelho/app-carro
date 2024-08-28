/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { FormControl } from '@angular/forms';
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
  selector: 'app-brand-opinion',
  templateUrl: './brand-opinion.page.html',
  styleUrls: ['./brand-opinion.page.scss'],
})
export class BrandOpinionPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public opinions: Array<any> = [];
  public orderBy = 'default';
  public brands: Array<any>;
  public showLoader: boolean;
  public formOpinions: FormGroup;
  public activeChecked = true;
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
    this.getOpinions();
    this.getBrands();
  }

  public initForm() {
    this.formOpinions = this.fb.group({
      editOpinionId: this.fb.control(''),
      newOpinionBrand: this.fb.control('', [Validators.required]),
      newOpinionBrandTitle: this.fb.control('', [Validators.required]),
      newOpinionBrandPositive: this.fb.control('', [Validators.required]),
      newOpinionBrandNegative: this.fb.control('', [Validators.required])
    });
  }

  public getBrands(): void {
    if (!this.brands) {
      const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
        res => {
          if (!subBrands.closed) { subBrands.unsubscribe(); }
          this.brands = this.utils.sortByReview(res.brands);
        },
        err => {
          this.showErrorToast(err);
        }
      );
    }
  }


  public getOpinions(): void {
    this.showLoader = true;

    const isRecent = this.brandFilter === 'nothing';
    const myFilter = {};
    const page = isRecent ? '1' : this.page.toString();
    const pagination = isRecent ? '5' : this.pagination.toString();
    let sort;

    if (isRecent || this.orderBy !== 'default') {
      sort = [
        {name: '_id', value: 'desc'}
      ];
    }

    if (!isRecent && this.brandFilter) {
      myFilter['brand._id'] = this.brandFilter;
    }

    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subOpinions = this.dbService.filterItem(environment.filterOpinionBrandAction, jwtData, page, pagination, sort).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
        this.opinions = [...this.opinions, ...res.opinions];
        this.showLoader = false;
        this.page++;
      },
      err => {
        this.showErrorToast(err);
      }
    );
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

    this.opinions = [];
    this.page = 1;
    this.excludedItem = false;
    this.getOpinions();
  }

  public createOpinion(action: string) {
    this.showLoader = true;
    const opinionId = this.formOpinions.value.editOpinionId;
    const brand = this.brands.find(mo => mo['_id'] === this.formOpinions.value.newOpinionBrand);

    const data = {
      aboutBrand: {
        carBrand: {
          _id: brand['_id'],
          name: brand['name'],
          url: brand['url'],
          active: brand['active'],
          review: brand['review']
        },
        finalWords: {
          title: this.formOpinions.value.newOpinionBrandTitle,
          positive: this.formOpinions.value.newOpinionBrandPositive,
          negative: this.formOpinions.value.newOpinionBrandNegative,
        }
      },
      active: this.activeChecked
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};
    const subOpinions = this.dbService.createItem(environment.opinionBrandAction, jwtData, opinionId).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
        this.formOpinions.reset();
        this.updateItem(res.saved, 'update');
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

  public updateItem(item: any, type: 'update' | 'delete'): void {
    const opinionsCopy = [...this.opinions];
    let foundItem = false;
    this.opinions = [];

    for (let i = 0; i < opinionsCopy.length; i++) {
      if (item['_id'] === opinionsCopy[i]['_id']) {
        foundItem = true;

        if (type === 'delete') {
          opinionsCopy.splice(i, 1);
        } else {
          opinionsCopy[i]['active'] = item['active'];
          opinionsCopy[i]['brand'] = item['brand'];
          opinionsCopy[i]['modified'] = item['modified'];
          opinionsCopy[i]['modified_by'] = item['modified_by'];
        }
      }
    }

    if (type === 'update' && !foundItem) {
      opinionsCopy.unshift(item);
    }

    setTimeout(() => {
      this.opinions = opinionsCopy;
    }, 50);
  }

  public editOpinion(opinion) {
    this.formOpinions.reset({
      editOpinionId: opinion['_id'],
      newOpinionBrandTitle: opinion.brand_title,
      newOpinionBrand: opinion.brand['_id'],
      newOpinionBrandPositive: opinion.brand_positive,
      newOpinionBrandNegative: opinion.brand_negative
    });

    this.activeChecked = opinion.active;

    this.content.scrollToTop(700);
  }

  public deleteOpinion(opinionId: string, action: string) {
    this.showLoader = true;
    const subOpinions = this.dbService.deleteItem(environment.opinionBrandAction, opinionId).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
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

  public showConfirmAlert(action: string, opinion: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${opinion.newOpinionCarTitle || opinion.car_title || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteOpinion(opinion['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createOpinion('Item criado');
          break;
        case 'editar':
          this.createOpinion('Item editado');
          break;
        case 'limpar':
          this.formOpinions.reset();
          this.activeChecked = true;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formOpinions.reset();
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
      message: item ? `Marca: ${item.brand_title}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
