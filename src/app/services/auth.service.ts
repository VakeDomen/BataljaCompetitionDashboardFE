import { Injectable, getModuleFactory } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalCredentials } from '../models/login.credentials';
import { User } from '../models/user.model';
import { StateService } from './state.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private token = 'JWTtoken';
  private isAdminString = 'isAdmin';
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private state: StateService
  ) { }

  isLoggedIn(): boolean {
    if (!sessionStorage.getItem(this.token)) {
      return false;
    }
    return true;
  }

  isAdmin(): boolean {
    if (!this.isLoggedIn()) {
      return false;
    }
    const val = sessionStorage.getItem(this.isAdminString);
    if (!val) {
      return false;
    }
    return val == 'true' ? true : false;
  }

  getJWTtoken(): string | null {
    return sessionStorage.getItem(this.token);
  }

  logout(): void {
    sessionStorage.removeItem(this.token);
    this.router.navigate(['/login'])
  }

  async loginLocal(credentials: LocalCredentials): Promise<boolean> {
    try {
      const response: String | undefined = await this.http.post<string>(
        this.apiUrl + '/login', 
        credentials,
        { responseType: 'text' as 'json' }
      ).toPromise();

      if (!response) {
        console.log("No resp from BE");
        return false;
      }
      sessionStorage.setItem(
        this.token, 
        `Bearer ${response}`
      );

      this.getMe();
    } catch (error) {
      console.log("Error logging in: ", error)
      return false;
    }
    return true;
  }

  private getMe() {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe((me: User) => {
      this.state.setMe(me);
    })
  }
}