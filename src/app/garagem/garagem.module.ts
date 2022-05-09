import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GaragemPage } from './garagem.page';

import { GaragemPageRoutingModule } from './garagem-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GaragemPageRoutingModule
  ],
  declarations: [GaragemPage]
})
export class GaragemPageModule {}
