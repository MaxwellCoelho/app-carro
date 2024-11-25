import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../components/loader/loader.component';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { BannerColumnComponent } from '../components/ads/banner-column/banner-column.component';
import { AffliatedComponent } from '../components/ads/affliated/affliated.component';


@NgModule({
  declarations: [
    LoaderComponent,
    AvatarComponent,
    AffliatedComponent,
    BannerColumnComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent,
    AvatarComponent,
    AffliatedComponent,
    BannerColumnComponent
  ]
})
export class SharedModule { }
