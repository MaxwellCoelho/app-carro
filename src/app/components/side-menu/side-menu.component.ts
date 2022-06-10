import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  @Input() loggedUser;
  @Output() clickedItem = new EventEmitter<any>();

  public nav = NAVIGATION;

  constructor() { }

  ngOnInit() { }

  public clickItem(itemRoute): void {
    this.clickedItem.emit(itemRoute);
  }

}
