import { Component, Input, OnInit } from '@angular/core';
import { AdsService } from 'src/app/services/ads/ads.service';

@Component({
  selector: 'app-affliated',
  templateUrl: './affliated.component.html',
  styleUrls: ['./affliated.component.scss'],
})
export class AffliatedComponent implements OnInit {

  @Input() keywords: string[] = [];

  public selectedAd;

  constructor(
    public ads: AdsService
  ) { }

  ngOnInit() {
    this.selectAd();
  }

  public selectAd(): void {
    this.selectedAd = this.ads.setAdsLists(this.keywords);
  }
}
