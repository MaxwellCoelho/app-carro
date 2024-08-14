/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router, ActivatedRoute, NavigationExtras, ParamMap } from '@angular/router';

@Component({
  selector: 'app-busca',
  templateUrl: 'busca.page.html',
  styleUrls: ['busca.page.scss'],
})
export class BuscaPage implements ViewWillEnter {

  public nav = NAVIGATION;
  public filteredBrands = [];
  public selectedBrand: object;
  public models = [];
  public filteredModels = [];
  public selectedModel: object;
  public showLoader: boolean;
  public otherBrand = false;
  public otherModel = false;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public searchService: SearchService,
    public router: Router,
    public route: ActivatedRoute,
    public utils: UtilsService,
  ) {
    this.searchService.clearSearch$.subscribe(
      () => this.ionViewWillEnter()
    );
  }

  public ionViewWillEnter(): void {
    this.setInitialTitle();

    this.filteredBrands = [];
    this.selectedBrand = null;
    this.filteredModels = [];
    this.selectedModel = null;
    this.models = [];

    this.getBrands();
  }

  public getBrands(): void {
    this.showLoader = true;

    if (!this.searchService.getAllBrands().length) {
      const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
        res => {
          if (!subBrands.closed) { subBrands.unsubscribe(); }
          this.getBrandSuccess(res);
        },
        err => this.showErrorToast(err)
      );
    } else {
      this.getBrandSuccess();
    }
  }

  public getUrlParams(): object {
    let brandParam;

    this.route.paramMap.subscribe((params: ParamMap) => {
      brandParam = params.get('marca');
    });

    return {
      brand: brandParam
    };
  }

  public getBrandSuccess(res?) {
    if (res) {
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
    }

    const urlParams = location.search.replace('?','').split('&');
    const searchBrand = this.getUrlParams();
    let currentBrand;
    let searchTerm;

    if (searchBrand['brand']) {
      currentBrand = this.searchService.getAllBrands().find(brand => brand['url'] === searchBrand['brand']);
      if (currentBrand) {
        this.selectBrand(currentBrand);
      }
    }

    urlParams.find(param => {
      const splitted = param.split('=');
      if (splitted[0] === 'search') {
        searchTerm = splitted[1];
      }
    });

    if (searchTerm && !currentBrand) {
      this.otherBrand = true;
      this.searchBrandInput({target: {value: 'outro'}});
    } else {
      this.otherBrand = false;
      this.filteredBrands = this.searchService.getAllBrands();
    }

    this.showLoader = false;
  }

  public selectBrand(brand) {
    this.utils.setPageTitle(`Busca por modelos de carro da ${brand['name']}`, `Opiniões reais e sincera dos donos de carros da ${brand['name']}.`, `${brand['name']}`);
    this.selectedBrand = brand;
    this.getModel();
  }

  public setInitialTitle(): void {
    this.utils.setPageTitle('Busca por marcas de carro', 'Opiniões reais e sincera dos donos de carros de todas as marcas e modelos.');
  }

  public clearBrand() {
    this.setInitialTitle();
    this.filteredBrands = this.searchService.getAllBrands();
    this.selectedBrand = null;
    const params: NavigationExtras = { queryParams: { brand: null, search: null }, queryParamsHandling: 'merge' };
    this.router.navigate([NAVIGATION.search.route], params);
  }

  public searchBrandInput($event) {
    const query = $event.target.value.toLowerCase();
    this.filteredBrands = [];

    requestAnimationFrame(() => {
      this.searchService.getAllBrands().forEach((item) => {
        if (item['name'].toLowerCase().indexOf(query) > -1) {
          this.filteredBrands.push(item);
        }
      });
    });
  }

  public getModel(): void {
    const mododelsBybrand = this.searchService.getModelsByBrand(this.selectedBrand['url']);
    this.showLoader = true;

    if (!mododelsBybrand.length) {
      const myFilter = { ['brand._id']: this.selectedBrand['_id'] };
      const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
      const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
        res => {
          if (!subModels.closed) { subModels.unsubscribe(); }
          this.getModelSuccess(res);
        },
        err => {
          this.showErrorToast(err);
        }
      );
    } else {
      this.models = mododelsBybrand;
      this.getModelSuccess();
    }
  }

  public getModelSuccess(res?): void {

    if (res) {
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
    }

    const urlParams = location.search.replace('?','').split('&');
    let searchTerm;
    urlParams.find(param => {
      const splitted = param.split('=');

      if (splitted[0] === 'search') {
        searchTerm = splitted[1];
      }
    });

    if (searchTerm) {
      this.otherModel = true;
      this.searchModelInput({target: {value: 'outro'}});
    } else {
      this.otherModel = false;
      this.filteredModels = this.models;
    }

    this.showLoader = false;
  }

  public searchModelInput($event) {
    const query = $event.target.value.toLowerCase();
    this.filteredModels = [];

    requestAnimationFrame(() => {
      this.models.forEach((item) => {
        if (item.name.toLowerCase().indexOf(query) > -1) {
          this.filteredModels.push(item);
        }
      });
    });
  }

  public clickCarItem($event, brand, model) {
    const id = $event.target.id;
    const page = id && !id.includes('item-img') && !id.includes('item-label') ? 'opinar' : 'opiniao';
    const pageUrl = `/${page}/${brand}/${model}`;

    this.saveSelectedModel(model);
    this.clearBrand();
    this.router.navigate([pageUrl]);
  }

  public saveSelectedModel(modelName: string): void{
    const selectedModel = this.filteredModels.find(mod => mod.url.toLowerCase() === modelName.toLowerCase());
    this.searchService.saveModel(selectedModel);
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
}
