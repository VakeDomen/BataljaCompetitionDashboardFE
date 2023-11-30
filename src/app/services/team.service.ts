import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { environment } from 'src/environments/environment';
import { lastValueFrom, Observable } from 'rxjs';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  

  private apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  public getTeams(): Observable<Team[]> {
    return this.cache.getCached<Team[]>("/team");
  }
  
  public getAllTeams(competitionId: string): Observable<Team[]> {
    return this.cache.getCached<Team[]>(`/team/all/${competitionId}`);
  }

  public createTeam(owner: string, competitionId: string): Observable<Team> {
    this.cache.clearCache("/team");
    return this.http.post<Team>(`${this.apiUrl}/team`, { owner: owner, competition_id: competitionId });
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

  public disbandTeam(teamId: string): Observable<undefined> {
    this.cache.clearCache("/team");
    return this.http.post<undefined>(`${this.apiUrl}/team/disband`, { team_id: teamId });
  }

  public async hasTeamForCompetition(id: string): Promise<boolean> {
    const teams = await lastValueFrom(this.getTeams())
    return !!teams.filter((t: Team) => t.competition_id == id).length
  }
}
