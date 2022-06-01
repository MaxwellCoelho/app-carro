import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AdminPage } from './admin.page';
import { PermissionPage } from './permission/permission.page';
import { CustomerPage } from './customer/customer.page';
import { CarCategoryPage } from './car-category/car-category.page';
import { CarBrandPage } from './car-brand/car-brand.page';
import { CarModelPage } from './car-model/car-model.page';
import { LoaderComponent } from '../../components/loader/loader.component';

import { AdminPageRoutingModule } from './admin-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminPageRoutingModule
  ],
  providers: [
    FormBuilder
  ],
  declarations: [
    AdminPage,
    PermissionPage,
    CustomerPage,
    CarCategoryPage,
    CarBrandPage,
    CarModelPage,
    LoaderComponent
  ]
})
export class AdminPageModule {}
