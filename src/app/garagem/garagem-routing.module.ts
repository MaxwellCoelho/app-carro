import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GaragemPage } from './garagem.page';

const routes: Routes = [
  {
    path: '',
    component: GaragemPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GaragemPageRoutingModule {}
