import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BuscaPage } from './busca.page';
import { SharedModule } from '../../shared/shared.module';

import { BuscaPageRoutingModule } from './busca-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    BuscaPageRoutingModule
  ],
  declarations: [BuscaPage]
})
export class BuscaPageModule {}
