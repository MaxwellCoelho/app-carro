import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OpinarPage } from './opinar.page';
import { SharedModule } from '../../shared/shared.module';

import { OpinarPageRoutingModule } from './opinar-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpinarPageRoutingModule,
    SharedModule
  ],
  declarations: [OpinarPage]
})
export class OpinarPageModule {}
