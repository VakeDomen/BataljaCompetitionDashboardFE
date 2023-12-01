import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { Observable } from 'rxjs';
import { Game2v2 } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  private apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private cache: CacheService,
  ) { }

  public getGameById(gameId: string): Observable<Game2v2> {
    return this.cache.getCached<Game2v2>(`/game/${gameId}`);
  }

  public getPublicGames(): Observable<Game2v2[]> {
    return this.cache.getCached<Game2v2[]>("/game/public")
  }

  public toggleGamePublic(gameId: string): Observable<undefined> {
    return this.http.post<undefined>(`${this.apiUrl}/game/public/${gameId}`, {});
  }
}
