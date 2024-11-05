import { Component, AfterViewInit, OnInit, Renderer2, Inject, HostListener, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-banner-native',
  templateUrl: './banner-native.component.html',
  styleUrls: ['./banner-native.component.scss'],
})
export class BannerNativeComponent implements OnInit, AfterViewInit {

  @Input() id;
  @Input() url;

  public screenWidth;
  public loaded = [];
  public wMobile = 500;

  constructor(
    public utils: UtilsService,
    @Inject(DOCUMENT) private document,
    public renderer: Renderer2
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > this.wMobile) {
      if (!this.loaded.includes('desk')) {
        if (!this.utils.nativeBannerDesk) {
          this.setBannerScript();
        } else {
          this.document.getElementById('banner-native-desk-'+this.id).innerHTML = this.utils.nativeBannerDesk;
        }
      }
    } else {
      if (!this.loaded.includes('mobile') && location.pathname.includes(this.url)) { this.setBannerMobile(); }
    }
  }

  public ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  public ngAfterViewInit(): void {
    this.onResize();
  }

  setBannerScript(): HTMLScriptElement {
    const d = this.renderer.createElement('div');
    d.id = 'container-4f4897cc4290b7ccb706f0b5dea440d5';
    this.renderer.appendChild(this.document.getElementById('banner-native-desk-'+this.id), d);

    const s = this.renderer.createElement('script');
    s.async = 'async';
    s['data-cfasync'] = false;
    s.src = '//pl24870383.profitablecpmrate.com/4f4897cc4290b7ccb706f0b5dea440d5/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-native-desk-'+this.id), s);
    this.loaded.push('desk');

    setTimeout(() => {
      this.utils.nativeBannerDesk = document.getElementById('banner-native-desk-'+this.id).innerHTML;
    }, 2000);

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

    this.renderer.appendChild(this.document.getElementById('banner-native-mobile-'+this.id), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/850ee7b92379f000ef00be2e741aa702/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-native-mobile-'+this.id), s);

    this.loaded.push('mobile');
    return s;
  }

}
