/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-banner-home',
  templateUrl: './banner-home.component.html',
  styleUrls: ['./banner-home.component.scss'],
})
export class BannerHomeComponent implements OnInit {

  public brands: Array<any>;
  public models: Array<any>;
  public selectedBrand: string;
  public selectedModel: string;

  constructor(
    public router: Router,
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public utils: UtilsService,
  ) { }

  ngOnInit() {
    this.getBrands();
  }

  goToOpinar() {
    if (this.selectedBrand === 'anotherBrand') {
      const params: NavigationExtras = { queryParams: { search: 'outro' }, queryParamsHandling: 'merge' };
      this.router.navigate([NAVIGATION.search.route], params);
    } else if (this.selectedModel === 'anotherModel') {
      const params: NavigationExtras = { queryParams: { brand: this.selectedBrand, search: 'outro' }, queryParamsHandling: 'merge' };
      this.router.navigate([NAVIGATION.search.route], params);
    } else if (this.selectedBrand && this.selectedModel) {
      const opinarUrl = `opinar/${this.selectedBrand}/${this.selectedModel}`;
      this.router.navigate([opinarUrl]);
    }

    this.selectedModel = null;
    this.selectedBrand = null;
  }

  public getBrands(): void {
    const recoveredReviewBrands = this.utils.recoveryCreatedItem('createdBrand');
    const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = [];
        for (const brand of res.brands) {
          if (brand.active) {
            if (!brand.review || (brand.review && recoveredReviewBrands.find(item => item['_id'] === brand['_id']))) {
              this.brands.push(brand);
            }
          }
        }
      },
      err => {}
    );
  }

  public getModels(): void {
    const recoveredReviewModel = this.utils.recoveryCreatedItem('createdModel');
    const myFilter = { ['brand.url']: this.selectedBrand };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.models = [];
        for (const model of res.models) {
          if (model.active) {
            if (!model.review || (model.review && recoveredReviewModel.find(item => item['_id'] === model['_id']))) {
              this.models.push(model);
            }
          }
        }
      },
      err => {}
    );
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

}
