import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BuscaPage } from './busca.page';
import { SharedModule } from '../../shared/shared.module';

import { BuscaPageRoutingModule } from './busca-routing.module';
import { ModelNotFoundComponent } from 'src/app/components/model-not-found/model-not-found.component';
import { BannerRowComponent } from 'src/app/components/ads/banner-row/banner-row.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    BuscaPageRoutingModule
  ],
  declarations: [
    BuscaPage,
    ModelNotFoundComponent,
    BannerRowComponent
  ]
})
export class BuscaPageModule {}
