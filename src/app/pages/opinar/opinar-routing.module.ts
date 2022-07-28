import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpinarPage } from './opinar.page';

const routes: Routes = [
  {
    path: '',
    component: OpinarPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpinarPageRoutingModule {}
