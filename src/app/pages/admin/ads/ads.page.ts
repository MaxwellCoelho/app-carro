/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ads',
  templateUrl: './ads.page.html',
  styleUrls: ['./ads.page.scss'],
})
export class AdsPage implements OnInit {

  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public showLoader: boolean;
  public ads: Array<any> = [];
  public formAds: FormGroup;
  public page = 1;
  public pagination = 5;
  public excludedItem = false;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public utils: UtilsService,
    public alertController: AlertController,
    public toastController: ToastController,
    public fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm();
    this.getAds();
  }

  public initForm() {
    this.formAds = this.fb.group({
      editAdId: this.fb.control(''),
      newAdUrl: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newAdTitle: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newAdDescription: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newAdImages: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      newAdKeywords: this.fb.control('', []),
    });
  }

  public getAds(): void {
    this.showLoader = true;
    const myFilter = {};
    const page = this.page.toString();
    const pagination = this.pagination.toString();
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subAds = this.dbService.filterItem(environment.filterAdsAction, jwtData, page, pagination).subscribe(
      res => {
        if (!subAds.closed) { subAds.unsubscribe(); }
        this.ads = [...this.ads, ...res.ads];
        this.showLoader = false;
        this.page++;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public createAd(action: string) {
    this.showLoader = true;
    const adId = this.formAds.value.editAdId;
    const data = {
      url: this.formAds.value.newAdUrl,
      title: this.formAds.value.newAdTitle,
      description: this.formAds.value.newAdDescription,
      images: this.formAds.value.newAdImages ? this.formAds.value.newAdImages.split(',') : [],
      keywords: this.formAds.value.newAdKeywords ? this.formAds.value.newAdKeywords.split(',') : []
    };

    const jwtData = { data: this.cryptoService.encondeJwt(data)};

    const subAds = this.dbService.createItem(environment.adsAction, jwtData, adId).subscribe(
      res => {
        if (!subAds.closed) { subAds.unsubscribe(); }
        this.formAds.reset();
        this.updateItem(res.saved, 'update');
        this.showLoader = false;
        this.showToast(action, res.saved);
        this.ngOnInit();
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public updateItem(item: any, type: 'update' | 'delete'): void {
    const adsCopy = [...this.ads];
    let foundItem = false;
    this.ads = [];

    for (let i = 0; i < adsCopy.length; i++) {
      if (item['_id'] === adsCopy[i]['_id']) {
        foundItem = true;

        if (type === 'delete') {
          adsCopy.splice(i, 1);
        } else {
          adsCopy[i]['url'] = item['url'];
          adsCopy[i]['title'] = item['title'];
          adsCopy[i]['description'] = item['description'];
          adsCopy[i]['images'] = item['images'];
          adsCopy[i]['keywords'] = item['keywords'];
          adsCopy[i]['modified'] = item['modified'];
          adsCopy[i]['modified_by'] = item['modified_by'];
        }
      }
    }

    if (type === 'update' && !foundItem) {
      adsCopy.unshift(item);
    }

    setTimeout(() => {
      this.ads = adsCopy;
    }, 50);
  }

  public editAd(ad) {
    this.formAds.reset({
      editAdId: ad['_id'],
      newAdUrl: ad.url,
      newAdTitle: ad.title,
      newAdDescription: ad.description,
      newAdImages: ad.images.toString(),
      newAdKeywords: ad.keywords.toString(),
    });

    this.content.scrollToTop(700);
  }

  public deleteAd(adId: string, action: string) {
    this.showLoader = true;
    const subAds = this.dbService.deleteItem(environment.adsAction, adId).subscribe(
      res => {
        if (!subAds.closed) { subAds.unsubscribe(); }
        this.updateItem(res.removed, 'delete');
        this.showLoader = false;
        this.excludedItem = true;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, ad: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${ad._id || ''}</strong>?`;

    const confirmHandler = () => {
      switch (action) {
        case 'excluir':
          this.deleteAd(ad['_id'], 'Item excluído');
          break;
        case 'criar':
          this.createAd('Item criado');
          break;
        case 'editar':
          this.createAd('Item editado');
          break;
        case 'limpar':
          this.formAds.reset();
          this.showToast('Formulário limpo');
          break;
        case 'descartar':
          this.formAds.reset();
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
      message: item ? `Id: ${item._id}` : '',
      duration: 4000,
      position: 'middle',
      icon: 'checkmark-outline',
      color: 'success'
    }).then(toast => {
      toast.present();
    });
  }
}
