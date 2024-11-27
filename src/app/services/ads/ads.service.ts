/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@angular/core';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { CryptoService } from '../crypto/crypto.service';
import { environment } from 'src/environments/environment';
import { DataBaseService } from '../data-base/data-base.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdsService {

  public selectedTagsById$ = new BehaviorSubject<object>({});
  public runningRequest$ = new BehaviorSubject<string[]>([]);
  public loadedByTagsList = {};
  public priorityAdsByTag = {};

  constructor(
    public utils: UtilsService,
    public cryptoService: CryptoService,
    public dbService: DataBaseService,
  ) { }

  public filterAds(tag: string, id: string): void {
    if (!this.runningRequest$.value.includes(tag)) {
      this.setRunningRequest(tag);

      if (!this.loadedByTagsList[tag]) {
          const myFilter = { keywords: tag };
          const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
          const subAds = this.dbService.filterItem(environment.filterAdsAction, jwtData).subscribe(
            res => {
              if (!subAds.closed) { subAds.unsubscribe(); }
              if (res.ads && res.ads.length) {
                this.loadedByTagsList[tag] = [...res.ads];
                this.priorityAdsByTag[tag] = [...res.ads];

                this.selectAd(tag, id);
                this.closeRunningRequest(tag);
              } else {
                this.closeRunningRequest(tag);
                this.filterAds('generic', id);
              }
            },
            err => {
              this.closeRunningRequest(tag);
            }
          );
      } else {
        this.changeToGenericTag(tag, id);
      }
    } else {
      let runSub = new Subscription();
      runSub = this.runningRequest$.subscribe(res => {
          if (!runSub.closed) {runSub.unsubscribe(); }
          if (!res.includes(tag)) {
            this.filterAds(tag, id);
          }
        }
      );
    }
  }

  public changeToGenericTag(tag: string, id: string) {
    if (!this.priorityAdsByTag['generic'] || !this.priorityAdsByTag['generic'].length) {
      this.priorityAdsByTag['generic'] = [...this.loadedByTagsList['generic']];
    }

    if (tag !== 'generic' && this.priorityAdsByTag[tag] && !this.priorityAdsByTag[tag].length) {
      tag = 'generic';
    }

    this.selectAd(tag, id);
    this.closeRunningRequest(tag);
  }

  public closeRunningRequest(tag: any) {
    const runArr = this.runningRequest$.value;
    const idx = runArr.findIndex(item => item === tag);
    runArr.splice(idx, 1);
    this.runningRequest$.next(runArr);
  }

  public setRunningRequest(tag: any) {
    const runArr = [...this.runningRequest$.value, tag];
    this.runningRequest$.next(runArr);
  }

  public selectAd(tag: string, id: string): void {
    const randomNum = this.utils.getRandomNumber(this.priorityAdsByTag[tag].length, 0);
    const selectedAd = this.priorityAdsByTag[tag][randomNum];
    this.priorityAdsByTag[tag].splice(randomNum, 1);
    const selectedObj = this.selectedTagsById$.value;
    selectedObj[id] = selectedAd;
    this.selectedTagsById$.next(selectedObj);
  }
}
