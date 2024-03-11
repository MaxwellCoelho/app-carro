/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { environment } from 'src/environments/environment';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-model-not-found',
  templateUrl: './model-not-found.component.html',
  styleUrls: ['./model-not-found.component.scss'],
})
export class ModelNotFoundComponent implements OnInit {

  @Input() selectedBrand: object;

  public formModelNotFound: FormGroup;
  public showLoader = false;

  constructor(
    public fb: FormBuilder,
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public toastController: ToastController,
    public utils: UtilsService,
    public router: Router,
  ) { }

  ngOnInit() {
    console.log(this.selectedBrand);
    this.initForm();
  }

  public initForm() {
    this.formModelNotFound = this.fb.group({
      opinarBrand: this.fb.control('', [Validators.required]),
      opinarModel: this.fb.control('', [Validators.required]),
    });

    if (this.selectedBrand) {
      this.formModelNotFound.controls.opinarBrand.patchValue(this.selectedBrand['name']);
    }
  }

  public sendFormModelNotFound(): void {
    this.showLoader = true;
    let brandId;
    const brandName = this.utils.sanitizeText(this.formModelNotFound.value.opinarBrand);
    const data = {
      name: this.formModelNotFound.value.opinarBrand,
      image: `${brandName}.svg`,
      url: brandName,
      active: true,
      review: true
    };

    if (this.selectedBrand && this.selectedBrand['name'] === data.name) {
      brandId = this.selectedBrand['_id'];
    }

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subBrands = this.dbService.createItem(environment.brandsAction, jwtData, brandId).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.createModel(res.saved);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createModel(brand: any): void {
    const modelName = this.utils.sanitizeText(this.formModelNotFound.value.opinarModel);
    const data = {
      name: this.formModelNotFound.value.opinarModel,
      category: null,
      brand: brand['_id'],
      image: `${modelName}.png`,
      thumb: `${modelName}-thumb.png`,
      url: modelName,
      active: true,
      review: true
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subModels = this.dbService.createItem(environment.modelsAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.router.navigate([`/opinar/${brand['url']}/${res.saved['url']}`]);
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
