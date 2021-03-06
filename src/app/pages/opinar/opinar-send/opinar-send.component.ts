import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-opinar-send',
  templateUrl: './opinar-send.component.html',
  styleUrls: ['../opinar.page.scss'],
})
export class OpinarSendComponent implements OnInit {

  @Input() selectedModel: object;
  @Output() stepSend = new EventEmitter<any>();
  @Output() clickForeward = new EventEmitter<any>();

  public formOpinarSend: FormGroup;

  constructor(
    public fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  public initForm() {
    this.formOpinarSend = this.fb.group({
      opinarNome: this.fb.control('', [Validators.required]),
      opinarEmail: this.fb.control('', [Validators.required]),
    });
  }

  public goBack() {
    this.clickForeward.emit();
  }

  public saveFormOpinarSend() {
    const userInfoData = {
      name: this.formOpinarSend.value.opinarNome,
      email: this.formOpinarSend.value.opinarEmail
    };

    this.stepSend.emit(userInfoData);
  }

}
