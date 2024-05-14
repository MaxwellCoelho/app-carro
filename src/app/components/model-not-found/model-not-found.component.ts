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
  @Input() brandList: object[];

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
    const brandName = this.utils.sanitizeText(this.formModelNotFound.value.opinarBrand);
    const typedAnother = this.selectedBrand && (this.utils.sanitizeText(this.selectedBrand['name']) !== brandName);
    const alreadyExists = this.brandList.find(brand => this.utils.sanitizeText(brand['name']) === brandName);

    if ((!this.selectedBrand || typedAnother) && !alreadyExists) {
      const data = {
        name: this.formModelNotFound.value.opinarBrand,
        url: brandName,
        active: true,
        review: true
      };

      const jwtData = { data: this.cryptoService.encondeJwt(data)};

      const subBrands = this.dbService.createItem(environment.brandsAction, jwtData).subscribe(
        res => {
          if (!subBrands.closed) { subBrands.unsubscribe(); }
          this.utils.saveCreatedItem(res.saved, 'createdBrand');
          this.createModel(res.saved);
        },
        err => {
          this.showErrorToast(err);
        }
      );
    } else {
      if (alreadyExists) {
        this.selectedBrand = alreadyExists;
      }
      this.createModel(this.selectedBrand);
    }
  }

  public createModel(brand: any): void {
    const modelName = this.utils.sanitizeText(this.formModelNotFound.value.opinarModel);
    const data = {
      name: this.formModelNotFound.value.opinarModel,
      category: null,
      brand: {
        _id: brand['_id'],
        name: brand['name'],
        url: brand['url'],
        active: brand['active'],
        review: brand['review']
      },
      url: modelName,
      active: true,
      review: true
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subModels = this.dbService.createItem(environment.modelsAction, jwtData).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.utils.saveCreatedItem(res.saved, 'createdModel');
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
