import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ConfiguracoesPage } from './configuracoes.page';

import { ConfiguracoesPageRoutingModule } from './configuracoes-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfiguracoesPageRoutingModule
  ],
  declarations: [ConfiguracoesPage]
})
export class ConfiguracoesPageModule {}
