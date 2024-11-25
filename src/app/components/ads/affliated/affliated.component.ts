import { Component, Input, OnInit } from '@angular/core';
import { AFFILIATED_ADS_LIST } from './affiliatedAdsList';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-affliated',
  templateUrl: './affliated.component.html',
  styleUrls: ['./affliated.component.scss'],
})
export class AffliatedComponent implements OnInit {

  @Input() keywords: string[] = [];

  public adsList = AFFILIATED_ADS_LIST;
  public selectedAd;

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.selectAd();
  }

  public selectAd(): void {
    if (!this.keywords.length) {
      const filteredList = this.adsList.filter(item => !item.keywords.length);
      const randomNum = this.utils.getRandomNumber(filteredList.length, 0);
      this.selectedAd = filteredList[randomNum];
      console.log(this.selectedAd);
    }
  }
}
