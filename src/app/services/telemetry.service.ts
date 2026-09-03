import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, EMPTY } from 'rxjs';
import { retry, throttleTime, catchError } from 'rxjs/operators';
import { TelemetryData } from '../models/telemetry-data.model';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private socket$: WebSocketSubject<TelemetryData>;
  public telemetryData$: Observable<TelemetryData>;

  constructor() {
    this.socket$ = webSocket('ws://localhost:8000/ws/telemetry');
    
    this.telemetryData$ = this.socket$.asObservable().pipe(
      throttleTime(50),
      retry({
        delay: () => timer(2000)
      }),
      catchError(error => {
        console.error('WebSocket error:', error);
        return EMPTY;
      })
    );
  }
}
