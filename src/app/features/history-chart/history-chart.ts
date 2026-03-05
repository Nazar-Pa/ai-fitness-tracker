import { AfterViewInit, Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  Title,
  Filler
} from 'chart.js';
import { HistoryService } from '../../core/history.service';
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  Title,
  Filler
);

@Component({
  selector: 'app-history-chart',
  imports: [],
  templateUrl: './history-chart.html',
  styleUrl: './history-chart.scss',
})
export class HistoryChart implements AfterViewInit {
  @ViewChild('chartCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  historyService = inject(HistoryService);
  chart!: Chart;
  data!: any;

  constructor() {
    effect(() => {
            this.data = this.historyService.history();
      console.log('HISTORY 2:', this.data);
      // if (this.canvas) {
      // const data = this.historyService.history();
      // console.log('HISTORY 2:', data);
      // this.renderChart(data);
      // }
    });
  }

  ngAfterViewInit() {
    this.renderChart(this.data);
    // effect(() => {
    //   const data = this.historyService.history();
    //   this.renderChart(data);
    // });
  }

 renderChart(data: any[]) {
  if (this.chart) this.chart.destroy();

  const ctx = this.canvas.nativeElement.getContext('2d')!;

  // 🎨 Gradients
  const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
  gradient1.addColorStop(0, 'rgba(75, 192, 192, 0.5)');
  gradient1.addColorStop(1, 'rgba(75, 192, 192, 0)');

  const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
  gradient2.addColorStop(0, 'rgba(153, 102, 255, 0.5)');
  gradient2.addColorStop(1, 'rgba(153, 102, 255, 0)');

  const gradient3 = ctx.createLinearGradient(0, 0, 0, 300);
  gradient3.addColorStop(0, 'rgba(255, 159, 64, 0.5)');
  gradient3.addColorStop(1, 'rgba(255, 159, 64, 0)');

  const labels = data.map(d =>
    new Date(d.date).toLocaleDateString()
  );

  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Squats',
          data: data.map(d => d.squat),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: gradient1,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        },
        {
          label: 'Push-ups',
          data: data.map(d => d.pushup),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: gradient2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        },
        {
          label: 'Jumping Jacks',
          data: data.map(d => d.jumpingjack),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: gradient3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        title: {
          display: true,
          text: 'Workout Progress Over Time',
          font: { size: 18 }
        },

        legend: {
          position: 'top',
        },

        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },

      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },

      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Reps',
          },
          beginAtZero: true,
        },
      },
    },
  });
}
}
