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
      // opinarTitulo: this.fb.control('', [Validators.required]),
      // opinarPontosPositivos: this.fb.control('', [Validators.required]),
      // opinarPontosNegativos: this.fb.control('', [Validators.required]),
    });
  }

  public goBack() {
    this.clickForeward.emit();
  }

  public saveFormOpinarSend() {
    const aboutBrandData = {
      // finalWords: {
      //   title: this.formOpinarMarca.value.opinarTitulo,
      //   positive: this.formOpinarMarca.value.opinarPontosPositivos,
      //   negative: this.formOpinarMarca.value.opinarPontosNegativos
      // }
    };

    this.stepSend.emit(aboutBrandData);
  }

}
