import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { COLORS, AVATARES } from 'src/app/helpers/forms.helper';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {

  @Input() imgId: number;
  @Input() colorId: number;
  @Input() name = 'Avatar';
  @Input() editable = false;
  @Output() newAvatarSelected = new EventEmitter<object>();

  public colors = COLORS;
  public avatares = AVATARES;
  public avatarSelected: number;
  public colorSelected: number;
  public isModalOpen = false;

  constructor() { }

  ngOnInit() { }

  public select(type: string, value: number) {
    this[`${type}Selected`] = value;
  }

  public submitChangeAvatar() {
    this.setOpen(false);
    setTimeout(() => {
      this.newAvatarSelected.emit({id: this.avatarSelected, color: parseInt(this.colorSelected.toString(), 10)});
    }, 50);
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

}
