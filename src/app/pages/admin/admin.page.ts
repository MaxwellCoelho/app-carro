import { Component, OnInit } from '@angular/core';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';
import { CustomerService } from 'src/app/services/customer.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  public nav = NAVIGATION;
  public roles: Array<any>;
  public users: Array<any>;

  public formRoles: FormGroup;

  constructor(
    public customerService: CustomerService,
    public fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  public initForm() {
    this.formRoles = this.fb.group({
      editRoleId: this.fb.control(''),
      newRoleName: this.fb.control('', [Validators.required]),
      newRoleLevel: this.fb.control('', [Validators.required])
    });
  }

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

  public createRole() {
    const roleId = this.formRoles.value.editRoleId;
    const data = {
      name: this.formRoles.value.newRoleName,
      level: this.formRoles.value.newRoleLevel
    };

    const subRoles = this.customerService.createRole(data, roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        console.log(res);
        this.formRoles.reset();
        this.getRoles();
      },
      err => {
        console.error(err);
      }
    );
    console.log(this.formRoles);
  }

  public editRole(role) {
    this.formRoles.reset({
      editRoleId: role['_id'],
      newRoleName: role.name,
      newRoleLevel: role.level
  });
    console.log(role);
  }

  public deleteRole(roleId: string) {
    const subRoles = this.customerService.deleteRole(roleId).subscribe(
      res => {
        if (!subRoles.closed) { subRoles.unsubscribe(); }
        this.getRoles();
        console.log(res);
      },
      err => {
        console.error(err);
      }
    );
  }

}
