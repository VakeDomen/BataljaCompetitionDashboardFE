import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
  ) { }


  public getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
