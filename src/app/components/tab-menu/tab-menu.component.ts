import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Router, NavigationExtras } from '@angular/router';
import { SearchService } from 'src/app/services/search/search.service';

@Component({
  selector: 'app-tab-menu',
  templateUrl: './tab-menu.component.html',
  styleUrls: ['./tab-menu.component.scss'],
})
export class TabMenuComponent implements OnInit {

  public nav = NAVIGATION;
  public tabSelected: string;

  constructor(
    public utils: UtilsService,
    public router: Router,
    public searchService: SearchService
  ) { }

  ngOnInit() {}

  goToWithoutParams(url: string) {
    this.searchService.clearSearch();
    const params: NavigationExtras = { queryParams: { search: null }, queryParamsHandling: 'merge' };
    this.router.navigate([url], params);
  }
}
