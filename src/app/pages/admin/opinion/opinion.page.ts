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

@Component({
  selector: 'app-opinion',
  templateUrl: './opinion.page.html',
  styleUrls: ['./opinion.page.scss'],
})
export class OpinionPage implements OnInit {
  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public opinions: Array<any>;
  public showLoader: boolean;
  public formOpinions: FormGroup;
  public activeChecked = true;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initForm();
    this.getOpinions();
  }

  public initForm() {
    this.formOpinions = this.fb.group({
      editOpinionId: this.fb.control(''),
      newOpinionBrandTitle: this.fb.control('', [Validators.required]),
      newOpinionBrandPositive: this.fb.control('', [Validators.required]),
      newOpinionBrandNegative: this.fb.control('', [Validators.required]),
      newOpinionCarTitle: this.fb.control('', [Validators.required]),
      newOpinionCarPositive: this.fb.control('', [Validators.required]),
      newOpinionCarNegative: this.fb.control('', [Validators.required])
    });
  }

  public getOpinions(): void {
    this.showLoader = true;
    const subOpinions = this.dbService.getItens(environment.opinionAction).subscribe(
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
    const data = {
      aboutBrand: {
        finalWords: {
          title: this.formOpinions.value.newOpinionBrandTitle,
          positive: this.formOpinions.value.newOpinionBrandPositive,
          negative: this.formOpinions.value.newOpinionBrandNegative,
        }
      },
      aboutCar: {
        finalWords: {
          title: this.formOpinions.value.newOpinionCarTitle,
          positive: this.formOpinions.value.newOpinionCarPositive,
          negative: this.formOpinions.value.newOpinionCarNegative,
        }
      },
      active: this.activeChecked
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subOpinions = this.dbService.createItem(environment.opinionAction, jwtData, opinionId).subscribe(
      res => {
        if (!subOpinions.closed) { subOpinions.unsubscribe(); }
        this.formOpinions.reset();
        this.opinions = res.opinions;
        this.showLoader = false;
        this.activeChecked = true;
        this.showToast(action, res.saved);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public editOpinion(opinion) {
    this.formOpinions.reset({
      editOpinionId: opinion['_id'],
      newOpinionBrandTitle: opinion.brand_title,
      newOpinionBrandPositive: opinion.brand_positive,
      newOpinionBrandNegative: opinion.brand_negative,
      newOpinionCarTitle: opinion.car_title,
      newOpinionCarPositive: opinion.car_positive,
      newOpinionCarNegative: opinion.car_negative
    });

    this.activeChecked = opinion.active;

    this.content.scrollToTop(700);
  }

  public deleteOpinion(opinionId: string, action: string) {
    this.showLoader = true;
    const subOpinions = this.dbService.deleteItem(environment.opinionAction, opinionId).subscribe(
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
      message: item ? `Marca: ${item.brand_title}, Carro: ${item.car_negative}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
