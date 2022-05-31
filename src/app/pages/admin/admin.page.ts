/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  public nav = NAVIGATION;
  public roles: Array<any>;
  public users: Array<any>;

  public formRoles: FormGroup;

  constructor(
    public fb: FormBuilder,
  ) { }

  ngOnInit() {

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
