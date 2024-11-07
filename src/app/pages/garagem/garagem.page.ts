/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController, AlertController, ViewWillEnter } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { NavigationExtras, Router, ActivatedRoute, ParamMap } from '@angular/router';
import { VALUATION, VALUATION_ITENS_CAR, VALUATION_NOT_FOUND } from 'src/app/helpers/valuation.helper';
import { SearchService } from 'src/app/services/search/search.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';

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
  public showPasswordChange = false;
  public formPassword: FormGroup;
  public currentPasswordType = 'password';
  public newPasswordType = 'password';
  public repeatNewPasswordType = 'password';
  public userData: object;
  public loadedOpinions = false;

  constructor(
    public utils: UtilsService,
    public authService: AuthService,
    public dbService: DataBaseService,
    public toastController: ToastController,
    public alertController: AlertController,
    public cryptoService: CryptoService,
    public router: Router,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public fb: FormBuilder,
  ) {}

  public ngOnInit(): void { }

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Minha garagem', 'Opiniões reais e sincera dos donos de carros de todas as marcas e modelos.', 'minha garagem, garagem, meus carros, meu carro');
    this.myModelOpinions = [];
    this.checkUser();
  }

  public initForm() {
    this.formPassword = this.fb.group({
      currentPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(4)]),
      repeatNewPassword: this.fb.control('', [Validators.required, Validators.minLength(4)])
    });
  }

  public getUrlParams(): string {
    let userParam;

    this.route.paramMap.subscribe((params: ParamMap) => {
      userParam = params.get('usuario');
    });

    return userParam;
  }

  public checkUser(): void {
    const searchUser = this.getUrlParams();
    this.userData = null;

    if (searchUser) {
      this.getModelOpinions(searchUser);
    } else {
      this.utils.returnLoggedUser();
      if (this.utils.sessionUser) {
        this.userData = this.utils.sessionUser;
        this.getModelOpinions();
        this.getBrands();
        this.initForm();
      } else {
        this.router.navigate([`/${this.nav.login.route}`]);
      }
    }
  }

  public logoutUser() {
    this.showLoader = true;

    this.authService.logoutUser().subscribe(
      res => {
        this.utils.localStorageRemoveItem('userSession');
        this.utils.returnLoggedUser();
        this.router.navigate([`/`]);
        this.showLoader = false;
        this.showToast('success', 'logout');
      },
      err => {
        this.showLoader = false;
        this.showToast('danger', 'logout');
      }
    );
  }

  public showToast(status: string, type: string): void {
    let title;
    let msg;
    let icon;

    if (status === 'success') {
      title = 'Tudo certo!';
      icon = 'checkmark';
      msg = type === 'password'
        ? 'Sua senha foi alterada com sucesso!'
        : 'Você saiu da área logada com sucesso!';
    } else {
      title = 'Atenção!';
      icon = 'warning';
      msg = type === 'password' ? 'Ocorreu um erro! Tente novamente mais tarde.' : 'Erro durando logout! Tente novamente mais tarde.';
    }

    this.toastController.create({
      header: title,
      message: msg,
      duration: 4000,
      position: 'middle',
      icon: `${icon}-outline`,
      color: status
    }).then(toast => {
      toast.present();
    });
  }

  public showConfirmAlert() {
    const alertMessage = `Deseja realmente sair da área logada?`;

    const confirmHandler = () => {
      this.logoutUser();
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

  public clickPasswordChange(): void {
    this.showPasswordChange = true;
  }

  public closePasswordChange(): void {
    this.showPasswordChange = false;
    this.formPassword.reset();
    this.currentPasswordType = this.newPasswordType = this.repeatNewPasswordType = 'password';
  }

  public showOrHideField(field: string): void {
    this[field] = this[field] === 'password' ? 'text' : 'password';
  }

  public submitChangePassword(): void {
    this.showLoader = true;
    const userId = this.utils.sessionUser['_id'];

    const data = {
      currentPassword: this.formPassword.value.currentPassword,
      password: this.formPassword.value.repeatNewPassword
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;
        this.closePasswordChange();
        this.showToast('success', 'password');
      },
      err => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;

        if (err.status === 401) {
          this.formPassword.controls.currentPassword.setErrors({invalid: true});
        } else {
          this.closePasswordChange();
          this.showToast('danger', 'password');
        }
      }
    );
  }

  public getModelOpinions(userUrl?: string): void {
    this.showLoader = true;
    const myFilter = userUrl ? { ['created_by.url']: userUrl } : { ['created_by._id']: this.utils.sessionUser['_id'] };
    const sort = [
      {name: 'year_bought', value: 'desc'},
      {name: 'kept_period', value: 'desc'}
    ];
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterOpinionModelAction, jwtData, null, null, sort).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.myModelOpinions = res.opinions && res.opinions.length ? res.opinions : [];

        this.myModelOpinions.forEach(model => {
          model.img = this.utils.getModelImg(model.model.url, model.model.generation, model.year_model);
        });

        if (this.myModelOpinions.length && userUrl) {
          this.userData = {
            name: this.myModelOpinions[0].created_by.name
          };
        }

        this.loadedOpinions = true;
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

    this.loadedOpinions = true;
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

  public goSearch() {
    this.router.navigate([NAVIGATION.search.route]);
  }

  public isUserPage(): boolean {
    const currentUrl = location.pathname;
    const clientUrl = this.modalContent && this.modalContent['created_by'] && this.modalContent['created_by']['url'];
    const result = currentUrl.includes(NAVIGATION.garage.route) || (clientUrl && currentUrl.includes(clientUrl));
    if (this.modalContent && !result) {
      this.closeModal();
    }
    return result;
  }

  public submitNewAvatar($event) {
    this.showLoader = true;
    const userId = this.utils.sessionUser['_id'];
    const jwtData = { data: this.cryptoService.encondeJwt({avatar: $event})};
    this.userData['avatar'] = null;

    const subCustomers = this.dbService.createItem(environment.customersAction, jwtData, userId).subscribe(
      res => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;
        this.userData['avatar'] = res['saved'].avatar;
      },
      err => {
        if (!subCustomers.closed) { subCustomers.unsubscribe(); }
        this.showLoader = false;
        this.userData['avatar'] = this.utils.sessionUser['avatar'];
      }
    );
  }
}
