/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-about-brand',
  templateUrl: './about-brand.component.html',
  styleUrls: ['../opinar.page.scss'],
})
export class AboutBrandComponent implements OnInit, AfterViewInit {

  @Input() selectedModel: object;
  @Input() autoFill: object;
  @Output() aboutBrand = new EventEmitter<any>();
  @Output() clickForeward = new EventEmitter<any>();

  public formOpinarMarca: FormGroup;

  public hasAllValuations = false;

  public valuation = [
    { name: 'Péssimo', id: 'pessimo', value: 1 },
    { name: 'Ruim', id: 'ruim', value: 2 },
    { name: 'Regular', id: 'regular', value: 3 },
    { name: 'Bom', id: 'bom', value: 4 },
    { name: 'Ótimo', id: 'otimo', value: 5 }
  ];

  public valuationItens = [
    { title: 'Serviços', subtitle: 'Revisão e manutenção', value:'servicos', valuation: null },
    { title: 'Atendimento', subtitle: 'Cordialidade e cumprimeto de prazos', value:'atendimento', valuation: null },
    { title: 'Preços', subtitle: 'Carros, peças e serviços', value:'precos', valuation: null },
    { title: 'Credibilidade', subtitle: 'Transmite confiança em seus produtos e serviços?', value:'credibilidade', valuation: null },
    { title: 'Satisfação', subtitle: 'Recomendaria ou compraria novamente?', value:'satisfacao', valuation: null }
  ];

  constructor(
    public fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.autoFillInfo();
    this.cdRef.detectChanges();
  }

  public initForm() {
    this.formOpinarMarca = this.fb.group({
      opinarTitulo: this.fb.control('', [Validators.required]),
      opinarPontosPositivos: this.fb.control('', [Validators.required]),
      opinarPontosNegativos: this.fb.control('', [Validators.required]),
    });
  }

  public segmentChanged($event) {
    this.valuationItens.find(item => {
        if (item.value === $event.target.id) {
          item.valuation = { id: $event.target.id, value: $event.target.value};
        }
      }
    );

    this.checkValuations();
  }

  public checkValuations() {
    const noValue = this.valuationItens.find(val => !val.valuation);
    this.hasAllValuations = !noValue;
  }

  public goBack() {
    this.clickForeward.emit();
  }

  public saveFormOpinarMarca() {
    const valuation = {};

    for (const val of this.valuationItens) {
      valuation[val.value] = parseInt(val.valuation.value, 10);
    }

    const aboutBrandData = {
      carBrand: this.selectedModel['brand']['_id'],
      finalWords: {
        title: this.formOpinarMarca.value.opinarTitulo,
        positive: this.formOpinarMarca.value.opinarPontosPositivos,
        negative: this.formOpinarMarca.value.opinarPontosNegativos
      },
      valuation: {
        ...valuation
      }
    };

    this.aboutBrand.emit(aboutBrandData);
  }

  public autoFillInfo() {
    if (this.autoFill) {

      this.formOpinarMarca.controls.opinarTitulo.patchValue(this.autoFill['finalWords']['title']);
      this.formOpinarMarca.controls.opinarPontosPositivos.patchValue(this.autoFill['finalWords']['positive']);
      this.formOpinarMarca.controls.opinarPontosNegativos.patchValue(this.autoFill['finalWords']['negative']);

      for (const val of this.valuationItens) {
        val.valuation = this.valuation.find(valItem => valItem.value === this.autoFill['valuation'][val.value]);
        document.getElementById(val.value+'-'+val.valuation.id).click();
      }

      this.hasAllValuations = true;
    }
  }

}
