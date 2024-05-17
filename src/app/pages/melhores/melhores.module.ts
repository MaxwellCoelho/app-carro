import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MelhoresPage } from './melhores.page';
import { SharedModule } from '../../shared/shared.module';

import { MelhoresPageRoutingModule } from './melhores-routing.module';
import { BannerHomeComponent } from 'src/app/components/banner-home/banner-home/banner-home.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    MelhoresPageRoutingModule
  ],
  declarations: [
    MelhoresPage,
    BannerHomeComponent
  ]
})
export class MelhoresPageModule {}
