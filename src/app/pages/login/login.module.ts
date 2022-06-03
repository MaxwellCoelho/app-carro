import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LoginPage } from './login.page';
import { LoaderComponent } from '../../components/loader/loader.component';

import { LoginPageRoutingModule } from './login-routing.module';


@NgModule({
  imports: [
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
    LoginPage,
    LoaderComponent
  ]
})
export class LoginPageModule {}
