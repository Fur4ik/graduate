import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
  id: number;
  name: string;
  email: string | null;
}

@Injectable({ providedIn: 'root' })
export class TeachersService {
  private readonly api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.api}/teachers`);
  }

  create(data: Omit<Teacher, 'id'>): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.api}/teachers`, data);
  }

  update(id: number, data: Partial<Omit<Teacher, 'id'>>): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.api}/teachers/${id}`, data);
  }

  delete(id: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(`${this.api}/teachers/${id}`);
  }
}