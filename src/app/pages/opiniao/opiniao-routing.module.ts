import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpiniaoPage } from './opiniao.page';

const routes: Routes = [
  {
    path: '',
    component: OpiniaoPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpiniaoPageRoutingModule {}
