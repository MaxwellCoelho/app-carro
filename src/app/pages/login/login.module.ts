import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LoginPage } from './login.page';
import { SharedModule } from '../../shared/shared.module';

import { LoginPageRoutingModule } from './login-routing.module';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginPageRoutingModule
  ],
  providers: [
    FormBuilder
  ],
  declarations: [
    LoginPage
  ]
})
export class LoginPageModule {}
