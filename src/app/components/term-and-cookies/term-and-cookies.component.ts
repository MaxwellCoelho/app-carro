import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-term-and-cookies',
  templateUrl: './term-and-cookies.component.html',
  styleUrls: ['./term-and-cookies.component.scss'],
})
export class TermAndCookiesComponent implements OnInit {

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
    public router: Router,
  ) { }

  ngOnInit() {}

  acceptTerm() {
    this.utils.localStorageSetItem('acceptedTermAndCookies', 'true');
  }

  showTerm(): boolean {
    const isTermPage = location.pathname.includes(this.nav.term.route);
    const alreadyAccepted = this.utils.localStorageGetItem('acceptedTermAndCookies');

    return !isTermPage && !alreadyAccepted;
  }

  goToTerm() {
    this.router.navigate([`/${this.nav.term.route}`]);
  }
}
