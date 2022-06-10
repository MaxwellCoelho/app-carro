import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracoesPage } from './configuracoes.page';
import { LoggedGuard } from 'src/app/guard/logged.guard';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracoesPage,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracoesPageRoutingModule {}
