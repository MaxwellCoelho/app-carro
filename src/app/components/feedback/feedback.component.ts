/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, Input, OnInit } from '@angular/core';
import { VALUATION } from 'src/app/helpers/valuation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {

  @Input() user: object;

  public valuation = VALUATION.slice().filter(val => val.id.includes(' r'));
  public valuationItem = {};
  public formFeedback: FormGroup;
  public alreadySent = false;
  public showForm: boolean;

  constructor(
    public dbService: DataBaseService,
    public cryptoService: CryptoService,
    public fb: FormBuilder,
    public utils: UtilsService,
  ) { }

  ngOnInit() {
    this.initForm();

    const alreadySent = !!this.utils.localStorageGetItem('sentFeedback');
    this.showForm = !alreadySent;
  }

  public initForm() {
    this.formFeedback = this.fb.group({
      feedbackComments: this.fb.control('', [Validators.required])
    });
  }

  public segmentChanged($event) {
    if ($event.target.value) {
      const val = this.valuation.find(valItem => valItem.value.toString() === $event.target.value.toString());
      this.valuationItem = { id: val ? val.id : $event.target.id, value: $event.target.value};
    }
  }

  public submitFeedback() {
    const payload = {
      page: 'opinar',
      valuation: this.valuationItem['value'],
      comments: this.formFeedback.value.feedbackComments,
      created_by: this.user,
      modified_by: this.user
    };

    const jwtData = { data: this.cryptoService.encondeJwt(payload)};
    const subOpinion = this.dbService.createItem(environment.feedbackAction, jwtData).subscribe(
      res => {
        if (!subOpinion.closed) { subOpinion.unsubscribe(); }
        this.saveFeedbackSuccess();
      },
      err => {
        if (!subOpinion.closed) { subOpinion.unsubscribe(); }
        this.saveFeedbackSuccess();
      }
    );
  }

  public saveFeedbackSuccess(): void {
    this.alreadySent = true;
    this.utils.localStorageSetItem('sentFeedback', 'true');
  }
}
