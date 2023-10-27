import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { Competition } from '../models/competition.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = environment.apiUrl + '/competition';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }


  public getCompetingCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.apiUrl + "/attended");
  }

  public getRunningCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.apiUrl + "/running");
  }

  public submitCompetition(competition: Competition): Observable<Competition[]> {
    return this.http.post<Competition[]>(this.apiUrl, competition);
  }
}
