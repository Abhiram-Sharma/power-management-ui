import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TelemetryService } from '../services/telemetry.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  public latestTemperature: number = 0;
  public latestVoltage: number = 0;
  public isPruning: boolean = false;
  
  private maxDataPoints = 100;
  private telemetrySub?: Subscription;

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Temperature (°C)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(244, 63, 94)',
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(244, 63, 94)',
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y-axis-1',
        fill: true,
        tension: 0.4
      },
      {
        data: [],
        label: 'Active Synapses',
        backgroundColor: 'transparent',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(56, 189, 248)',
        pointBorderColor: 'transparent',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(56, 189, 248)',
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y-axis-2',
        tension: 0.4
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: {
            family: "'Inter', sans-serif",
            size: 13
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        display: false 
      },
      'y-axis-1': {
        position: 'left',
        grid: {
          color: 'rgba(244, 63, 94, 0.1)',
        },
        ticks: {
          color: 'rgb(244, 63, 94)',
          font: { family: "'Inter', sans-serif" }
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: 'rgb(244, 63, 94)',
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      },
      'y-axis-2': {
        position: 'right',
        grid: {
          drawOnChartArea: false, 
        },
        ticks: {
          color: 'rgb(56, 189, 248)',
          font: { family: "'Inter', sans-serif" }
        },
        title: {
          display: true,
          text: 'Active Synapses',
          color: 'rgb(56, 189, 248)',
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      }
    }
  };

  constructor(private telemetryService: TelemetryService) {}

  ngOnInit(): void {
    this.telemetrySub = this.telemetryService.telemetryData$.subscribe({
      next: (data) => {
        this.latestTemperature = data.temperature;
        this.latestVoltage = data.voltage;
        this.isPruning = data.is_pruning;

        const timeLabel = new Date(data.timestamp).toLocaleTimeString();
        
        this.lineChartData.labels?.push(timeLabel);
        this.lineChartData.datasets[0].data.push(data.temperature);
        this.lineChartData.datasets[1].data.push(data.active_synapses);

        if (this.lineChartData.labels && this.lineChartData.labels.length > this.maxDataPoints) {
          this.lineChartData.labels.shift();
          this.lineChartData.datasets[0].data.shift();
          this.lineChartData.datasets[1].data.shift();
        }

        this.lineChartData = { ...this.lineChartData };
      },
      error: (err) => console.error('Telemetry error:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.telemetrySub) {
      this.telemetrySub.unsubscribe();
    }
  }
}
