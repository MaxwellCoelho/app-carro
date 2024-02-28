import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AdminPage } from './admin.page';
import { OpinionPage } from './opinion/opinion.page';
import { PermissionPage } from './permission/permission.page';
import { CustomerPage } from './customer/customer.page';
import { CarCategoryPage } from './car-category/car-category.page';
import { CarBrandPage } from './car-brand/car-brand.page';
import { CarModelPage } from './car-model/car-model.page';
import { SharedModule } from '../../shared/shared.module';
import { AdminPageRoutingModule } from './admin-routing.module';


@NgModule({
  imports: [
    SharedModule,
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
    OpinionPage,
    PermissionPage,
    CustomerPage,
    CarCategoryPage,
    CarBrandPage,
    CarModelPage
  ]
})
export class AdminPageModule {}
