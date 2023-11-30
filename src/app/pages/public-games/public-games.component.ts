import { Component, OnInit } from '@angular/core';
import { Game2v2 } from 'src/app/models/game.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-public-games',
  templateUrl: './public-games.component.html',
  styleUrls: ['./public-games.component.sass']
})
export class PublicGamesComponent implements OnInit {
  public pageIsReady: boolean = false;
  public games: Game2v2[] = [];

  constructor(
    private gameService: GameService,
  ) { }

  ngOnInit(): void {
    this.gameService.getPublicGames().subscribe((games: Game2v2[]) => {
      console.log(games);
      this.games = games;
      this.pageIsReady = true;
    })
  }


}
