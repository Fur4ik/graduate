import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
  id: number;
  name: string;
  email: string | null;
}

@Injectable({ providedIn: 'root' })
export class TeachersService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api';

  getAll(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.api}/teachers`);
  }
}
