/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {

  @ViewChild('IonContent') content;

  public nav = NAVIGATION;
  public showLoader: boolean;
  public feedbacks: Array<any>;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public utils: UtilsService,
    public alertController: AlertController,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    this.getFeedbacks();
  }

  public getFeedbacks(): void {
    this.showLoader = true;
    const subFeedbacks = this.dbService.getItens(environment.feedbackAction).subscribe(
      res => {
        if (!subFeedbacks.closed) { subFeedbacks.unsubscribe(); }
        this.feedbacks = res.feedbacks;
        this.showLoader = false;
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public deleteFeedback(feedId: string, action: string) {
    this.showLoader = true;
    const subFeedbacks = this.dbService.deleteItem(environment.feedbackAction, feedId).subscribe(
      res => {
        if (!subFeedbacks.closed) { subFeedbacks.unsubscribe(); }
        this.feedbacks = res.feedbacks;
        this.showLoader = false;
        this.showToast(action, res.removed);
      },
      err => {
        this.showErrorToast(err);
      }
    );
  }

  public showConfirmAlert(action: string, feed: any) {
    const compl = action === 'descartar' ? 'a edição do' : '';
    const alertMessage = `Deseja realmente ${action} ${compl} o item <strong>${feed._id || ''}</strong>?`;

    const confirmHandler = () => {
      if (action) {
        this.deleteFeedback(feed['_id'], 'Item excluído');
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
