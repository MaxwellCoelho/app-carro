import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermoDeUsoPage } from './termo-de-uso.page';

const routes: Routes = [
  {
    path: '',
    component: TermoDeUsoPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermoDeUsoPageRoutingModule {}
