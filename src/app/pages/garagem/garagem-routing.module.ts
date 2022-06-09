import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GaragemPage } from './garagem.page';
import { LoggedGuard } from 'src/app/guard/logged.guard';

const routes: Routes = [
  {
    path: '',
    component: GaragemPage,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GaragemPageRoutingModule {}
