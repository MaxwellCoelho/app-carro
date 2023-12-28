import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { GENERIC, NOT_FOUND, UNAUTHORIZED } from 'src/app/helpers/error.helper';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-melhores',
  templateUrl: 'melhores.page.html',
  styleUrls: ['melhores.page.scss'],
})
export class MelhoresPage implements OnInit {

  public nav = NAVIGATION;
  public bestModels: Array<any>;
  public showLoader: boolean;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController
  ) {}

  ngOnInit() {
    this.getBestModels();
  }

  public getBestModels(): void {
    this.showLoader = true;

    const subBrands = this.dbService.getItens(environment.bestModelsAction).subscribe(
      res => {
        if (!subBrands.closed) { subBrands.unsubscribe(); }
        this.bestModels = res.bestModels;
        console.log(this.bestModels);
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
