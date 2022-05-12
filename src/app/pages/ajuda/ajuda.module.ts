import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AjudaPage } from './ajuda.page';

import { AjudaPageRoutingModule } from './ajuda-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AjudaPageRoutingModule
  ],
  declarations: [AjudaPage]
})
export class AjudaPageModule {}
