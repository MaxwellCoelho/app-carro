import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AdminPage } from './admin.page';
import { CarOpinionPage } from './car-opinion/car-opinion.page';
import { BrandOpinionPage } from './brand-opinion/brand-opinion.page';
import { PermissionPage } from './permission/permission.page';
import { CustomerPage } from './customer/customer.page';
import { CarCategoryPage } from './car-category/car-category.page';
import { CarBrandPage } from './car-brand/car-brand.page';
import { CarModelPage } from './car-model/car-model.page';
import { CarVersionPage } from './car-version/car-version.page';
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
    CarOpinionPage,
    BrandOpinionPage,
    PermissionPage,
    CustomerPage,
    CarCategoryPage,
    CarBrandPage,
    CarModelPage,
    CarVersionPage
  ]
})
export class AdminPageModule {}
