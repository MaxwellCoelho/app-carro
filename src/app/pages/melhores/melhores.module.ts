import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MelhoresPage } from './melhores.page';
import { SharedModule } from '../../shared/shared.module';

import { MelhoresPageRoutingModule } from './melhores-routing.module';
import { BannerHomeComponent } from 'src/app/components/banner-home/banner-home/banner-home.component';
import { ValuationBarComponent } from 'src/app/components/valuation-bar/valuation-bar.component';


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
    BannerHomeComponent,
    ValuationBarComponent
  ]
})
export class MelhoresPageModule {}
