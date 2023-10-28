import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.sass']
})
export class TeamComponent implements OnInit {

  public pageIsReady: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.pageIsReady = true;
  }
}
