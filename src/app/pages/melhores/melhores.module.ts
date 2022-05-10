import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MelhoresPage } from './melhores.page';

import { MelhoresPageRoutingModule } from './melhores-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MelhoresPageRoutingModule
  ],
  declarations: [MelhoresPage]
})
export class MelhoresPageModule {}
