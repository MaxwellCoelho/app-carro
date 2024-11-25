/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@angular/core';
import { AFFILIATED_ADS_LIST } from './affiliatedAdsList';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AdsService {

  public adsList = AFFILIATED_ADS_LIST;
  public byTagsList = {};
  public priorityAdsByTag = {};

  constructor(
    public utils: UtilsService,
  ) { }

  setAdsLists(keywords: string[]): any {
    if (!this.byTagsList['generic']) {
      this.byTagsList['generic'] = this.adsList.filter(item => !item.keywords.length);
    }

    if (!this.priorityAdsByTag['generic'] || !this.priorityAdsByTag['generic'].length) {
      this.priorityAdsByTag['generic'] = [...this.byTagsList['generic']];
    }

    const firstTag = keywords.length ? keywords[0] : 'generic';

    if (keywords.length) {
      if (!this.byTagsList[firstTag]) {
        this.byTagsList[firstTag] = this.adsList.filter(item => item.keywords.includes(firstTag));
      }

      if (!this.priorityAdsByTag[firstTag]) {
        this.priorityAdsByTag[firstTag] = this.adsList.filter(item => item.keywords.includes(firstTag));
      }
    }

    const randomNum = this.utils.getRandomNumber(this.priorityAdsByTag[firstTag].length, 0);
    const selectedAd = this.priorityAdsByTag[firstTag][randomNum];
    this.priorityAdsByTag[firstTag].splice(randomNum, 1);

    return selectedAd;
  }
}
