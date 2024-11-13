import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { OpiniaoPage } from './opiniao.page';
import { SharedModule } from '../../shared/shared.module';

import { OpiniaoPageRoutingModule } from './opiniao-routing.module';
import { ValuationBarComponent } from 'src/app/components/valuation-bar/valuation-bar.component';
import { OpinionComponent } from 'src/app/components/opinion/opinion.component';
import { BannerNativeComponent } from 'src/app/components/ads/banner-native/banner-native.component';
import { BannerRowComponent } from 'src/app/components/ads/banner-row/banner-row.component';
import { BannerDisplayComponent } from 'src/app/components/ads/banner-display/banner-display.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpiniaoPageRoutingModule,
    SharedModule
  ],
  declarations: [
    OpiniaoPage,
    ValuationBarComponent,
    OpinionComponent,
    BannerNativeComponent,
    BannerRowComponent,
    BannerDisplayComponent
  ]
})
export class OpiniaoPageModule {}
