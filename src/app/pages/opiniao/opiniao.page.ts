/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, ParamMap } from '@angular/router';
import { NAVIGATION, DISCLAIMER } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { InfiniteScrollCustomEvent, ToastController, ViewWillEnter } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { VALUATION, VALUATION_ITENS_CAR, VALUATION_NOT_FOUND } from 'src/app/helpers/valuation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { FavoriteService } from 'src/app/services/favorite/favorite.service';

@Component({
  selector: 'app-opiniao',
  templateUrl: 'opiniao.page.html',
  styleUrls: ['opiniao.page.scss'],
})
export class OpiniaoPage implements OnInit, ViewWillEnter {

  public nav = NAVIGATION;
  public disclaimer = DISCLAIMER;
  public selectedModel: object;
  public modelOpinions: object;
  public showLoader: boolean;
  public loadedModelAndOpinions = false;
  public modelAverage: object;

  public valuation = VALUATION.slice();
  public valuationItens = [];
  public page = 1;
  public pagination = 20;
  public like = false;
  public dislike = false;

  public isFavorite: boolean;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
    public utils: UtilsService,
    public favorite: FavoriteService
  ) {}

  public ngOnInit(): void {
    if (!this.utils.getShouldUpdate('opinions')) {
      this.loadModelInfo();
    }
  }

  public ionViewWillEnter(): void {
    if (this.selectedModel) {
      this.setPageTitle();
    }
    if (this.utils.getShouldUpdate('opinions')) {
      this.utils.setShouldUpdate(['opinions'], false);
      this.selectedModel = null;
      this.searchService.saveModel(this.selectedModel);
      this.modelOpinions = null;
      this.modelAverage = null;
      this.valuationItens = [];
      this.page = 1;
      this.pagination = 20;
      this.loadModelInfo();
    } else if (this.selectedModel) {
      this.isFavorite = this.favorite.isFavorite(this.selectedModel);
      this.checkReactions();
    }
  }

  public setPageTitle() {
    this.utils.setPageTitle(`${this.selectedModel['brand'].name} ${this.selectedModel['name']}`, `Opiniões reais e sincera dos donos de ${this.selectedModel['brand'].name} ${this.selectedModel['name']}.`, `${this.selectedModel['brand'].name} ${this.selectedModel['name']}, ${this.selectedModel['brand'].name}, ${this.selectedModel['name']}`);
  }

  public loadModelInfo(): void {
    this.selectedModel = this.searchService.getModel();

    if (this.selectedModel) {
      this.setModelImage();
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
        const foundModel = this.utils.findActiveModel(res.models, urlParams['brand']);

        if (foundModel) {
          this.selectedModel = foundModel;
          this.setModelImage();
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

  public setModelImage() {
    this.selectedModel['img'] = this.utils.getModelImg(this.selectedModel['url'], this.selectedModel['generation']);
  }

  public getModelOpinions(): void {
    this.isFavorite = this.favorite.isFavorite(this.selectedModel);
    this.checkReactions();
    this.setPageTitle();
    const action = `${environment.opinionModelAction}/${this.selectedModel['brand']['_id']}/${this.selectedModel['_id']}`;
    const subModelOpinions = this.dbService.getItens(action, this.page.toString(), this.pagination.toString()).subscribe(
      res => {
        if (!subModelOpinions.closed) { subModelOpinions.unsubscribe(); }
        if (this.page === 1) {
          this.modelOpinions = res;
        } else {
          this.modelOpinions['opinions'] = [...this.modelOpinions['opinions'], ...res.opinions];
        }
        this.setModelAverages(res.averages);
        this.setOpinionValuation();
        this.showLoader = false;
        this.loadedModelAndOpinions = true;
        this.page++;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public setModelAverages(averages: any) {
    const average = averages.average;
    this.modelAverage = this.getValuationItemByValue(average);

    const valItens = [...VALUATION_ITENS_CAR];

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

      const valItens = [...VALUATION_ITENS_CAR];
      const newItens = [];

      for (const valItem of valItens) {
        const newItem = {
          ...valItem,
          valuation: this.getValuationItemByValue(opinion[`car_val_${valItem.value}`])
        };

        newItens.push(newItem);
      }

      opinion['valuationItens'] = newItens;

      const createdDate = opinion['created'] ? opinion['created'].split(' ')[0] : null;
      const createdYear = createdDate ? createdDate.split('/')[2] : null;

      opinion['current_car'] = createdYear && (parseInt(opinion['year_bought'], 10) + opinion['kept_period'] === parseInt(createdYear, 10));
    }
  }

  public getValuationItemByValue(value: any): any {
    const int = value ? value.toFixed(2) : 0;
    const foundVal = this.valuation.filter(val => val.value <= int);
    return foundVal.length ? foundVal[foundVal.length - 1] : VALUATION_NOT_FOUND;
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
    this.loadedModelAndOpinions = true;
    console.error(err);

    // this.toastController.create({
    //   header: 'Atenção!',
    //   message: response,
    //   duration: 4000,
    //   position: 'middle',
    //   icon: 'warning-outline',
    //   color: 'danger'
    // }).then(toast => {
    //   toast.present();
    //   this.router.navigate([NAVIGATION.search.route]);
    // });
  }

  public goToOpinar() {
    this.router.navigate(['/opinar/'+ this.selectedModel['brand']['url'] + '/' + this.selectedModel['url']]);
  }

  onIonInfinite(ev) {
    if (this.modelOpinions['opinions'].length === ((this.page - 1)*this.pagination)) {
      this.getModelOpinions();
    }

    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  changeModel() {
    const buscaUrl = `${NAVIGATION.search.route}/${this.selectedModel['brand'].url}`;
    this.router.navigate([buscaUrl]);
  }

  addOrRemoveFavorite() {
    this.isFavorite = this.favorite.addOrRemoveFavorite(this.selectedModel);
    const type = this.isFavorite ? 'adicionado' : 'removido';
    this.showFavoriteToast(type);
  }

  public showFavoriteToast(type: string): void {
    this.toastController.create({
      header: 'Favoritos:',
      message: `${this.selectedModel['brand']['name']} ${this.selectedModel['name']} ${type} com sucesso!`,
      duration: 4000,
      position: 'middle',
      icon: type === 'adicionado' ? this.nav.favorite.icon : `${this.nav.favorite.icon}-outline`,
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }

  public goSearch() {
    this.router.navigate([NAVIGATION.search.route]);
  }

  public shareSocialMedia(media: string): void {
    let linkMedia;
    const treatedLink = location.href.replace('http://localhost:4200', 'https://krro.com.br');

    switch (media) {
      case 'whatsapp':
        linkMedia = `https://api.whatsapp.com/send?text=${treatedLink}`;
        break;
      case 'facebook':
        linkMedia = `https://www.facebook.com/sharer/sharer.php?u=${treatedLink}`;
        break;
      case 'instagram':
        linkMedia = '';
        break;
      case 'linkedin':
        linkMedia = `https://www.linkedin.com/shareArticle?mini=true&url=${treatedLink}`;
        break;
      case 'telegram':
        linkMedia = `https://telegram.me/share/url?url=${treatedLink}`;
        break;
      case 'twitter':
        linkMedia = `https://twitter.com/intent/tweet?url=${treatedLink}&text=Opiniões%20reais%20dos%20donos%20de%20${this.selectedModel['brand'].name}%20${this.selectedModel['name']}`;
        break;
      case 'pinterest':
        linkMedia = `https://pinterest.com/pin/create/button/?url=${treatedLink}&description=Opiniões%20reais%20dos%20donos%20de%20${this.selectedModel['brand'].name}%20${this.selectedModel['name']}`;
        break;
      case 'email':
        linkMedia = `mailto:?subject=Alguém%20compartilhou%20as%20opiniões%20reais%20dos%20donos%20de%20${this.selectedModel['brand'].name}%20${this.selectedModel['name']}%20com%20você&body=Veja%20o%20que%20os%20donos%20de%20${this.selectedModel['brand'].name}%20${this.selectedModel['name']}%20estão%20falando%20dele%3A%20${treatedLink}`;
        break;
    }

    window.open(linkMedia, '_blank');
  }

  public reactButton(type: string): void {
    const likesQtd = this.selectedModel['likes_length'] || 0;
    const dislikesQtd = this.selectedModel['dislikes_length'] || 0;
    const data = {};

    switch (type) {
      case 'like':
        this.like = !this.like;
        this.dislike = false;
        data['likes_length'] = likesQtd + 1;
        data['dislikes_length'] = dislikesQtd;
        break;
      case 'dislike':
        this.dislike = !this.dislike;
        this.like = false;
        data['likes_length'] = likesQtd;
        data['dislikes_length'] = dislikesQtd + 1;
        break;
    }

    const recovered = this.recoveryReactions();
    const modelId = this.selectedModel['_id'];
    recovered.push({modelId, reaction: type});
    const jwtData = this.cryptoService.encondeJwt(recovered);
    this.utils.localStorageSetItem('reactions', jwtData);

    const jwtApiData = { data: this.cryptoService.encondeJwt(data)};
    const subModels = this.dbService.createItem(environment.modelsAction, jwtApiData, modelId).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.selectedModel['likes_length'] = res['saved']['likes_length'];
        this.selectedModel['dislikes_length'] = res['saved']['dislikes_length'];
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public recoveryReactions(): any[] {
    const jwtData = this.utils.localStorageGetItem('reactions');
    const decoded = this.cryptoService.decodeJwt(jwtData) || [];
    return decoded;
  }

  public checkReactions(): void {
    const recovered = this.recoveryReactions().find(item => item.modelId === this.selectedModel['_id']);
    if (recovered) {
      this[recovered.reaction] = true;
    }
  }
}
