import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, Input, OnChanges, OnInit } from '@angular/core';
import { CacheService } from 'src/app/services/cache.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.sass']  
})
export class GameCanvasComponent implements OnInit, OnChanges {

  @Input() public gameId: string = ""
  private apiUrl = environment.apiUrl;


  constructor(
    private http: HttpClient,  
  ) { }
  ngOnInit(): void {
    this.loadLogFile()
  }

  ngOnChanges(): void {
    // Assuming the init function is available in the global scope
    // because of the gameLogic.js being included in the scripts array of angular.json
    this.loadLogFile()
  }

  loadLogFile() {
    // Adjust the path based on the location of your log.txt file in the assets folder
    const logFilePath = 'assets/log.txt';

    if (!this.gameId) {
      this.http.get(logFilePath, { responseType: 'text' }).subscribe(
        (data) => {
          (window as any).initializeGame("canvas", data, "file");
        },
        (error) => {
          console.error('Error loading log file:', error);
        }
      );
    } else {
      this.http.get(`${this.apiUrl}/game/log/${this.gameId}`, { responseType: 'text' }).subscribe(
        (data) => {
          (window as any).initializeGame("canvas", data, "file");
        },
        (error) => {
          console.error('Error loading log file:', error);
        }
      )
    }

  }
}
