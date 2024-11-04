/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { InfiniteScrollCustomEvent, ToastController, ViewWillEnter } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { VALUATION, VALUATION_NOT_FOUND } from 'src/app/helpers/valuation.helper';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';

@Component({
  selector: 'app-melhores',
  templateUrl: 'melhores.page.html',
  styleUrls: ['melhores.page.scss'],
})
export class MelhoresPage implements OnInit, ViewWillEnter {

  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public bestModels: Array<any> = [];
  public bestModelsToShow: object = {1: []};
  public showLoader: boolean;
  public page = 1;
  public pageList = [1];
  public pagination = 20;
  public showTopButton = false;
  public brandIdFilter: object;
  public categoryIdFilter: object;
  public newerYear = new Date().getFullYear();
  public yearMinValue = 1980;
  public filterYearValue = { lower: this.yearMinValue, upper: this.newerYear + 1 };
  public showDateFilter = false;
  public podium: Array<any> = [];
  public isClearAllFilters = false;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public router: Router,
    public utils: UtilsService,
    public searchService: SearchService,
    public cryptoService: CryptoService
  ) {}

  handleScroll(event) {
    this.showTopButton = event.detail.scrollTop > 700;
  }

  public ngOnInit(): void {
    if (!this.utils.getShouldUpdate('bests')) {
      this.filterBestModels();
    }
  }

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Melhores avaliados', 'Opiniões reais e sincera dos donos de carros de todas as marcas e modelos.', 'melhor, melhores, ranking');
    if (this.utils.getShouldUpdate('bests')) {
      this.utils.setShouldUpdate(['bests'], false);
      this.clearBestModels();
      this.filterBestModels();
    }

    this.getBrands();
    this.getCategories();
  }

  public clearBestModels(): void {
    this.bestModelsToShow = this.bestModelsToShow['1'];
    this.bestModels = [];
    this.page = 1;
    this.pageList = [1];
    this.pagination = 20;
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

  public getCategories(): void {
    const recoveredCategories = this.searchService.getAllCategories();
    if (!recoveredCategories.length) {
      const subCategories = this.dbService.getItens(environment.categoriesAction).subscribe(
        res => {
          if (!subCategories.closed) { subCategories.unsubscribe(); }
          this.searchService.saveAllCategories(res.categories);
        },
        err => {}
      );
    }
  }

  public filterBestModels(): void {
    if (this.page === 1) { this.showLoader = true; }
    const myFilter = {
      'generation.g1.yearStart': { $lte: this.filterYearValue.upper },
      'generation.g1.yearEnd': { $gte: this.filterYearValue.lower === this.yearMinValue ? 1900 : this.filterYearValue.lower }
    };

    if (this.brandIdFilter) {
      myFilter['brand._id'] = this.brandIdFilter['id'];
    }

    if (this.categoryIdFilter) {
      myFilter['category._id'] = this.categoryIdFilter['id'];
    }

    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subBrands = this.dbService.filterItem(environment.filterBestModelsAction, jwtData, this.page.toString(), this.pagination.toString()).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        const modelWithAverage = this.setModelAverages(res.bestModels);
        this.bestModels = [...this.bestModels, ...modelWithAverage];

        for (let i = 0; i < 3; i++) {
          if (this.bestModels[i]) {
            this.bestModels[i]['img'] = this.utils.getModelImg(this.bestModels[i]['url'], this.bestModels[i]['generation']);
          }

          if (this.podium.length < 3) {
            this.podium.push(this.bestModels[i]);
          }
        }

        this.bestModelsToShow[this.page] = modelWithAverage;

        if (this.page === 1) { this.showLoader = false; }
        this.page++;
        this.pageList.push(this.page);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  filterBrand($event) {
    const value = $event.detail.value;
    this.brandIdFilter = value === 'allBrands' ? null : value;

    if (!this.isClearAllFilters) {
      this.clearBestModels();
      this.filterBestModels();
    }
  }

  filterCategory($event) {
    const value = $event.detail.value;
    this.categoryIdFilter = value === 'allCategories' ? null : value;

    if (!this.isClearAllFilters) {
      this.clearBestModels();
      this.filterBestModels();
    }
  }

  clearFilter(filter) {
    switch (filter) {
      case 'allCategories':
        document.getElementById('categorySelect')['value'] = filter;
        break;
      case 'allBrands':
        document.getElementById('brandSelect')['value'] = filter;
        break;
    }
  }

  clearAllFilters() {
    this.isClearAllFilters = true;
    this.clearFilter('allCategories');
    this.clearFilter('allBrands');
    this.filterYearValue = { lower: this.yearMinValue, upper: this.newerYear + 1 };
    this.clearBestModels();
    this.filterBestModels();

    setTimeout(() => {
      this.isClearAllFilters = false;
    }, 1000);
  }

  public filterYear($event) {
    const value = $event.detail.value;
    this.filterYearValue = value;
    this.showDateFilter = value.upper < this.newerYear + 1 || value.lower > this.yearMinValue;
  }

  public setModelAverages(models: any): any {
    const modelWithAverage = [];
    const recoveredReviewBrands = this.utils.recoveryCreatedItem('createdBrand');
    const recoveredReviewModel = this.utils.recoveryCreatedItem('createdModel');
    let position = this.bestModels.length + 1;

    models.forEach(model => {
      const checkBrandReview = !model.brand.review
        || (model.brand.review && recoveredReviewBrands.find(item => item['_id'] === model.brand['_id']));
      const checkModelReview = !model.review || (model.review && recoveredReviewModel.find(item => item['_id'] === model['_id']));

      if (model.brand.active && model.active && model.val_length > 0 && checkBrandReview && checkModelReview) {
        const average = model.average;
        const int = average ? average.toFixed(2) : 0;
        const valuation = VALUATION.slice();
        const foundVal = valuation.filter(val => val.value <= int);
        model.average = foundVal.length ? foundVal[foundVal.length - 1] : VALUATION_NOT_FOUND;
        model['model_average'] = average;
        modelWithAverage.push(model);
      }

      model['position'] = position;
      position++;
    });

    return modelWithAverage;
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

  public clickCarItem($event, brand, model) {
    const id = $event.target.id;
    const page = id && !id.includes('item-img') && !id.includes('item-label') ? 'opinar' : 'opiniao';
    const pageUrl = `/${page}/${brand}/${model}`;

    this.router.navigate([pageUrl]);
  }

  onIonInfinite(ev) {
    if (this.bestModels.length === ((this.page - 1)*this.pagination)) {
      this.filterBestModels();
    }

    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  up() {
    this.content.scrollToTop(700);
  }
}
