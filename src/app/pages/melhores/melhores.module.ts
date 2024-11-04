import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MelhoresPage } from './melhores.page';
import { SharedModule } from '../../shared/shared.module';

import { MelhoresPageRoutingModule } from './melhores-routing.module';
import { BannerHomeComponent } from 'src/app/components/banner-home/banner-home.component';
import { ValuationBarComponent } from 'src/app/components/valuation-bar/valuation-bar.component';
import { BannerNativeComponent } from 'src/app/components/ads/banner-native/banner-native.component';
import { BannerRowComponent } from 'src/app/components/ads/banner-row/banner-row.component';


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
    ValuationBarComponent,
    BannerNativeComponent,
    BannerRowComponent
  ]
})
export class MelhoresPageModule {}
