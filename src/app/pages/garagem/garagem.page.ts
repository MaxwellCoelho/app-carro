/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { NavigationExtras, Router } from '@angular/router';
import { VALUATION, VALUATION_ITENS_CAR, VALUATION_NOT_FOUND } from 'src/app/helpers/valuation.helper';
import { SearchService } from 'src/app/services/search/search.service';

@Component({
  selector: 'app-garagem',
  templateUrl: 'garagem.page.html',
  styleUrls: ['garagem.page.scss'],
})
export class GaragemPage implements OnInit, ViewWillEnter {

  public nav = NAVIGATION;
  public showLoader: boolean;
  public myModelOpinions = [];
  public modalContent: object;
  public valuation = VALUATION.slice();
  public models: Array<any>;
  public selectedBrand: string;
  public selectedModel: string;

  constructor(
    public utils: UtilsService,
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public router: Router,
    public searchService: SearchService,
  ) {}

  public ngOnInit(): void {
    if (!this.utils.getShouldUpdate('opinions')) {
      this.getModelOpinions();
    }
  }

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Minha garagem', 'Opiniões reais e sincera dos donos de carros de todas as marcas e modelos.', 'minha garagem, garagem, meus carros, meu carro');
    if (this.utils.getShouldUpdate('opinions')) {
      this.utils.setShouldUpdate(['opinions'], false);
      this.myModelOpinions = [];
      this.getModelOpinions();
    }

    this.getBrands();
  }

  public getModelOpinions(): void {
    this.showLoader = true;
    const myFilter = { ['created_by._id']: this.utils.sessionUser['_id'] };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterOpinionModelAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.myModelOpinions = res.models && res.models.opinions && res.models.opinions.length ? res.models.opinions : [];

        this.myModelOpinions.forEach(model => {
          model.img = this.utils.getModelImg(model.model.url, model.model.generation, model.year_model);
        });

        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
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

  public clickCarItem(page: string, brand: string, model: string) {
    const pageUrl = `/${page}/${brand}/${model}`;
    this.router.navigate([pageUrl]);
  }

  public clickMyOpinion(car: any): void {
    this.modalContent = car;
    this.setOpinionValuation();
  }

  public setOpinionValuation() {
    this.modalContent['average'] = this.getValuationItemByValue(this.modalContent['car_val_average']);

    const valItens = [...VALUATION_ITENS_CAR];
    const newItens = [];

    for (const valItem of valItens) {
      const newItem = {
        ...valItem,
        valuation: this.getValuationItemByValue(this.modalContent[`car_val_${valItem.value}`])
      };

      newItens.push(newItem);
    }

    this.modalContent['valuationItens'] = newItens;

    const createdDate = this.modalContent['created'] ? this.modalContent['created'].split(' ')[0] : null;
    const createdYear = createdDate ? createdDate.split('/')[2] : null;

    this.modalContent['current_car'] = createdYear && (parseInt(this.modalContent['year_bought'], 10) + this.modalContent['kept_period'] === parseInt(createdYear, 10));
  }

  public getValuationItemByValue(value: any): any {
    const int = value ? value.toFixed(2) : 0;
    const foundVal = this.valuation.filter(val => val.value <= int);
    return foundVal.length ? foundVal[foundVal.length - 1] : VALUATION_NOT_FOUND;
  }

  closeModal() {
    this.modalContent = null;
  }

  public chooseBrand($event) {
    const selected = $event.detail.value;
    this.selectedModel = null;
    this.models = null;
    this.selectedBrand = selected;

    if (selected === 'anotherBrand') {
      this.goToOpinar();
    } else {
      this.getModels();
    }
  }

  public chooseModel($event) {
    const selected = $event.detail.value;

    if (selected) {
      this.selectedModel = selected;
      this.goToOpinar();
    }
  }

  public getBrands(): void {
    if (!this.searchService.getAllBrands().length) {
      const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
        res => {
          if (!subBrands.closed) { subBrands.unsubscribe(); }
          const recoveredReviewBrands = this.utils.recoveryCreatedItem('createdBrand');
          const brands = [];
          for (const brand of res.brands) {
            if (brand.active) {
              if (!brand.review || (brand.review && recoveredReviewBrands.find(item => item['_id'] === brand['_id']))) {
                brands.push(brand);
              }
            }
          }

          this.searchService.saveAllBrands(brands);
        },
        err => {}
      );
    }
  }

  public getModels(): void {
    const mododelsBybrand = this.searchService.getModelsByBrand(this.selectedBrand);

    if (!mododelsBybrand.length) {
      const myFilter = { ['brand.url']: this.selectedBrand };
      const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
      const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
        res => {
          if (!subModels.closed) { subModels.unsubscribe(); }
          const recoveredReviewModel = this.utils.recoveryCreatedItem('createdModel');
          this.models = [];
          for (const model of res.models) {
            if (model.active) {
              if (!model.review || (model.review && recoveredReviewModel.find(item => item['_id'] === model['_id']))) {
                this.models.push(model);
              }
            }
          }

          this.searchService.saveModels(this.models);
        },
        err => {}
      );
    } else {
      this.models = mododelsBybrand;
    }
  }

  goToOpinar() {
    if (this.selectedBrand === 'anotherBrand') {
      const params: NavigationExtras = { queryParams: { search: 'outro' }, queryParamsHandling: 'merge' };
      this.router.navigate([NAVIGATION.search.route], params);
    } else if (this.selectedModel === 'anotherModel') {
      const params: NavigationExtras = { queryParams: { search: 'outro' }, queryParamsHandling: 'merge' };
      const buscaUrl = `${NAVIGATION.search.route}/${this.selectedBrand}`;
      this.router.navigate([buscaUrl], params);
    } else if (this.selectedBrand && this.selectedModel) {
      const opinarUrl = `opinar/${this.selectedBrand}/${this.selectedModel}`;
      this.router.navigate([opinarUrl]);
    }

    this.selectedModel = null;
    this.selectedBrand = null;
  }
}
