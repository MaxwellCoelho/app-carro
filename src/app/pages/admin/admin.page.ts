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
  public users: Array<any>;

  constructor(
    public customerService: CustomerService
  ) { }

  ngOnInit() { }

  public accordionChange($event): void {
    const value = $event && $event.detail && $event.detail.value;

    switch (value) {
      case 'roles':
        this.getRoles();
        break;
      case 'users':
        this.getUsers();
        break;
      case 'cars':
        this.getCars();
        break;
    }

    console.log(value);
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

  public getUsers(): void {
    console.log('users');
  }

  public getCars(): void {
    console.log('cars');
  }

  public deleteRole(roleId: string) {
    const subRoles = this.customerService.deleteRole(roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        console.log(res);
      },
      err => {
        console.error(err);
      }
    );
  }

}
