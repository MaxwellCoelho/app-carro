import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {

  @Output() clickedItem = new EventEmitter<any>();

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
  ) { }

  ngOnInit() { }

  public clickItem(itemRoute): void {
    this.clickedItem.emit(itemRoute);
  }

}
