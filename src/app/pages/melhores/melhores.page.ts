import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { VALUATION, VALUATION_NOT_FOUND } from 'src/app/helpers/valuation.helper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-melhores',
  templateUrl: 'melhores.page.html',
  styleUrls: ['melhores.page.scss'],
})
export class MelhoresPage implements OnInit {

  public nav = NAVIGATION;
  public bestModels: Array<any> = [];
  public showLoader: boolean;
  public page = 1;
  public pagination = 20;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public router: Router,
  ) {}

  ngOnInit() {
    this.getBestModels();
  }

  public getBestModels(): void {
    if (this.page === 1) { this.showLoader = true; }

    const subBrands = this.dbService.getItens(environment.bestModelsAction, this.page.toString(), this.pagination.toString()).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        const modelWithAverage = this.setModelAverages(res.bestModels);
        this.bestModels = [...this.bestModels, ...modelWithAverage];
        if (this.page === 1) { this.showLoader = false; }
        this.page++;
      },
      err => {
        this.showErrorToast(err);
      }
    );

  }

  public setModelAverages(models: any): any {
    const modelWithAverage = models;

    modelWithAverage.forEach(model => {
      const average = model.average;
      const int = average ? parseInt(average, 10) : 0;
      const valuation = VALUATION.slice();
      const foundVal = valuation.find(val => int === val.value) || VALUATION_NOT_FOUND;
      model.average = foundVal;
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
      this.getBestModels();
    }

    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }
}
