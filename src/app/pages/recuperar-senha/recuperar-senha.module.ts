import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecuperarSenhaPage } from './recuperar-senha.page';

import { RecuperarSenhaPageRoutingModule } from './recuperar-senha-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RecuperarSenhaPageRoutingModule
  ],
  declarations: [RecuperarSenhaPage]
})
export class RecuperarSenhaPageModule {}
