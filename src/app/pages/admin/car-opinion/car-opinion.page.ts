/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { FormControl } from '@angular/forms';
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-car-opinion',
  templateUrl: './car-opinion.page.html',
  styleUrls: ['./car-opinion.page.scss'],
})
export class CarOpinionPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public opinions: Array<any>;
  public showLoader: boolean;
  public formOpinions: FormGroup;
  public activeChecked = true;
  public models: Array<any>;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController,
    public utils: UtilsService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.getOpinions();
    this.getModels();
  }

  public initForm() {
    this.formOpinions = this.fb.group({
      editOpinionId: this.fb.control(''),
      newOpinionModel: this.fb.control('', [Validators.required]),
      newOpinionCarTitle: this.fb.control('', [Validators.required]),
      newOpinionYearModel: this.fb.control('', [Validators.required]),
      newOpinionYearBought: this.fb.control('', [Validators.required]),
      newOpinionCarPositive: this.fb.control('', [Validators.required]),
      newOpinionCarNegative: this.fb.control('', [Validators.required])
    });
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

  public getOpinions(): void {
    this.showLoader = true;
    const subOpinions = this.dbService.getItens(environment.opinionModelAction).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
        this.opinions = res.opinions;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createOpinion(action: string) {
    this.showLoader = true;
    const opinionId = this.formOpinions.value.editOpinionId;
    const model = this.models.find(mo => mo['_id'] === this.formOpinions.value.newOpinionModel);

    const data = {
      aboutCar: {
        carBrand: {
          _id: model['brand']['_id'],
          name: model['brand']['name'],
          url: model['brand']['url'],
          active: model['brand']['active'],
          review: model['brand']['review']
        },
        carModel: {
          _id: model['_id'],
          name: model['name'],
          url: model['url'],
          active: model['active'],
          review: model['review']
        },
        finalWords: {
          title: this.formOpinions.value.newOpinionCarTitle,
          positive: this.formOpinions.value.newOpinionCarPositive,
          negative: this.formOpinions.value.newOpinionCarNegative,
        },
        yearModel: this.formOpinions.value.newOpinionYearModel,
        yearBought: this.formOpinions.value.newOpinionYearBought
      },
      active: this.activeChecked
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};
    const subOpinions = this.dbService.createItem(environment.opinionModelAction, jwtData, opinionId).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
        this.formOpinions.reset();
        this.opinions = res.opinions;
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
        this.ngOnInit();
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editOpinion(opinion) {
    this.formOpinions.reset({
      editOpinionId: opinion['_id'],
      newOpinionModel: opinion.model['_id'],
      newOpinionCarTitle: opinion.car_title,
      newOpinionCarPositive: opinion.car_positive,
      newOpinionCarNegative: opinion.car_negative,
      newOpinionYearModel: opinion.year_model,
      newOpinionYearBought: opinion.year_bought
    });

    this.activeChecked = opinion.active;

    this.content.scrollToTop(700);
  }

  public deleteOpinion(opinionId: string, action: string) {
    this.showLoader = true;
    const subOpinions = this.dbService.deleteItem(environment.opinionModelAction, opinionId).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
        this.opinions = res.opinions;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, opinion: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${opinion.newOpinionCarTitle || opinion.car_title || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteOpinion(opinion['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createOpinion('Item criado');
          break;
        case 'editar':
          this.createOpinion('Item editado');
          break;
        case 'limpar':
          this.formOpinions.reset();
          this.activeChecked = true;
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formOpinions.reset();
          this.activeChecked = true;
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
    this.toastController.create({
      header: `${action} com sucesso!`,
      message: item ? `Carro: ${item.car_negative}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
