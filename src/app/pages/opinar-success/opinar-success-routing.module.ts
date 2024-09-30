import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpinarSuccessPage } from './opinar-success.page';

const routes: Routes = [
  {
    path: '',
    component: OpinarSuccessPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpinarSuccessRoutingModule {}
