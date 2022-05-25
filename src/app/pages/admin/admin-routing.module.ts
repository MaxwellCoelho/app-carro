import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPage } from './admin.page';
import { PermissionPage } from './permission/permission.page';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

const routes: Routes = [
  {
    path: NAVIGATION.permission.route,
    component: PermissionPage
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
