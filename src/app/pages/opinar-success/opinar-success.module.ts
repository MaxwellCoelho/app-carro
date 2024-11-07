import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { OpinarSuccessPage } from './opinar-success.page';
import { SharedModule } from '../../shared/shared.module';
import { FeedbackComponent } from 'src/app/components/feedback/feedback.component';
import { OpinarSuccessRoutingModule } from './opinar-success-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OpinarSuccessRoutingModule,
    SharedModule,
  ],
  providers: [
    FormBuilder
  ],
  declarations: [
    OpinarSuccessPage,
    FeedbackComponent
  ]
})
export class OpinarSuccessPageModule {}
