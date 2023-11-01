import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalCredentials } from '../models/login.credentials';
import { CacheService } from './cache.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private token = 'JWTtoken';
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private cache: CacheService,
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
    const val = sessionStorage.getItem("isAdmin");
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
    // this.state.resetState();
    this.cache.clearCache();
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
    } catch (error) {
      console.log("Error logging in: ", error)
      return false;
    }
    return true;
  }

  // public getState(): State {
  //   return this.state;
  // }



}

// class State {

//   private me: User | undefined;
//   private myTeams: Team[] = [];

//   constructor() { }
  
//   public resetState(): void {
//     this.me = undefined;
//     this.myTeams = [];
//   }

//   public setMe(me: User) {
//     this.me = me;
//   }

//   public setTeams(teams: Team[]): void {
//     this.myTeams = teams;
//   }

//   public hasTeamForCompetition(comId: string): boolean {
//     return !!this.myTeams.filter((t: Team) => t.competition_id == comId).length
//   }

//   public getMyId(): string | undefined {
//     return this.me?.id;
//   }    
// }
