/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NAVIGATION, DISCLAIMER } from 'src/app/helpers/navigation.helper';
import { DataBaseService } from 'src/app/services/data-base/data-base.service';
import { SearchService } from 'src/app/services/search/search.service';
import { CryptoService } from 'src/app/services/crypto/crypto.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VALUATION, VALUATION_ITENS_CAR } from 'src/app/helpers/valuation.helper';
import { FUEL, GEARBOX } from 'src/app/helpers/forms.helper';
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
  @Output() loadedVersions = new EventEmitter<any>();
  @Output() clickForeward = new EventEmitter<any>();
  @Output() yearSelected = new EventEmitter<any>();

  public nav = NAVIGATION;
  public disclaimer = DISCLAIMER;
  public fuels = FUEL;
  public gearboxes = GEARBOX;
  public years = [];
  public anotherYear = false;
  public showLoader: boolean;
  public formOpinarCarro: FormGroup;
  public isElectric = false;

  public valuation = VALUATION.slice().filter(val => val.id.includes(' r'));
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
  public carVersionsToShow: any[];
  public newVersion = false;
  public mainFormGroup = {
    opinarAnoModelo: this.fb.control('', [Validators.required, Validators.max(this.newerYear + 1)]),
    opinarVersao: this.fb.control('', [Validators.required]),
    opinarAnoCompra: this.fb.control('', [Validators.required, Validators.max(this.newerYear)]),
    opinarTitulo: this.fb.control('', [Validators.required]),
    opinarPontosPositivos: this.fb.control('', [Validators.required]),
    opinarPontosNegativos: this.fb.control('', [Validators.required]),
  };
  public newVersionFormGroup = {
    opinarCombustivel: this.fb.control('', [Validators.required]),
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
    public utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.getYears();
    this.changeOpinarKmCompra({detail: { value: 0}});
    this.changeOpinarMotor({detail: { value: 1}});
    this.changeOpinarPeriodo({detail: { value: this.newerYear - 1}});
    this.initForm();
    this.resetOpinaPeriodo();
  }

  ngAfterViewInit(): void {
    this.getVersions();
    this.cdRef.detectChanges();
  }

  public getYears(): void {
    const generations = this.selectedModel['generation'];
    if (generations && Object.keys(generations).length) {
      Object.values(generations).forEach(gen => {
        const start = parseInt(gen['yearStart'], 10);
        const end = parseInt(gen['yearEnd'], 10);
        const diff = end - start;

        for (let i = 0; i <= diff; i++) {
          this.years.unshift(start + i);
        }
      });
    }
  }

  public initForm() {
    this.formOpinarCarro = this.fb.group(this.mainFormGroup);
  }

  public getVersions(): void {
    this.showLoader = true;
    const myFilter = { ['model._id']: this.selectedModel['_id'] };
    const jwtData = { data: this.cryptoService.encondeJwt(myFilter)};
    const subVersions = this.dbService.filterItem(environment.filterVersionsAction, jwtData).subscribe(
      res => {
        if (!subVersions.closed) { subVersions.unsubscribe(); }
        const versions = [];
        for (const version of res.versions) {
          if (version.active) {
            versions.push(version);
          }
        }

        this.carVersions = versions;
        this.chooseVersion();
        this.autoFillInfo();
        this.showLoader = false;
      },
      err => {
        this.carVersions = [];
        this.chooseVersion();
        this.autoFillInfo();
        this.showLoader = false;
      }
    );
  }

  public chooseVersion(): void {
    this.newVersion = (this.carVersions && !this.carVersions.length)
      || this.formOpinarCarro.controls.opinarVersao.value === 'anotherVersion';

    if (this.newVersion) {
      this.formOpinarCarro.controls.opinarVersao.patchValue('anotherVersion');
      this.formOpinarCarro = this.fb.group({...this.mainFormGroup, ...this.newVersionFormGroup});
    } else {
      this.formOpinarCarro = this.fb.group(this.mainFormGroup);
    }
  }

  public chooseYear(year: string): void {
    if (year === 'anotherYear') {
      this.anotherYear = true;
      this.formOpinarCarro.controls.opinarAnoModelo.patchValue('');
      return;
    }
    const myYear = parseInt(year, 10);
    if (myYear.toString().length >= 4) {
      this.yearSelected.emit(myYear);
    }
    this.carVersionsToShow = this.carVersions.filter(version => version.years.includes(myYear));
    if (!this.carVersionsToShow.length) {
      this.carVersionsToShow = this.carVersions;
    }
  }

  public segmentChanged($event) {
    this.valuationItens.find(item => {
        if ($event.target.value && item.value === $event.target.id) {
          const val = this.valuation.find(valItem => valItem.value.toString() === ($event.target.value - 0.49).toString());
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

    this.opinarMotor = this.formOpinarCarro && this.utils.sanitizeText(this.formOpinarCarro.controls.opinarCombustivel.value) === 'el-trico'
      ? value : value.toFixed(1);
  }

  public chooseFuel() {
    let val: number;
    const currentEletric = this.isElectric;

    if (this.utils.sanitizeText(this.formOpinarCarro.controls.opinarCombustivel.value) === 'el-trico') {
      this.isElectric = true;
      val = 25;
    } else {
      this.isElectric = false;
      val = 1;
    }

    if (currentEletric !== this.isElectric) {
      this.changeOpinarMotor({detail: { value: val}});
    }
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

    const selectedCarVersion = this.formOpinarCarro.value.opinarVersao;
    const carFuel = this.formOpinarCarro.value.opinarCombustivel;
    const versionComplement = this.formOpinarCarro.value.opinarComplemento;
    const selectedGearBox = this.formOpinarCarro.value.opinarCambio;
    const selectedYearModel =  this.formOpinarCarro.value.opinarAnoModelo;
    const choosenVersion = selectedCarVersion !== 'anotherVersion'
      ? this.carVersions.find(v => v['_id'] === selectedCarVersion)
      : selectedCarVersion;

    const aboutCarData = {
      carBrand: {
        _id: this.selectedModel['brand']['_id'],
        name: this.selectedModel['brand']['name'],
        url: this.selectedModel['brand']['url'],
        active: this.selectedModel['brand']['active'],
        review: this.selectedModel['brand']['review']
      },
      carVersion: choosenVersion,
      carModel: {
        _id: this.selectedModel['_id'],
        name: this.selectedModel['name'],
        url: this.selectedModel['url'],
        generation: this.selectedModel['generation'],
        active: this.selectedModel['active'],
        review: this.selectedModel['review']
      },
      yearModel: selectedYearModel,
      engine: this.opinarMotor,
      fuel: carFuel,
      gearbox: selectedGearBox,
      complement: versionComplement,
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

    this.aboutCar.emit({aboutCar: aboutCarData, years: selectedCarVersion !== 'anotherVersion' ? choosenVersion.years : []});
    this.loadedVersions.emit(this.carVersions);
  }

  public autoFillInfo() {
    if (this.autoFill) {
      this.formOpinarCarro.controls.opinarAnoModelo.patchValue(this.autoFill['yearModel']);
      this.chooseYear(this.autoFill['yearModel']);

      this.formOpinarCarro.controls.opinarVersao.patchValue(this.autoFill['carVersion']['_id']);
      this.chooseVersion();

      if (this.newVersion) {
        this.formOpinarCarro.controls.opinarCombustivel.patchValue(this.autoFill['fuel']);
        this.formOpinarCarro.controls.opinarCambio.patchValue(this.autoFill['gearbox']);
        this.formOpinarCarro.controls.opinarComplemento.patchValue(this.autoFill['complement']);
        this.changeOpinarMotor({ detail: { value: parseFloat(this.autoFill['engine']) }});
      }
      this.formOpinarCarro.controls.opinarAnoCompra.patchValue(this.autoFill['yearBought']);

      this.formOpinarCarro.controls.opinarTitulo.patchValue(this.autoFill['finalWords']['title']);
      this.formOpinarCarro.controls.opinarPontosPositivos.patchValue(this.autoFill['finalWords']['positive']);
      this.formOpinarCarro.controls.opinarPontosNegativos.patchValue(this.autoFill['finalWords']['negative']);

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
