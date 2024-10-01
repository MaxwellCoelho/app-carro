import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../components/loader/loader.component';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { AdsenseComponent } from '../components/adsense/adsense.component';


@NgModule({
  declarations: [
    LoaderComponent,
    AvatarComponent,
    AdsenseComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent,
    AvatarComponent,
    AdsenseComponent
  ]
})
export class SharedModule { }
