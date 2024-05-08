/* eslint-disable @typescript-eslint/dot-notation */
import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements ViewWillEnter {

  public nav = NAVIGATION;
  public roles: Array<any>;
  public users: Array<any>;

  public formRoles: FormGroup;

  constructor(
    public fb: FormBuilder,
    public utils: UtilsService,
  ) { }

  public ionViewWillEnter(): void {
    this.utils.setPageTitle('Admin');
  }

  public accordionChange($event): void {
    const value = $event && $event.detail && $event.detail.value;

    switch (value) {
      case 'users':
        this.getUsers();
        break;
      case 'cars':
        this.getCars();
        break;
    }
  }

  public getUsers(): void {
    console.log('users');
  }

  public getCars(): void {
    console.log('cars');
  }

}
