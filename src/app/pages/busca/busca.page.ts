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
  public brands: Array<any>;
  public filteredBrands: Array<any>;
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
        this.brands = res.brands;
        this.filteredBrands = res.brands;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public clickItem(brand) {
    console.log(brand);
  }

  public searchInput($event) {
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
