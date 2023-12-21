import { Component, Input, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() loggedUser;

  public nav = NAVIGATION;

  constructor() { }

  ngOnInit() {}

}
