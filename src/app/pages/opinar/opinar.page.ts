/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-opinar',
  templateUrl: 'opinar.page.html',
  styleUrls: ['opinar.page.scss'],
})
export class OpinarPage implements OnInit {

  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public selectedModel: object;
  public showLoader: boolean;
  public finalPayload = {};
  public currentStep = 1;

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
    this.loadModelInfo();
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
        const recoveredReviewBrands = this.utils.recoveryCreatedBrandOrModel('createdBrand');
        const checkReviewBrand = foundModel && !foundModel.brand.review
          || (foundModel.brand.review && recoveredReviewBrands.find(item => item['_id'] === foundModel.brand['_id']));
        const recoveredReviewModel = this.utils.recoveryCreatedBrandOrModel('createdModel');
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
      // this.router.navigate([NAVIGATION.search.route]);
    });
  }

  public setAboutCarPayload($event) {
    this.finalPayload['aboutCar'] = $event;
    this.saveFinalPayload();
    this.currentStep = 2;
    this.content.scrollToTop(700);
  }

  public setAboutBrandPayload($event) {
    this.finalPayload['aboutBrand'] = $event;
    this.saveFinalPayload();
    this.currentStep = 3;
    this.content.scrollToTop(700);
  }

  public setStepSendPayload($event) {
    this.finalPayload['userInfo'] = $event;
    this.finalPayload['active'] = true;
    this.saveFinalPayload();
    this.sendFinalPayload();
  }

  public saveFinalPayload() {
    const encoded = this.cryptoService.encondeJwt(this.finalPayload);
    this.utils.localStorageSetItem(`opinar_${this.selectedModel['url']}`, encoded);
  }

  public loadFinalPayload() {
    const encoded = this.utils.localStorageGetItem(`opinar_${this.selectedModel['url']}`);

    if (encoded) {
      this.finalPayload = this.cryptoService.decodeJwt(encoded);
    }
  }

  public sendFinalPayload() {
    this.showLoader = true;
    const jwtData = { data: this.cryptoService.encondeJwt(this.finalPayload)};

    const subOpinion = this.dbService.createItem(environment.opinionAction, jwtData).subscribe(
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

}
