import { Component, OnInit } from '@angular/core';
import { Competition } from 'src/app/models/competition.model';
import { CompetitionService } from 'src/app/services/competition.service';

@Component({
  selector: 'app-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.sass']
})
export class CompetitionsComponent implements OnInit {

  public runningCompetitions: Competition[] = [];
  public attendedCompetitions: Competition[] = [];
  public pageIsReady: boolean = false;

  constructor(
    private competitionService: CompetitionService,
  ) { }

  ngOnInit(): void {
    this.competitionService.getRunningCompetitions().subscribe((com: Competition[]) => {
      this.runningCompetitions = com;
      this.competitionService.getCompetingCompetitions().subscribe((atCom: Competition[]) => {
        // if competition is running it's already listed as running, so we don't need it 
        // shown under previouly attended
        this.attendedCompetitions = atCom.filter(c => !this.runningCompetitions.map(co => co.id).includes(c.id));
        this.pageIsReady = true;
      })
    })
  }

}
