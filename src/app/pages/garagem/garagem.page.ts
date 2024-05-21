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

@Component({
  selector: 'app-garagem',
  templateUrl: 'garagem.page.html',
  styleUrls: ['garagem.page.scss'],
})
export class GaragemPage implements OnInit, ViewWillEnter {

  public nav = NAVIGATION;
  public showLoader: boolean;
  public myModelOpinions = [];

  constructor(
    public utils: UtilsService,
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
  ) {}

  public ngOnInit(): void {
    if (!this.utils.getShouldUpdate('opinions')) {
      this.getModelOpinions();
    }
  }

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Minha garagem');
    if (this.utils.getShouldUpdate('opinions')) {
      this.utils.setShouldUpdate(['opinions'], false);
      this.myModelOpinions = [];
      this.getModelOpinions();
    }
  }

  public getModelOpinions(): void {
    this.showLoader = true;
    const myFilter = { ['created_by._id']: this.utils.sessionUser['_id'] };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterOpinionModelAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.myModelOpinions = res.models && res.models.opinions && res.models.opinions.length ? res.models.opinions : [];
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
}
