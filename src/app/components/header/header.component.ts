import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router, NavigationExtras } from '@angular/router';
import { SearchService } from 'src/app/services/search/search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Output() clickedItem = new EventEmitter<any>();

  public nav = NAVIGATION;

  constructor(
    public utils: UtilsService,
    public router: Router,
    public searchService: SearchService
  ) { }

  ngOnInit() {}

  public clickItem(itemRoute): void {
    this.clickedItem.emit(itemRoute);
  }

  goToWithoutParams(url: string) {
    this.searchService.clearSearch();
    const params: NavigationExtras = { queryParams: { brand: null, search: null }, queryParamsHandling: 'merge' };
    this.router.navigate([url], params);
  }
}
