import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-adsense',
  templateUrl: './adsense.component.html',
  styleUrls: ['./adsense.component.scss'],
})
export class AdsenseComponent implements OnInit {

  @Input() type: 'banner' | 'block' | 'feed';
  @Input() test = false;

  constructor() { }

  ngOnInit() {}

}
