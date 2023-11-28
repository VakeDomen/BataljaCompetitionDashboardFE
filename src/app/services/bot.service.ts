import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Bot } from '../models/bot.model';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class BotService {
  
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  public uploadNewBot(teamId: string, bot: File): Observable<Bot> {
    this.cache.clearCache(`/team/bots/${teamId}`);
    this.cache.clearCache("/team");
    const formData: FormData = new FormData();
    formData.append('team_id', teamId);
    formData.append('file', bot, bot.name);
    return this.http.post<Bot>(`${this.apiUrl}/bot/upload`, formData);
  }

  public getTeamBots(teamId: string): Observable<Bot[]> {
    return this.cache.getCached<Bot[]>(`/team/bots/${teamId}`);
  }

  public getBotsStats(teamId: string): Observable<Bot[]> {
    return this.cache.getCached<Bot[]>(`/bots/wr/${teamId}`);
  }

  public chageBot(compId: string, teamId: string, botSelector: "First" | "Second", botId: string): Observable<void> {
    this.cache.clearCache(`/team/bots/${teamId}`);
    this.cache.clearCache("/team");
    return this.http.post<void>(`${this.apiUrl}/team/bot`, {
      competition_id: compId,
      bot: botSelector,
      bot_id: botId,
    });
  }
}
