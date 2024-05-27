import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-valuation-bar',
  templateUrl: './valuation-bar.component.html',
  styleUrls: ['./valuation-bar.component.scss'],
})
export class ValuationBarComponent implements OnInit {

  @Input() valuationId: string;
  @Input() small = false;

  constructor() { }

  ngOnInit() {}

}
