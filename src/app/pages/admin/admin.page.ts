import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  public nav = NAVIGATION;
  public roles: Array<any>;
  public users: Array<any>;;

  constructor(
    public customerService: CustomerService
  ) { }

  ngOnInit() {
    this.getRoles();
  }

  public getRoles(): void {
    const subRoles = this.customerService.getRoles().subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.roles = res.roles;
        console.log(this.roles);
      },
      err => {
        console.error(err);
      }
    );
  }

}
