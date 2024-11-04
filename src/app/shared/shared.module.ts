import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../components/loader/loader.component';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';


@NgModule({
  declarations: [
    LoaderComponent,
    AvatarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent,
    AvatarComponent
  ]
})
export class SharedModule { }
