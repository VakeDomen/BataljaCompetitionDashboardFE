import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.sass']
})
export class RankingsComponent implements OnInit {

  public pageIsReady: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.pageIsReady = true;
  }

}
