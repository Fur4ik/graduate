import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher, TeacherSubject } from '../models/teacher.models';
import { API } from '../constants/core.constants';

@Injectable({
  providedIn: 'root',
})
export class TeachersService {
  private http = inject(HttpClient);

  getAll(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${API}/teachers`);
  }

  getSubjects(id: number): Observable<TeacherSubject[]> {
    return this.http.get<TeacherSubject[]>(`${API}/teachers/${id}/subjects`);
  }

  create(data: { name: string; email?: string }): Observable<Teacher> {
    return this.http.post<Teacher>(`${API}/teachers`, data);
  }

  update(id: number, data: { name?: string; email?: string | null }): Observable<Teacher> {
    return this.http.put<Teacher>(`${API}/teachers/${id}`, data);
  }

  delete(id: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(`${API}/teachers/${id}`);
  }
}
