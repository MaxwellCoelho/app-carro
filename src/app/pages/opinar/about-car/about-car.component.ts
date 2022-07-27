/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-about-car',
  templateUrl: 'about-car.component.html',
  styleUrls: ['../opinar.page.scss'],
})
export class AboutCarComponent implements OnInit, AfterViewInit {

  @Input() selectedModel: object;
  @Input() autoFill: object;
  @Output() aboutCar = new EventEmitter<any>();
  @Output() clickForeward = new EventEmitter<any>();

  public nav = NAVIGATION;
  public showLoader: boolean;
  public formOpinarCarro: FormGroup;

  public valuation = [
    { name: 'Péssimo', value:'pessimo' },
    { name: 'Ruim', value:'ruim' },
    { name: 'Regular', value:'regular' },
    { name: 'Bom', value:'bom' },
    { name: 'Ótimo', value:'otimo' }
  ];

  public valuationItens = [
    { title: 'Interior', subtitle: 'Beleza, acabamento e espaço', value:'interior', valuation: null },
    { title: 'Exterior', subtitle: 'Beleza e acabamento', value:'exterior', valuation: null },
    { title: 'Conforto', subtitle: 'Dirigibilidade e itens de série', value:'conforto', valuation: null },
    { title: 'Segurança', subtitle: 'Estabilidade e frenagem', value:'seguranca', valuation: null },
    { title: 'Consumo', subtitle: 'Autonomia e manutenção', value:'consumo', valuation: null },
    { title: 'Durabilidade', subtitle: 'Reparos e manutenção', value:'durabilidade', valuation: null },
    { title: 'Custo-benefício', subtitle: 'Vale a pena? Recomendaria?', value:'custobeneficio', valuation: null }
  ];

  public opinarKmCompra: string;
  public opinarKmCompraValue: number;
  public opinarMotor: string;
  public opinarPeriodo: string;
  public newerYear;
  public opinarPeriodoValue;
  public opinarPeriodoMaxValue;
  public hasAllValuations = false;

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
    public fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.newerYear = new Date().getFullYear();

    this.changeOpinarKmCompra({detail: { value: 0}});
    this.changeOpinarMotor({detail: { value: 1}});
    this.changeOpinarPeriodo({detail: { value: this.newerYear - 1}});
    this.initForm();
    this.resetOpinaPeriodo();
  }

  ngAfterViewInit(): void {
    this.autoFillInfo();
    this.cdRef.detectChanges();
  }

  public initForm() {
    this.formOpinarCarro = this.fb.group({
      opinarCombustivel: this.fb.control('', [Validators.required]),
      opinarAnoModelo: this.fb.control('', [Validators.required, Validators.max(this.newerYear + 1)]),
      opinarAnoCompra: this.fb.control('', [Validators.required, Validators.max(this.newerYear)]),
      opinarTitulo: this.fb.control('', [Validators.required]),
      opinarPontosPositivos: this.fb.control('', [Validators.required]),
      opinarPontosNegativos: this.fb.control('', [Validators.required]),
    });
  }

  public onlyNumbers($event): void {
    const onlyNumbers = $event.srcElement.value.replace(/\D/g, '');
    $event.srcElement.value = onlyNumbers;
  }

  public segmentChanged($event) {
    this.valuationItens.find(item => {
        if (item.value === $event.target.id) {
          item.valuation = $event.target.value;
        }
      }
    );

    this.checkValuations();
  }

  public changeOpinarKmCompra($event) {
    const value = $event.detail.value;
    const plus = value === 99 ? '+' : '';
    const km = value === 0 ? 'Km' : '000 km';

    this.opinarKmCompraValue = value;
    this.opinarKmCompra = `${plus}${value} ${km}`;
  }

  public changeOpinarMotor($event) {
    const value = $event.detail.value;

    this.opinarMotor = value.toFixed(1);
  }

  public changeOpinarPeriodo($event) {
    const value = $event.detail.value;
    const plural = value > 1 ? 's' : '';
    const maxPeriod = this.formOpinarCarro ? this.newerYear - this.formOpinarCarro.controls.opinarAnoCompra.value : 1;

    this.opinarPeriodoValue = value;
    this.opinarPeriodoMaxValue = maxPeriod;

    this.opinarPeriodo = value < maxPeriod ? `${value} ano${plural}` : 'Atual';
  }

  public resetOpinaPeriodo() {
    const isValid = this.formOpinarCarro.controls.opinarAnoCompra.valid;

    if (isValid) {
      const val = this.newerYear - this.formOpinarCarro.controls.opinarAnoCompra.value;
      this.opinarPeriodoMaxValue = val;

      if (!this.opinarPeriodoValue || val < this.opinarPeriodoValue) {
        this.opinarPeriodoValue = val;
      } else {
        this.changeOpinarPeriodo({ detail: { value: this.opinarPeriodoValue }});
      }
    }
  }

  public checkValuations() {
    const noValue = this.valuationItens.find(val => !val.valuation);
    this.hasAllValuations = !noValue;
  }

  public saveFormOpinarCarro() {
    const valuation = {};

    for (const val of this.valuationItens) {
      valuation[val.value] = val.valuation;
    }

    const aboutCarData = {
      carModel: this.selectedModel['_id'],
      yearModel: this.formOpinarCarro.value.opinarAnoModelo,
      fuel: this.formOpinarCarro.value.opinarCombustivel,
      engine: this.opinarMotor,
      yearBought: this.formOpinarCarro.value.opinarAnoCompra,
      kmBought: this.opinarKmCompraValue,
      keptPeriod: this.opinarPeriodoValue,
      finalWords: {
        title: this.formOpinarCarro.value.opinarTitulo,
        positive: this.formOpinarCarro.value.opinarPontosPositivos,
        negative: this.formOpinarCarro.value.opinarPontosNegativos
      },
      valuation: {
        ...valuation
      }
    };

    this.aboutCar.emit(aboutCarData);
  }

  public autoFillInfo() {
    if (this.autoFill) {
      this.formOpinarCarro.controls.opinarAnoModelo.patchValue(this.autoFill['yearModel']);
      this.formOpinarCarro.controls.opinarCombustivel.patchValue(this.autoFill['fuel']);
      this.formOpinarCarro.controls.opinarAnoCompra.patchValue(this.autoFill['yearBought']);

      this.formOpinarCarro.controls.opinarTitulo.patchValue(this.autoFill['finalWords']['title']);
      this.formOpinarCarro.controls.opinarPontosPositivos.patchValue(this.autoFill['finalWords']['positive']);
      this.formOpinarCarro.controls.opinarPontosNegativos.patchValue(this.autoFill['finalWords']['negative']);

      this.changeOpinarMotor({ detail: { value: parseFloat(this.autoFill['engine']) }});
      this.changeOpinarPeriodo({ detail: { value: this.autoFill['keptPeriod'] }});
      this.changeOpinarKmCompra({detail: { value: this.autoFill['kmBought']}});

      for (const val of this.valuationItens) {
        val.valuation = this.autoFill['valuation'][val.value];
        document.getElementById(val.value+'-'+val.valuation).click();
      }

      this.hasAllValuations = true;
    }
  }

  public goBack() {
    this.clickForeward.emit();
  }

}
