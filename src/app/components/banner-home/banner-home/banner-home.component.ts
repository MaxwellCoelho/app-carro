import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
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
  ) { }

  ngOnInit() {
    this.getBrands();
  }

  goToOpinar() {
    if (!this.selectedBrand) {
      this.router.navigate([NAVIGATION.search.route]);
    } else if (!this.selectedModel) {
      const params: NavigationExtras = { queryParams: { brand: this.selectedBrand }, queryParamsHandling: 'merge' };
      this.router.navigate([NAVIGATION.search.route], params);
    } else {
      const opinarUrl = `opinar/${this.selectedBrand}/${this.selectedModel}`;
      this.router.navigate([opinarUrl]);
    }
  }

  public getBrands(): void {
    const subBrands = this.dbService.getItens(environment.brandsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.brands = res.brands;
      },
      err => {}
    );
  }

  public getModels(): void {
    const myFilter = { ['brand.url']: this.selectedBrand };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subModels = this.dbService.filterItem(environment.filterModelsAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.models = res.models;
      },
      err => {}
    );
  }

  public chooseBrand($event) {
    this.selectedBrand = $event.detail.value;
    this.selectedModel = null;
    this.getModels();
  }

  public chooseModel($event) {
    this.selectedModel = $event.detail.value;
  }

}
