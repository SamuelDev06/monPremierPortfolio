import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('v2');
  protected readonly activeJourneyIndex = signal(0);
  protected readonly journeySteps = [
    {
      period: '2026 · EN COURS',
      title: 'Licence professionnelle',
      description: 'Réseaux et Génie Logiciel',
      place: 'Pigier CI · Antenne Yamoussoukro',
    },
    {
      period: 'SEPT. 2025 — JUIL. 2026',
      title: 'Informaticien développeur d’application',
      description: 'EBARRE-CI',
      place: '',
    },
    {
      period: '2024 — 2025',
      title: 'Licence 2e année',
      description: 'Réseaux et Génie Logiciel',
      place: 'Pigier CI · Antenne Yamoussoukro',
    },
  ];

  protected get journeyProgress(): number {
    return (this.activeJourneyIndex() / (this.journeySteps.length - 1)) * 100;
  }

  protected selectJourneyStep(index: number): void {
    this.activeJourneyIndex.set(index);
  }
}
