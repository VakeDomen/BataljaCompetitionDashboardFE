import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = environment.apiUrl + '/team';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  public getTeams(): Observable<Team[]> {
    return this.cache.getCached<Team[]>("/team");
  }

  public joinTeam(teamId: string): Observable<undefined> {
    this.cache.clearCache("/team");
    return this.http.post<undefined>(`${this.apiUrl}/team/join`, { team_id: teamId });
  }

  public kickPartner(teamId: string): Observable<undefined> {
    this.cache.clearCache("/team");
    return this.http.post<undefined>(`${this.apiUrl}/team/kick`, { team_id: teamId });
  }

  public leaveTeam(teamId: string): Observable<undefined> {
    this.cache.clearCache("/team");
    return this.http.post<undefined>(`${this.apiUrl}/team/leave`, { team_id: teamId });
  }


}
