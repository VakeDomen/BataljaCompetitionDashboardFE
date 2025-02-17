import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, Input, OnChanges, OnInit } from '@angular/core';
import { CacheService } from 'src/app/services/cache.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.sass']  
})
export class GameCanvasComponent implements OnInit {

  @Input() public gameId: string = ""
  private apiUrl = environment.apiUrl;
  private intervals: any[] = [];

  constructor(
    private http: HttpClient,  
  ) { }
  ngOnInit(): void {
    this.loadLogFile()
  }

  ngOnDestroy(): void {
    (window as any).endGame()
  }

  loadLogFile() {
    // Adjust the path based on the location of your log.txt file in the assets folder
    const logFilePath = 'assets/log.txt';
    let req;
    if (!this.gameId) {
      req = this.http.get(logFilePath, { responseType: 'text' })
    } else {
      req = this.http.get(`${this.apiUrl}/game/log/${this.gameId}`, { responseType: 'text' })
    }
    req.subscribe(
      this.runGame,
      this.runGameError
    );
  }

  runGameError = (error: any) => {
    console.error('Error loading log file:', error);
  }

  runGame = (data: string) => {

    let lines = data.split("\n");
    let parsed_data = lines[lines.length - 5 - 1];
    console.log(lines);
    console.log(parsed_data);

    
    (window as any).loadGameTurns(parsed_data);
  }
}
