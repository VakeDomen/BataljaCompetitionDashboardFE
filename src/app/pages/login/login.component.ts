import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LocalCredentials } from 'src/app/models/login.credentials';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';
import { User } from 'src/app/models/user.model';
import { Team } from 'src/app/models/team.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  public credentials: LocalCredentials = {
    username: '',
    password: ''
  };
  
  @Output() loginSuccess = new EventEmitter();

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {}

  async login(): Promise<void> {
    const success: boolean = await this.auth.loginLocal(this.credentials);
    if (success) {
      this.toastr.success('Logged in!', 'Success');
      this.router.navigate(["competitions"]);
    } else {
      this.toastr.error('Oops, something went wrong!', 'Error');
    }
    this.loginSuccess.emit(success);
  }

}