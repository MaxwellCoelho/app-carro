import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FavoritosPage } from './favoritos.page';

import { FavoritosPageRoutingModule } from './favoritos-routing.module';
import { BannerRowComponent } from 'src/app/components/ads/banner-row/banner-row.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritosPageRoutingModule
  ],
  declarations: [
    FavoritosPage,
    BannerRowComponent
  ]
})
export class FavoritosPageModule {}
