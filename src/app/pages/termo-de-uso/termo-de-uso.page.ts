import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-termo-de-uso',
  templateUrl: './termo-de-uso.page.html',
  styleUrls: ['./termo-de-uso.page.scss'],
})
export class TermoDeUsoPage implements OnInit {

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
    public router: Router,
  ) { }

  ngOnInit() {}

  acceptTerm() {
    this.utils.localStorageSetItem('acceptedTermAndCookies', 'true');
    this.router.navigate([`/`]);
  }

}
