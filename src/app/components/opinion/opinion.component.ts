/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-opinion',
  templateUrl: './opinion.component.html',
  styleUrls: ['./opinion.component.scss'],
})
export class OpinionComponent implements OnInit, AfterViewInit {

  @Input() opinions: object[];
  @Input() expanded = false;

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.expanded) {
      this.expandDetials(`${this.opinions[0]['_id']}-ex`);
    }
  }

  public expandDetials(opinionId: string): void {
    document.getElementById(opinionId).querySelector('.details').classList.add('expand-details');
    document.getElementById(opinionId).querySelector('.details-button').classList.add('hide-button');
  }
}
