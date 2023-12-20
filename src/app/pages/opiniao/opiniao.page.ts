/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { VALUATION, VALUATION_ITENS_CAR, VALUATION_NOT_FOUND } from 'src/app/helpers/valuation.helper';

@Component({
  selector: 'app-opiniao',
  templateUrl: 'opiniao.page.html',
  styleUrls: ['opiniao.page.scss'],
})
export class OpiniaoPage implements OnInit {

  public nav = NAVIGATION;
  public selectedModel: object;
  public modelOpinions: object;
  public showLoader: boolean;
  public modelAverage: object;

  public valuation = VALUATION.slice();
  public valuationItens = [];

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadModelInfo();
  }

  public loadModelInfo(): void {
    this.selectedModel = this.searchService.getModel();

    if (this.selectedModel) {
      this.searchService.clearModel();
      this.getModelOpinions();
    } else {
      this.getModel();
    }
  }

  public getModel(): void {
    this.showLoader = true;

    const urlParams = this.getUrlParams();
    const myFilter = { url: urlParams['model'] };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }

        const foundModel = res.models.find(mod => mod.brand.url === urlParams['brand'] && mod.active);

        if (foundModel) {
          this.selectedModel = foundModel;
          this.getModelOpinions();
        } else {
          this.showErrorToast({status: 404});
        }
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public getModelOpinions(): void {
    const action = `${environment.opinionAction}/${this.selectedModel['brand']['_id']}/${this.selectedModel['_id']}`;
    const subModelOpinions = this.dbService.getItens(action,).subscribe(
      res => {
        if (!subModelOpinions.closed) { subModelOpinions.unsubscribe(); }

        this.modelOpinions = res;
        this.setModelAverages(res.averages);
        this.setOpinionValuation();
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public setModelAverages(averages: any) {
    const average = averages.average;
    this.modelAverage = this.getValuationItemByValue(average);

    const valItens = VALUATION_ITENS_CAR.slice();

    for (const valItem of valItens) {
      if (averages[valItem.value]) {
        const newItem = {
          ...valItem,
          valuation: this.getValuationItemByValue(averages[valItem.value])
        };

        this.valuationItens.push(newItem);
      }
    }
  }

  public setOpinionValuation() {
    for (const opinion of this.modelOpinions['opinions']) {
      opinion['average'] = this.getValuationItemByValue(opinion.car_val_average);

      const valItens = VALUATION_ITENS_CAR.slice();
      const newItens = [];

      for (const valItem of valItens) {
        const newItem = {
          ...valItem,
          valuation: this.getValuationItemByValue(opinion[`car_val_${valItem.value}`])
        };

        newItens.push(newItem);
      }

      opinion['valuationItens'] = newItens;
    }
  }

  public getValuationItemByValue(value: any): any {
    const int = value ? parseInt(value, 10) : 0;
    const foundVal = this.valuation.find(val => int === val.value);
    return foundVal || VALUATION_NOT_FOUND;
  }

  public getUrlParams(): object {
    let brandParam;
    let modelParam;

    this.route.paramMap.subscribe((params: ParamMap) => {
      brandParam = params.get('marca');
      modelParam = params.get('modelo');
    });

    return {
      brand: brandParam,
      model: modelParam
    };
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
      this.router.navigate([NAVIGATION.search.route]);
    });
  }

  public goToOpinar() {
    this.router.navigate(['/opinar/'+ this.selectedModel['brand']['url'] + '/' + this.selectedModel['url']]);
  }

  public expandDetials(opinionId: string): void {
    document.getElementById(opinionId).querySelector('.details').classList.add('expand-details');
    document.getElementById(opinionId).querySelector('.details-button').classList.add('hide-button');
  }

}
