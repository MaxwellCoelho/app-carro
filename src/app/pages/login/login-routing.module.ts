import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login.page';
import { NotLoggedGuard } from 'src/app/guard/not-logged.guard';

const routes: Routes = [
  {
    path: '',
    component: LoginPage,
    canActivate: [NotLoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginPageRoutingModule {}
