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
    console.log("DESTROY!")
    console.log(this.intervals)
    const id1: any = this.intervals.shift();
    console.log(this.intervals)
    window.cancelAnimationFrame(id1.fr);
    for (let interval of this.intervals) {
      console.log("clearing", interval)
      while (interval) {
        window.clearInterval(interval);
        interval--;
      }
    }
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
    this.intervals = (window as any).initializeGame("canvas", data, "file");
  }
}
