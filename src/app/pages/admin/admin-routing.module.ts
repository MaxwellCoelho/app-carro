import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPage } from './admin.page';
import { PermissionPage } from './permission/permission.page';
import { CustomerPage } from './customer/customer.page';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CarCategoryPage } from './car-category/car-category.page';
import { CarBrandPage } from './car-brand/car-brand.page';
import { CarModelPage } from './car-model/car-model.page';

const routes: Routes = [
  {
    path: NAVIGATION.permission.route,
    component: PermissionPage
  },
  {
    path: NAVIGATION.customer.route,
    component: CustomerPage
  },
  {
    path: NAVIGATION.carcategories.route,
    component: CarCategoryPage
  },
  {
    path: NAVIGATION.carbrands.route,
    component: CarBrandPage
  },
  {
    path: NAVIGATION.carmodels.route,
    component: CarModelPage
  },
  {
    path: '',
    component: AdminPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPageRoutingModule {}
