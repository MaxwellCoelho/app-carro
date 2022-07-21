import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-opinar-steps',
  templateUrl: './opinar-steps.component.html',
  styleUrls: ['./opinar-steps.component.scss'],
})
export class OpinarStepsComponent implements OnInit {

  @Input() currentStep: number;

  constructor() { }

  ngOnInit() {}

}
