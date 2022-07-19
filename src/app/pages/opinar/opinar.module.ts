import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { OpinarPage } from './opinar.page';
import { SharedModule } from '../../shared/shared.module';
import { AboutCarComponent } from './about-car/about-car.component';

import { OpinarPageRoutingModule } from './opinar-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OpinarPageRoutingModule,
    SharedModule
  ],
  providers: [
    FormBuilder
  ],
  declarations: [
    OpinarPage,
    AboutCarComponent
  ]
})
export class OpinarPageModule {}
