/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-opinion',
  templateUrl: './opinion.component.html',
  styleUrls: ['./opinion.component.scss'],
})
export class OpinionComponent implements OnInit, AfterViewInit {

  @Input() opinions: object[];
  @Input() expanded = false;

  constructor() { }

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
