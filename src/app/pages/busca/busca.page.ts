/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-busca',
  templateUrl: 'busca.page.html',
  styleUrls: ['busca.page.scss'],
})
export class BuscaPage implements OnInit {

  public nav = NAVIGATION;
  public brands = [];
  public filteredBrands = [];
  public selectedBrand: object;
  public models = [];
  public filteredModels = [];
  public selectedModel: object;
  public showLoader: boolean;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController
  ) {}

  ngOnInit() {
    this.getBrands();
  }

  public getBrands(): void {
    this.showLoader = true;
    const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = [];
        for (const brand of res.brands) {
          if (brand.active) {
            this.brands.push(brand);
          }
        }

        this.filteredBrands = this.brands;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public selectBrand(brand) {
    this.selectedBrand = brand;
    this.getModel();
  }

  public clearBrand() {
    this.filteredBrands = this.brands;
    this.selectedBrand = null;
  }

  public searchBrandInput($event) {
    const query = $event.target.value.toLowerCase();
    this.filteredBrands = [];

    requestAnimationFrame(() => {
      this.brands.forEach((item) => {
        if (item.name.toLowerCase().indexOf(query) > -1) {
          this.filteredBrands.push(item);
        }
      });
    });
  }

  public getModel(): void {
    this.showLoader = true;

    const myFilter = { brand: this.selectedBrand['_id'] };
    const subModels = this.dbService.filterItem(environment.filterModelsAction, myFilter).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.models = [];
        for (const model of res.models) {
          if (model.active) {
            this.models.push(model);
          }
        }

        this.filteredModels = this.models;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public selectModel(model) {
    this.selectedModel = model;
    console.log(this.selectedModel);
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

  public showErrorToast(err) {
    const genericError = 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
    const notFoundError = 'Infelizmente o que você procura foi excluído ou não existe mais.';
    const nonAuthorizedError = 'Você não está autorizado a fazer esse tipo de ação!';
    let response;

    switch (err.status) {
      case 404:
        response = notFoundError;
        break;
      case 401:
        response = nonAuthorizedError;
        break;
      default:
        response = genericError;
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
