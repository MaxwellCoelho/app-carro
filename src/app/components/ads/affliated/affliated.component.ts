import { Component, Input, OnInit } from '@angular/core';
import { AdsService } from 'src/app/services/ads/ads.service';

@Component({
  selector: 'app-affliated',
  templateUrl: './affliated.component.html',
  styleUrls: ['./affliated.component.scss'],
})
export class AffliatedComponent implements OnInit {

  @Input() keywords: string[] = [];
  @Input() id: string;

  constructor(
    public ads: AdsService
  ) { }

  ngOnInit() {
    this.selectAd();
  }

  public selectAd(): void {
    const keyword = this.keywords.length ? this.keywords[0] : 'generic';
    this.ads.filterAds(keyword, this.id);
  }
}
