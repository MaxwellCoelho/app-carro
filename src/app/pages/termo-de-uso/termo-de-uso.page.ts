import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-termo-de-uso',
  templateUrl: './termo-de-uso.page.html',
  styleUrls: ['./termo-de-uso.page.scss'],
})
export class TermoDeUsoPage implements OnInit {

  public nav = NAVIGATION;

  constructor() { }

  ngOnInit() {}

}
