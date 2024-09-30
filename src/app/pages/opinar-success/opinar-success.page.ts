/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, HostListener, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { ViewWillEnter, ViewDidEnter } from '@ionic/angular';
import { SearchService } from 'src/app/services/search/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-opinar-success',
  templateUrl: './opinar-success.page.html',
  styleUrls: ['./opinar-success.page.scss'],
})
export class OpinarSuccessPage implements OnInit, ViewWillEnter, ViewDidEnter {

  public nav = NAVIGATION;

  constructor(
    public searchService: SearchService,
    public router: Router,
  ) { }

  ngOnInit() {}

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.adjustImgContainer();
  }

  public ionViewWillEnter(): void {

  }

  public ionViewDidEnter(): void {
    this.adjustImgContainer();
  }

  public adjustImgContainer() {
    if (document.querySelector('.opinar-container').querySelector('.model-image-container')) {
      document.querySelector('.opinar-container').querySelector('.model-image-container')['style'].minHeight = `${document.querySelector('.opinar-container').querySelector('.model-image')['height']}px`;
    }
  }

  public goOpinions() {
    this.router.navigate([`opiniao/${this.searchService.opinarSelectedModel['brand']['url']}/${this.searchService.opinarSelectedModel['url']}`]);
  }

  public goSearch() {
    this.router.navigate([NAVIGATION.search.route]);
  }

}
