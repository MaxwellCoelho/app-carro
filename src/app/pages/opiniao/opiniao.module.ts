import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OpiniaoPage } from './opiniao.page';
import { SharedModule } from '../../shared/shared.module';

import { OpiniaoPageRoutingModule } from './opiniao-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpiniaoPageRoutingModule,
    SharedModule
  ],
  declarations: [OpiniaoPage]
})
export class OpiniaoPageModule {}
