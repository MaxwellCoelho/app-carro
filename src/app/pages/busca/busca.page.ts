/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

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
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public searchService: SearchService,
    public router: Router,
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
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
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
    const pageUrl = `/${page}/${brand.toLowerCase()}/${model.toLowerCase()}`;

    this.saveSelectedModel(model);
    this.clearBrand();
    this.router.navigate([pageUrl]);
  }

  public saveSelectedModel(modelName: string): void{
    const selectedModel = this.filteredModels.find(mod => mod.name.toLowerCase() === modelName.toLowerCase());
    this.searchService.saveModel(selectedModel);
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
