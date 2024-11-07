/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, HostListener, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { ViewWillEnter, ViewDidEnter } from '@ionic/angular';
import { SearchService } from 'src/app/services/search/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-opinar-success',
  templateUrl: './opinar-success.page.html',
  styleUrls: ['./opinar-success.page.scss'],
})
export class OpinarSuccessPage implements AfterViewInit, ViewWillEnter, ViewDidEnter {

  public nav = NAVIGATION;

  constructor(
    public searchService: SearchService,
    public router: Router,
    @Inject(DOCUMENT) private document,
    public renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    this.setTagEvent();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.adjustImgContainer();
  }

  public ionViewWillEnter(): void {

  }

  public ionViewDidEnter(): void {
    this.adjustImgContainer();
  }

  public setTagEvent() {
    const sn = this.renderer.createElement('script');
    sn.innerHTML = `gtag('event', 'conversion_event_page_view_4', {
          // <event_parameters>
        });`;

    this.renderer.appendChild(this.document.getElementById('eventTag'), sn);
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
