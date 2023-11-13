import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.sass']  
})
export class GameCanvasComponent implements AfterViewInit {

  constructor(
    private http: HttpClient,  
  ) { }

  ngAfterViewInit(): void {
    // Assuming the init function is available in the global scope
    // because of the gameLogic.js being included in the scripts array of angular.json
    this.loadLogFile()
  }

  loadLogFile() {
    // Adjust the path based on the location of your log.txt file in the assets folder
    const logFilePath = 'assets/log.txt';

    this.http.get(logFilePath, { responseType: 'text' }).subscribe(
      (data) => {
        (window as any).initializeGame("canvas", data, "file");
      },
      (error) => {
        console.error('Error loading log file:', error);
      }
    );
  }
}
