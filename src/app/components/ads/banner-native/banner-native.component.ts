import { Component, AfterViewInit, OnInit, Renderer2, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-banner-native',
  templateUrl: './banner-native.component.html',
  styleUrls: ['./banner-native.component.scss'],
})
export class BannerNativeComponent implements OnInit, AfterViewInit {

  public screenWidth;
  public loaded = [];
  public wMobile = 350;

  constructor(
    @Inject(DOCUMENT) private document,
    public renderer: Renderer2
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > this.wMobile) {
      if (!this.loaded.includes('desk')) { this.setBannerScript(); }
    } else {
      if (!this.loaded.includes('mobile')) { this.setBannerMobile(); }
    }
  }

  public ngOnInit(): void {
    console.log('disparou init');
    this.screenWidth = window.innerWidth;
  }

  public ngAfterViewInit(): void {
    console.log('disparou');
    this.onResize();
  }

  setBannerScript(): HTMLScriptElement {
    const d = this.renderer.createElement('div');
    d.id = 'container-4f4897cc4290b7ccb706f0b5dea440d5';
    this.renderer.appendChild(this.document.getElementById('banner-native-desk'), d);

    const s = this.renderer.createElement('script');
    s.async = 'async';
    s['data-cfasync'] = false;
    s.src = '//pl24870383.profitablecpmrate.com/4f4897cc4290b7ccb706f0b5dea440d5/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-native-desk'), s);

    this.loaded.push('desk');
    return s;
  }

  setBannerMobile(): HTMLScriptElement {
    const sn = this.renderer.createElement('script');
    sn.type = 'text/javascript';
    sn.innerHTML = `atOptions = {
                  'key' : '850ee7b92379f000ef00be2e741aa702',
                  'format' : 'iframe',
                  'height' : 250,
                  'width' : 300,
                  'params' : {}
                };`;

    this.renderer.appendChild(this.document.getElementById('banner-native-mobile'), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/850ee7b92379f000ef00be2e741aa702/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-native-mobile'), s);

    this.loaded.push('mobile');
    return s;
  }

}
