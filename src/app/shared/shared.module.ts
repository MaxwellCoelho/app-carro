import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../components/loader/loader.component';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { BannerColumnComponent } from '../components/ads/banner-column/banner-column.component';


@NgModule({
  declarations: [
    LoaderComponent,
    AvatarComponent,
    BannerColumnComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent,
    AvatarComponent,
    BannerColumnComponent
  ]
})
export class SharedModule { }
