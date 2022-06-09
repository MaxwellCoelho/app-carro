import { Component, Input, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-tab-menu',
  templateUrl: './tab-menu.component.html',
  styleUrls: ['./tab-menu.component.scss'],
})
export class TabMenuComponent implements OnInit {

  @Input() loggedUser;

  public nav = NAVIGATION;
  public tabSelected: string;

  constructor(
    public utils: UtilsService,
  ) { }

  ngOnInit() {}

  public checkUser() {
    this.loggedUser = this.utils.returnLoggedUser();
  }
}
