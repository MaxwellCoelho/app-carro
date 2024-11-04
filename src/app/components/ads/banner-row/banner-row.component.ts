import { Component, AfterViewInit, Renderer2, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-banner-row',
  templateUrl: './banner-row.component.html',
  styleUrls: ['./banner-row.component.scss'],
})
export class BannerRowComponent implements AfterViewInit {

  public screenWidth;
  public loaded = [];
  public wDesk = 800;
  public wTablet = 540;

  constructor(
    @Inject(DOCUMENT) private document,
    public renderer: Renderer2
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > this.wDesk) {
      if (!this.loaded.includes('desk')) { this.setFeedScriptDesk(); }
    } else if (this.screenWidth > this.wTablet && this.screenWidth <= this.wDesk) {
      if (!this.loaded.includes('tablet')) { this.setFeedScriptTablet(); }
    } else {
      if (!this.loaded.includes('mobile')) { this.setFeedScriptMobile(); }
    }
  }

  public ngAfterViewInit(): void {
    this.onResize();
  }

  setFeedScriptDesk(): HTMLScriptElement {
    const sn = this.renderer.createElement('script');
    sn.type = 'text/javascript';
    sn.innerHTML = `atOptions = {
                  'key' : 'd5414c7a695fb35e2fc3602474d08e85',
                  'format' : 'iframe',
                  'height' : 90,
                  'width' : 728,
                  'params' : {}
                };`;

    this.renderer.appendChild(this.document.getElementById('banner-row-desk'), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/d5414c7a695fb35e2fc3602474d08e85/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-row-desk'), s);

    this.loaded.push('desk');
    return s;
  }

  setFeedScriptTablet(): HTMLScriptElement {
    const sn = this.renderer.createElement('script');
    sn.type = 'text/javascript';
    sn.innerHTML = `atOptions = {
                  'key' : 'fef15c58284844789112c1d4c5165da1',
                  'format' : 'iframe',
                  'height' : 60,
                  'width' : 468,
                  'params' : {}
                };`;

    this.renderer.appendChild(this.document.getElementById('banner-row-tablet'), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/fef15c58284844789112c1d4c5165da1/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-row-tablet'), s);

    this.loaded.push('tablet');
    return s;
  }

  setFeedScriptMobile(): HTMLScriptElement {
    const sn = this.renderer.createElement('script');
    sn.type = 'text/javascript';
    sn.innerHTML = `atOptions = {
                  'key' : 'd1a97a78ebab1e8c8fc3c3271c5b61ce',
                  'format' : 'iframe',
                  'height' : 50,
                  'width' : 320,
                  'params' : {}
                };`;

    this.renderer.appendChild(this.document.getElementById('banner-row-mobile'), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/d1a97a78ebab1e8c8fc3c3271c5b61ce/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-row-mobile'), s);

    this.loaded.push('mobile');
    return s;
  }
}
