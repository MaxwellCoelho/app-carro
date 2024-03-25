import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPage } from './admin.page';
import { OpinionPage } from './opinion/opinion.page';
import { PermissionPage } from './permission/permission.page';
import { CustomerPage } from './customer/customer.page';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CarCategoryPage } from './car-category/car-category.page';
import { CarBrandPage } from './car-brand/car-brand.page';
import { CarModelPage } from './car-model/car-model.page';
import { CarVersionPage } from './car-version/car-version.page';
import { LoggedAdminGuard } from 'src/app/guard/logged-admin.guard';

const routes: Routes = [
  {
    path: 'opinioes',
    component: OpinionPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: NAVIGATION.permission.route,
    component: PermissionPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: NAVIGATION.customer.route,
    component: CustomerPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: NAVIGATION.carcategories.route,
    component: CarCategoryPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: NAVIGATION.carbrands.route,
    component: CarBrandPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: NAVIGATION.carmodels.route,
    component: CarModelPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: NAVIGATION.carversions.route,
    component: CarVersionPage,
    canActivate: [LoggedAdminGuard]
  },
  {
    path: '',
    component: AdminPage,
    canActivate: [LoggedAdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPageRoutingModule {}
