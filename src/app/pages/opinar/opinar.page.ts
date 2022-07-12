/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-opinar',
  templateUrl: 'opinar.page.html',
  styleUrls: ['opinar.page.scss'],
})
export class OpinarPage implements OnInit {

  public nav = NAVIGATION;
  public selectedModel: object;
  public showLoader: boolean;
  public valuation = [
    { name: 'Péssimo', value:'pessimo' },
    { name: 'Ruim', value:'ruim' },
    { name: 'Regular', value:'regular' },
    { name: 'Bom', value:'bom' },
    { name: 'Ótimo', value:'otimo' }
  ];
  public valuationItens = [
    { title: 'Interior', subtitle: 'Beleza, acabamento e espaço', value:'interior', valuation: null },
    { title: 'Exterior', subtitle: 'Beleza e acabamento', value:'exterior', valuation: null },
    { title: 'Conforto', subtitle: 'Dirigibilidade e desempenho', value:'conforto', valuation: null },
    { title: 'Segurança', subtitle: 'Itens de série e estabilidade', value:'seguranca', valuation: null },
    { title: 'Consumo', subtitle: 'Autonomia e manutenção', value:'consumo', valuation: null },
    { title: 'Custo-benefício', subtitle: 'Recomendaria?', value:'custo-beneficio', valuation: null }
  ];

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadModelInfo();
  }

  public loadModelInfo(): void {
    this.selectedModel = this.searchService.getModel();

    if (this.selectedModel) {
      this.searchService.clearModel();
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

        if (foundModel) {
          this.selectedModel = foundModel;
          this.showLoader = false;
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

  public segmentChanged($event) {
    this.valuationItens.find(item => {
        if (item.value === $event.target.id) {
          item.valuation = $event.target.value;
        }
      }
    );
    console.log($event.target.id, $event.target.value);
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
      this.router.navigate([NAVIGATION.search.route]);
    });
  }

}
