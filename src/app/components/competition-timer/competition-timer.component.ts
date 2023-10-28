import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { CompetitionService } from 'src/app/services/competition.service';

@Component({
  selector: 'app-competition-timer',
  templateUrl: './competition-timer.component.html',
  styleUrls: ['./competition-timer.component.sass']
})
export class CompetitionTimerComponent implements OnChanges {

  @Input() public competition: Competition | undefined;

  private timerRunning: boolean = false;

  public timeRemaining: String = "-- : --";

  constructor(
    private competitionService: CompetitionService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.competition) {
      return;
    }
    if (this.competitionService.isCompetitionRunning(this.competition) && !this.timerRunning) {
      this.timerRunning = true;
      this.setTimeRemainingString()
      setInterval(() => this.setTimeRemainingString(), 1000);
    }
  }


  private setTimeRemainingString(): void {
    if (!this.competition) {
      this.timeRemaining = "-- : --";
      return
    }
    const end = new Date(this.competition.end);
    const now = new Date();
    if (now > end) {
      this.timeRemaining = "-- : --";
      return
    }
    let diff = end.getTime() - now.getTime(); // Difference in milliseconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);
    this.timeRemaining = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
  }


}
