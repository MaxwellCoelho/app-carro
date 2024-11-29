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

  public filterAds(tags: string[], id: string): void {
    const tagsLen = tags.length;
    const filter = (tag, idx) => {
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
                  if (idx + 1 >= tagsLen) {
                    filter('generic', 0);
                  } else {
                    idx++;
                    filter(tags[idx], idx);
                  }
                }
              },
              err => {
                this.closeRunningRequest(tag);
              }
            );
        } else {
          if (this.priorityAdsByTag['generic']){
            this.changeToGenericTag(tag, id);
          } else {
            this.closeRunningRequest(tag);
            filter('generic', 0);
          }
        }
      } else {
        let runSub = new Subscription();
        runSub = this.runningRequest$.subscribe(res => {
            if (!runSub.closed) {runSub.unsubscribe(); }
            if (!res.includes(tag)) {
              filter(tag, idx);
            }
          }
        );
      }
    };
    filter(tags[0], 0);
  }

  public changeToGenericTag(tag: string, id: string) {
    if (this.priorityAdsByTag['generic'] && !this.priorityAdsByTag['generic'].length) {
      this.priorityAdsByTag['generic'] = [...this.loadedByTagsList['generic']];
    }

    if (tag !== 'generic' && this.priorityAdsByTag[tag] && !this.priorityAdsByTag[tag].length) {
      tag = 'generic';
    }

    if (this.priorityAdsByTag[tag]) {
      this.selectAd(tag, id);
    }

    this.closeRunningRequest(id);
  }

  public closeRunningRequest(id: any) {
    const runArr = this.runningRequest$.value;
    const idx = runArr.findIndex(item => item === id);
    runArr.splice(idx, 1);
    this.runningRequest$.next(runArr);
  }

  public setRunningRequest(id: any) {
    const runArr = [...this.runningRequest$.value, id];
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
