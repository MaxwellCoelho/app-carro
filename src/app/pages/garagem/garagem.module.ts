import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GaragemPage } from './garagem.page';
import { SharedModule } from '../../shared/shared.module';

import { GaragemPageRoutingModule } from './garagem-routing.module';
import { OpinionComponent } from 'src/app/components/opinion/opinion.component';
import { ValuationBarComponent } from 'src/app/components/valuation-bar/valuation-bar.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    GaragemPageRoutingModule
  ],
  declarations: [
    GaragemPage,
    ValuationBarComponent,
    OpinionComponent
  ]
})
export class GaragemPageModule {}
