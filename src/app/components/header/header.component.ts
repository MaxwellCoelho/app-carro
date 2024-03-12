import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Output() clickedItem = new EventEmitter<any>();

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
  ) { }

  ngOnInit() {}

  public clickItem(itemRoute): void {
    this.clickedItem.emit(itemRoute);
  }

}
