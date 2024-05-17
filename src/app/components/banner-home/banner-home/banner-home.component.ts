import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-banner-home',
  templateUrl: './banner-home.component.html',
  styleUrls: ['./banner-home.component.scss'],
})
export class BannerHomeComponent implements OnInit {

  constructor(
    public router: Router,
  ) { }

  ngOnInit() {}

  goToSearch() {
    this.router.navigate([NAVIGATION.search.route]);
  }

}
