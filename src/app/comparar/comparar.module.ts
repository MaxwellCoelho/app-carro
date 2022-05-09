import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CompararPage } from './comparar.page';

import { CompararPageRoutingModule } from './comparar-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompararPageRoutingModule
  ],
  declarations: [CompararPage]
})
export class CompararPageModule {}
