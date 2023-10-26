import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalCredentials } from '../models/login.credentials';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/login';
  private token = 'JWTtoken';
  private userString = 'user';
  private isAdminString = 'isAdmin';
 
  constructor(
    private http: HttpClient,
    private router: Router,
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
        this.apiUrl, 
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
    } catch (error) {
      console.log("Error logging in: ", error)
      return false;
    }
    return true;
  }
}