/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';
import { FUEL, GEARBOX } from 'src/app/helpers/forms.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-car-version',
  templateUrl: './car-version.page.html',
  styleUrls: ['./car-version.page.scss'],
})
export class CarVersionPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public fuels = FUEL;
  public gearboxes = GEARBOX;
  public versions: Array<any>;
  public models: Array<any>;
  public showLoader: boolean;
  public formVersions: FormGroup;
  public activeChecked = true;
  public pendingReview = false;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController,
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getVersions();
    this.getModels();
  }

  public initForm() {
    this.formVersions = this.fb.group({
      editVersionId: this.fb.control(''),
      newVersionModel: this.fb.control('', [Validators.required]),
      newVersionImage: this.fb.control(''),
      newVersionThumb: this.fb.control(''),
      newVersionFuel: this.fb.control('', [Validators.required]),
      newVersionYearModel: this.fb.control('', [Validators.required]),
      newVersionEngine: this.fb.control('', [Validators.required]),
      newVersionGearbox: this.fb.control('', [Validators.required]),
      newVersionComplement: this.fb.control('', []),
    });
  }

  public getVersions(): void {
    this.showLoader = true;
    const subVersions = this.dbService.getItens(environment.versionsAction).subscribe(
      res => {
        if (!subVersions.closed) { subVersions.unsubscribe(); }
        this.versions = res.versions.sort((a, b) => (!a['review']) || -1);
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public getModels(): void {
    this.showLoader = true;
    const subModels = this.dbService.getItens(environment.modelsAction).subscribe(
      res => {
        if (!subModels.closed) { subModels.unsubscribe(); }
        this.models = res.models.sort((a, b) => (a['brand']['name'] > b['brand']['name']) || -1);
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createVersion(action: string) {
    this.showLoader = true;
    const versionId = this.formVersions.value.editVersionId;
    const years = this.formVersions.value.newVersionYearModel;
    const formattedYears = Array.isArray(years) ? years : years.split(',');
    const finalYears = [];
    formattedYears.forEach(y =>  finalYears.push(parseInt(y, 10)));
    const model = this.models.find(mo => mo['_id'] === this.formVersions.value.newVersionModel);

    const data = {
      model: {
        _id: model['_id'],
        name: model['name'],
        url: model['url'],
        brand: model['brand'],
        active: model['active'],
        review: model['review']
      },
      image: this.formVersions.value.newVersionImage,
      thumb: this.formVersions.value.newVersionThumb,
      fuel: this.formVersions.value.newVersionFuel,
      years: finalYears,
      engine: this.formVersions.value.newVersionEngine,
      gearbox: this.formVersions.value.newVersionGearbox,
      complement: this.formVersions.value.newVersionComplement,
      active: this.activeChecked,
      review: this.pendingReview
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subVersions = this.dbService.createItem(environment.versionsAction, jwtData, versionId).subscribe(
      res => {
        if (!subVersions.closed) { subVersions.unsubscribe(); }
        this.formVersions.reset();
        this.versions = res.versions;
        this.utils.setShouldUpdate(['versions'], true);
        this.showLoader = false;
        this.activeChecked = true;
        this.pendingReview = false;
        this.showToast(action, res.saved);
        this.ngOnInit();
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editVersion(version) {
    this.formVersions.reset({
      editVersionId: version['_id'],
      newVersionModel: version.model['_id'],
      newVersionImage: version.image,
      newVersionThumb: version.thumb,
      newVersionFuel: version.fuel,
      newVersionYearModel: version.years,
      newVersionEngine: version.engine.toFixed(1),
      newVersionGearbox: version.gearbox,
      newVersionComplement: version.complement,
    });

    this.activeChecked = version.active;
    this.pendingReview = version.review;

    this.content.scrollToTop(700);
  }

  public deleteVersion(versionId: string, action: string) {
    this.showLoader = true;
    const subVersions = this.dbService.deleteItem(environment.versionsAction, versionId).subscribe(
      res => {
        if (!subVersions.closed) { subVersions.unsubscribe(); }
        this.versions = res.versions;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, version: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${version.editVersionId || version.newVersionModel || version['_id'] || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteVersion(version['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createVersion('Item criado');
          break;
        case 'editar':
          this.createVersion('Item editado');
          break;
        case 'limpar':
          this.formVersions.reset();
          this.activeChecked = true;
          this.pendingReview = false;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formVersions.reset();
          this.activeChecked = true;
          this.pendingReview = false;
          this.showToast('Edição descartada');
          break;
      }
    };

    const alertObj = {
      header: 'Atenção!',
      message: alertMessage,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          id: 'cancel-button'
        }, {
          text: 'Confirmar',
          id: 'confirm-button',
          handler: confirmHandler
        }
      ]
    };

    this.alertController.create(alertObj).then(alert => {
      alert.present();
    });
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

  public showToast(action: string, item?: any) {
    const myItem = `${item.model.brand.name} ${item.model.name} ${item.engine.toFixed(1)} ${item.complement || ''} ${item.gearbox  || ''} ${item.fuel}`;
    this.toastController.create({
      header: `${action} com sucesso!`,
      message: item ? `Nome: ${myItem}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
