import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { Competition } from '../models/competition.model';
import { Observable } from 'rxjs';
import { Rounds } from '../models/competition.rounds';
import { CompetitionTeamCounts } from '../models/competition.team.count';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {

  private apiUrl = environment.apiUrl + '/competition';
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  public getCompetitionById(competitionId: string): Observable<Competition> {
    return this.cache.getCached<Competition>(`/competition/${competitionId}`);
  }

  public getCompetingCompetitions(): Observable<Competition[]> {
    return this.cache.getCached<Competition[]>(`/competition/attended`);
  }

  public getRunningCompetitions(): Observable<Competition[]> {
    return this.cache.getCached<Competition[]>(`/competition/running`);
  }

  public submitCompetition(competition: Competition): Observable<Competition[]> {
    this.cache.clearCache(`/competition/attended`)
    this.cache.clearCache(`/competition/running`)
    return this.http.post<Competition[]>(this.apiUrl, competition);
  }

  public competitionTeamCounts(): Observable<CompetitionTeamCounts> {
    return this.cache.getCached<CompetitionTeamCounts>(`/competition/team/count`);
  }

  public isCompetitionRunning(competition: Competition): boolean {
    if (!competition) {
      return false;
    }
    const start = new Date(competition.start);
    const end = new Date(competition.end);
    const now = new Date();
    return now >= start && now <= end;
  }

  public getRounds(teamId: string): Observable<Rounds> {
    return this.cache.getCached<Rounds>(`/competition/rounds/${teamId}`);
  }

  public downloadGamePack(competitionId: string): void {
    (window as any).location = `${this.apiUrl}/pack/${competitionId}`
  }
}
