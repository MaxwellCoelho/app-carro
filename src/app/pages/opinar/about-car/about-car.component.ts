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
import { VALUATION, VALUATION_ITENS_CAR } from 'src/app/helpers/valuation.helper';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils/utils.service';

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

  public valuation = VALUATION.slice();
  public valuationItens = VALUATION_ITENS_CAR.slice();

  public opinarKmCompra: string;
  public opinarKmCompraValue: number;
  public opinarMotor: string;
  public opinarPeriodo: string;
  public newerYear = new Date().getFullYear();
  public opinarPeriodoValue;
  public opinarPeriodoMaxValue;
  public hasAllValuations = false;
  public carVersions: any[];
  public newVersion = false;
  public mainFormGroup = {
    opinarVersao: this.fb.control('', [Validators.required]),
    opinarAnoCompra: this.fb.control('', [Validators.required, Validators.max(this.newerYear)]),
    opinarTitulo: this.fb.control('', [Validators.required]),
    opinarPontosPositivos: this.fb.control('', [Validators.required]),
    opinarPontosNegativos: this.fb.control('', [Validators.required]),
  };
  public newVersionFormGroup = {
    opinarCombustivel: this.fb.control('', [Validators.required]),
    opinarAnoModelo: this.fb.control('', [Validators.required, Validators.max(this.newerYear + 1)]),
    opinarCambio: this.fb.control('', [Validators.required]),
    opinarComplemento: this.fb.control('', []),
  };

  constructor(
    public dbService: DataBaseService,
    public toastController: ToastController,
    public cryptoService: CryptoService,
    public route: ActivatedRoute,
    public searchService: SearchService,
    public router: Router,
    public fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    public utils: UtilsService,
  ) {}

  ngOnInit(): void {
    this.getVersions();

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
    this.formOpinarCarro = this.fb.group(this.mainFormGroup);
  }

  public getVersions(): void {
    const recoveredReviewVersion = this.utils.recoveryCreatedItem('createdVersion');
    this.showLoader = true;
    const myFilter = { model: this.selectedModel['_id'] };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subVersions = this.dbService.filterItem(environment.filterVersionsAction, jwtData).subscribe(
      res => {
        if (!subVersions.closed) { subVersions.unsubscribe(); }
        const versions = [];
        for (const version of res.versions) {
          if (version.active) {
            if (!version.review || (version.review && recoveredReviewVersion.find(item => item['_id'] === version['_id']))) {
              versions.push(version);
            }
          }
        }

        this.carVersions = versions;
        this.chooseVersion();
        this.showLoader = false;
      },
      err => {
        this.carVersions = [];
        this.chooseVersion();
        this.showLoader = false;
      }
    );
  }

  public chooseVersion(): void {
    this.newVersion = (this.carVersions && !this.carVersions.length) || this.formOpinarCarro.controls.opinarVersao.value === 'another';

    if (this.newVersion) {
      this.formOpinarCarro.controls.opinarVersao.patchValue('another');
      this.formOpinarCarro = this.fb.group({...this.mainFormGroup, ...this.newVersionFormGroup});
    } else {
      this.formOpinarCarro = this.fb.group(this.mainFormGroup);
    }
  }

  public onlyNumbers($event): void {
    const onlyNumbers = $event.srcElement.value.replace(/\D/g, '');
    $event.srcElement.value = onlyNumbers;
  }

  public segmentChanged($event) {
    this.valuationItens.find(item => {
        if (item.value === $event.target.id) {
          const val = this.valuation.find(valItem => valItem.value.toString() === $event.target.value.toString());
          item.valuation = { id: val ? val.id : $event.target.id, value: $event.target.value};
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
      valuation[val.value] = parseInt(val.valuation.value, 10);
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
        val.valuation = this.valuation.find(valItem => valItem.value === this.autoFill['valuation'][val.value]);
        document.getElementById(val.value+'-'+val.valuation.id).click();
      }

      this.hasAllValuations = true;
    } else {
      this.valuationItens.forEach(item => item.valuation = null);
    }
  }

  public goBack() {
    this.clickForeward.emit();
  }

}
