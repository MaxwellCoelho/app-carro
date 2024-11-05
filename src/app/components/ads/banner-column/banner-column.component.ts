import { Component, OnInit, Input, AfterViewInit, Inject, HostListener, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-banner-column',
  templateUrl: './banner-column.component.html',
  styleUrls: ['./banner-column.component.scss'],
})
export class BannerColumnComponent implements OnInit, AfterViewInit {

  @Input() id;
  @Input() right: boolean;

  public screenHeight;
  public screenWidth;
  public loaded = [];
  public wHigh = 680;
  public wDesk = 1550;

  constructor(
    @Inject(DOCUMENT) private document,
    public renderer: Renderer2
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    if (this.screenHeight > this.wHigh) {
      if (!this.loaded.includes('high')) { this.setColumnHighScript(); }
    } else {
      if (!this.loaded.includes('low')) { this.setColumnLowScript(); }
    }
  }

  public ngOnInit(): void {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  public ngAfterViewInit(): void {
    this.onResize();
  }

  setColumnHighScript(): HTMLScriptElement {
    const sn = this.renderer.createElement('script');
    sn.type = 'text/javascript';
    sn.innerHTML = `atOptions = {
                  'key' : '8bf21ba07de7321f0f0c0c54ba7b9be5',
                  'format' : 'iframe',
                  'height' : 600,
                  'width' : 160,
                  'params' : {}
                };`;

    this.renderer.appendChild(this.document.getElementById('banner-column-high-'+this.id), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/8bf21ba07de7321f0f0c0c54ba7b9be5/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-column-high-'+this.id), s);

    this.loaded.push('high');
    return s;
  }

  setColumnLowScript(): HTMLScriptElement {
    const sn = this.renderer.createElement('script');
    sn.type = 'text/javascript';
    sn.innerHTML = `atOptions = {
                  'key' : 'ea62f79b1bcc5df1c0d437ee750493c3',
                  'format' : 'iframe',
                  'height' : 300,
                  'width' : 160,
                  'params' : {}
                };`;

    this.renderer.appendChild(this.document.getElementById('banner-column-low-'+this.id), sn);

    const s = this.renderer.createElement('script');
    s.type = 'text/javascript';
    s.src = '//www.highperformanceformat.com/ea62f79b1bcc5df1c0d437ee750493c3/invoke.js';
    this.renderer.appendChild(this.document.getElementById('banner-column-low-'+this.id), s);

    this.loaded.push('low');
    return s;
  }

}
