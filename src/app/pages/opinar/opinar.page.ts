/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, ParamMap } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-opinar',
  templateUrl: 'opinar.page.html',
  styleUrls: ['opinar.page.scss'],
})
export class OpinarPage implements OnInit, ViewWillEnter {

  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public selectedModel: object;
  public showLoader: boolean;
  public finalPayload = {};
  public currentStep = 1;
  public years = [];
  public carVersions = [];

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
    public utils: UtilsService
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && this.currentStep >= 4) {
        this.clearFinalPayload();
      }
    });
  }

  ngOnInit(): void {
    if (!this.utils.getShouldUpdate('versions')) {
    this.loadModelInfo();
    }
  }

  public ionViewWillEnter(): void {
    if (this.utils.getShouldUpdate('versions')) {
      this.utils.setShouldUpdate(['versions'], false);
      this.selectedModel = null;
      this.searchService.saveModel(this.selectedModel);
      this.years = [];
      this.loadModelInfo();
    }
  }

  public loadModelInfo(): void {
    this.selectedModel = this.searchService.getModel();

    if (this.selectedModel) {
      this.searchService.clearModel();
      this.loadFinalPayload();
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
        if (!foundModel) {
          this.showErrorToast({status: 404});
          return;
        }
        const recoveredReviewBrands = this.utils.recoveryCreatedItem('createdBrand');
        const checkReviewBrand = foundModel && !foundModel.brand.review
          || (foundModel.brand.review && recoveredReviewBrands.find(item => item['_id'] === foundModel.brand['_id']));
        const recoveredReviewModel = this.utils.recoveryCreatedItem('createdModel');
        const checkReviewModel = foundModel && !foundModel.review
          || (foundModel.review && recoveredReviewModel.find(item => item['_id'] === foundModel['_id']));

        if (foundModel && checkReviewBrand && checkReviewModel) {
          this.selectedModel = foundModel;
          this.showLoader = false;
          this.loadFinalPayload();
        } else {
          this.showErrorToast({status: 404});
        }
      },
      err => {
        this.showErrorToast(err);
      }
    );
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

  public setAboutCarPayload($event) {
    this.finalPayload['aboutCar'] = $event.aboutCar;
    this.years = $event.years;
    this.saveFinalPayload();
    this.currentStep = 2;
    this.content.scrollToTop(700);
  }

  public setAboutBrandPayload($event?) {
    if ($event) {
      this.finalPayload['aboutBrand'] = $event;
      this.saveFinalPayload();
    }
    this.currentStep = 3;
    this.content.scrollToTop(700);
  }

  public setStepSendPayload($event) {
    this.finalPayload['userInfo'] = $event;
    this.finalPayload['active'] = true;
    this.saveFinalPayload();
    this.checkAboutCarPayload();
  }

  public saveFinalPayload() {
    const encoded = this.cryptoService.encondeJwt(this.finalPayload);
    this.utils.localStorageSetItem(`opinar_${this.selectedModel['url']}`, encoded);
  }

  public loadFinalPayload() {
    this.utils.setPageTitle(`Opinar ${this.selectedModel['brand'].name} ${this.selectedModel['name']}`);
    const encoded = this.utils.localStorageGetItem(`opinar_${this.selectedModel['url']}`);

    if (encoded) {
      this.finalPayload = this.cryptoService.decodeJwt(encoded);
    }
  }

  public sendFinalPayload() {
    this.showLoader = true;

    const sendCarOpinion = () => {
      const aboutCar = this.finalPayload['aboutCar'];
      this.finalPayload['aboutCar'] = {
        carBrand : aboutCar['carBrand'],
        carVersion : aboutCar['carVersion'],
        carModel : aboutCar['carModel'],
        yearModel : aboutCar['yearModel'],
        yearBought : aboutCar['yearBought'],
        kmBought : aboutCar['kmBought'],
        keptPeriod : aboutCar['keptPeriod'],
        finalWords : aboutCar['finalWords'],
        valuation : aboutCar['valuation'],
      };

      const jwtData = { data: this.cryptoService.encondeJwt(this.finalPayload)};
      const subOpinion = this.dbService.createItem(environment.opinionModelAction, jwtData).subscribe(
        res => {
          if (!subOpinion.closed) { subOpinion.unsubscribe(); }
          this.currentStep = 4;
          this.content.scrollToTop(700);
          this.utils.setShouldUpdate(['opinions', 'bests'], true);
          this.showLoader = false;
        },
        err => {
          this.showErrorToast(err);
        }
      );
    };

    if (this.finalPayload['aboutBrand']) {
      const finalPayloadBrand = {
        aboutBrand: this.finalPayload['aboutBrand'],
        userInfo: this.finalPayload['userInfo'],
        active: this.finalPayload['active']
      };

      const jwtBrandData = { data: this.cryptoService.encondeJwt(finalPayloadBrand)};
      const subBrandOpinion = this.dbService.createItem(environment.opinionBrandAction, jwtBrandData).subscribe(
        res => {
          if (!subBrandOpinion.closed) { subBrandOpinion.unsubscribe(); }
          sendCarOpinion();
        },
        err => {
          if (!subBrandOpinion.closed) { subBrandOpinion.unsubscribe(); }
          sendCarOpinion();
        }
      );

      delete this.finalPayload['aboutBrand'];
    } else {
      sendCarOpinion();
    }
  }

  public checkAboutCarPayload(): void {
    const yearModel = parseInt(this.finalPayload['aboutCar']['yearModel'], 10);
    const foundYear = this.years.indexOf(yearModel) >= 0;

    const setVersion = (jwtData: any, id?: string) => {
      this.showLoader = true;
      const subVersion = this.dbService.createItem(environment.versionsAction, jwtData, id).subscribe(
        res => {
          if (!subVersion.closed) { subVersion.unsubscribe(); }
          const versionPayload = this.setCarVersionPayload(res['saved']);
          this.finalPayload['aboutCar']['carVersion'] = {
            ...versionPayload,
            _id: res['saved']['_id'],
            years: res['saved']['years'],
            active: res['saved']['active'],
            review: res['saved']['review']
          };
          this.utils.setShouldUpdate(['versions'], true);
          this.showLoader = false;
          this.sendFinalPayload();
        },
        err => {
          this.showErrorToast(err);
        }
      );
    };

    if (this.finalPayload['aboutCar']['carVersion'] !== 'anotherVersion' && !foundYear) {
      const versionId = this.finalPayload['aboutCar']['carVersion'];
      const newVersion = {
        years: yearModel,
        review: true
      };
      const jwtData = { data: this.cryptoService.encondeJwt(newVersion)};
      setVersion(jwtData, versionId);
    } else if (this.finalPayload['aboutCar']['carVersion'] === 'anotherVersion') {
      const versionPayload = this.setCarVersionPayload(this.finalPayload['aboutCar']);
      const newVersion = {
        ...versionPayload,
        years: yearModel,
        model: this.finalPayload['aboutCar']['carModel'],
        active: true,
        review: true
      };
      const jwtData = { data: this.cryptoService.encondeJwt(newVersion)};
      setVersion(jwtData);
    } else {
      const versionId = this.finalPayload['aboutCar']['carVersion'];
      const version = this.carVersions.find(ver => ver['_id'] === versionId);
      if (version) {
        const versionPayload = this.setCarVersionPayload(version);
        this.finalPayload['aboutCar']['carVersion'] = {
          ...versionPayload,
          _id: version['_id'],
          years: version['years'],
          active: version['active'],
          review: version['review']
        };
      }
      this.sendFinalPayload();
    }
  }

  public setCarVersionPayload(source: any): any {
    return {
      engine: source['engine'],
      fuel: source['fuel'],
      gearbox: source['gearbox'],
      complement: source['complement']
    };
  }

  public clearFinalPayload() {
    this.finalPayload = {};
    this.utils.localStorageRemoveItem(`opinar_${this.selectedModel['url']}`);
    this.currentStep = 1;
  }

  public goBack(step?: number) {
    if (step) {
      this.currentStep = step;
    } else {
      this.router.navigate([NAVIGATION.search.route]);
    }
  }

  public goOpinions() {
    this.router.navigate([`opiniao/${this.selectedModel['brand']['url']}/${this.selectedModel['url']}`]);
  }

  public goSearch() {
    this.router.navigate([NAVIGATION.search.route]);
  }

  changeModel() {
    const params: NavigationExtras = { queryParams: { brand: this.selectedModel['brand'].url }, queryParamsHandling: 'merge' };
    this.router.navigate([NAVIGATION.search.route], params);
  }

  saveLoadedVersions($event) {
    this.carVersions = $event;
  }
}
