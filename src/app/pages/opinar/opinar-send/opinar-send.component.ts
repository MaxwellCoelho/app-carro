import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils/utils.service';

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
  public sessionUser = this.utils.sessionUser;

  constructor(
    public fb: FormBuilder,
    public utils: UtilsService,
  ) { }

  ngOnInit() {
    if (this.sessionUser) {
      this.saveFormOpinarSend(true);
    } else {
      this.initForm();
    }
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

  public saveFormOpinarSend(logged?: boolean) {
    const userInfoData = {
      name: logged ? this.sessionUser.name : this.formOpinarSend.value.opinarNome,
      email: logged ? this.sessionUser.email : this.formOpinarSend.value.opinarEmail
    };

    this.stepSend.emit(userInfoData);
  }

}
