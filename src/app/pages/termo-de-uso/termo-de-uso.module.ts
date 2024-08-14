import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TermoDeUsoPage } from './termo-de-uso.page';

import { TermoDeUsoPageRoutingModule } from './termo-de-uso-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermoDeUsoPageRoutingModule
  ],
  declarations: [TermoDeUsoPage]
})
export class TermoDeUsoPageModule {}
