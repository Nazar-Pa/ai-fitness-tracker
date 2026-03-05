import { Component, signal } from '@angular/core';
import { Workout } from './features/workout/workout';
import { HistoryChart } from './features/history-chart/history-chart';

@Component({
  selector: 'app-root',
  imports: [Workout, HistoryChart],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ai-fitness-app');
}
