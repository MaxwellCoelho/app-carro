import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MelhoresPage } from './melhores.page';
import { SharedModule } from '../../shared/shared.module';

import { MelhoresPageRoutingModule } from './melhores-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    MelhoresPageRoutingModule
  ],
  declarations: [MelhoresPage]
})
export class MelhoresPageModule {}
