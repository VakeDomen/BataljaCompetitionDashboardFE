import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.sass']  
})
export class GameCanvasComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Assuming the init function is available in the global scope
    // because of the gameLogic.js being included in the scripts array of angular.json
    (window as any).init();
  }

}
