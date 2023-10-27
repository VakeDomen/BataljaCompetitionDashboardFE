import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-competition-card',
  templateUrl: './competition-card.component.html',
  styleUrls: ['./competition-card.component.sass']
})
export class CompetitionCardComponent implements OnChanges {

  @Input() public competition: Competition | undefined;

  public timeRemaining: string = "-- : --"

  constructor(
    private auth: AuthService
  ) { }

  ngOnChanges(): void {
    this.setTimeRemainingString()
    if (this.isCompetitionRunning()) {
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

  public hasTeamForCompetition(): boolean {
    if (!this.competition) {
      return false;
    }
    return this.auth.getState().hasTeamForCompetition(this.competition.id);
  }

  public isLogged(): boolean {
    return this.auth.isLoggedIn();
  }

  public isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  private isCompetitionRunning(): boolean {
    if (!this.competition) {
      return false;
    }

    const start = new Date(this.competition.start);
    const end = new Date(this.competition.end);
    const now = new Date();


    return now >= start && now <= end;
  }
  
  public calcNumOfTeams(): number {
    return 10;
  }
}
