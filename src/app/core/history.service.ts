import { Injectable, signal } from '@angular/core';
import { WorkoutEntry } from '../models/history.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private STORAGE_KEY = 'fitness-history';

  history = signal<WorkoutEntry[]>([]);

  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.history.set(JSON.parse(data));
    }
  }

  save(entry: WorkoutEntry) {
    const current = this.history();
    const updated = [...current, entry];

    this.history.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    console.log('HISTORY:', entry);
  }

  clear() {
    this.history.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}