import { Component, AfterViewInit, OnInit, Renderer2, Inject, HostListener, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-banner-display',
  templateUrl: './banner-display.component.html',
  styleUrls: ['./banner-display.component.scss'],
})
export class BannerDisplayComponent implements OnInit, AfterViewInit {

  @Input() id;

  constructor(
    @Inject(DOCUMENT) private document,
    public renderer: Renderer2
  ) { }

  ngOnInit() {}

  public ngAfterViewInit(): void {
    this.setBannerScript();
  }

  setBannerScript(): HTMLScriptElement {
    const s = this.renderer.createElement('script');
    s.async = 'async';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3048985759640217';
    s.crossorigin = 'anonymous';
    this.renderer.appendChild(this.document.getElementById('banner-display-desk-'+this.id), s);

    const sn = this.renderer.createElement('script');
    sn.innerHTML = `(adsbygoogle = window.adsbygoogle || []).push({});`;
    this.renderer.appendChild(this.document.getElementById('banner-display-desk-'+this.id), sn);

    return s;
  }

}
