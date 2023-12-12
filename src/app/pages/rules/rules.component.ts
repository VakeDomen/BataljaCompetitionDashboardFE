import { Component, OnInit } from '@angular/core';
import { Gtag } from 'angular-gtag';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.sass']
})
export class RulesComponent implements OnInit {

  public pageIsReady: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.pageIsReady = true;
  }

}
