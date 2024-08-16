/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

@Component({
  selector: 'app-opinion',
  templateUrl: './opinion.component.html',
  styleUrls: ['./opinion.component.scss'],
})
export class OpinionComponent implements OnInit, AfterViewInit {

  @Input() opinions: object[];
  @Input() expanded = true;

  constructor(
    public utils: UtilsService,
    public router: Router,
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.expanded && this.opinions[0]) {
      this.expandDetials(`${this.opinions[0]['_id']}-ex`);
    }
  }

  public expandDetials(opinionId: string): void {
    document.getElementById(opinionId).querySelector('.details').classList.add('expand-details');
    document.getElementById(opinionId).querySelector('.details-button').classList.add('hide-button');
  }

  public goToUserGarage(userUrl: string) {
    if (userUrl) {
      this.router.navigate([`${NAVIGATION.garage.route}/${userUrl}`]);
    }
  }
}
