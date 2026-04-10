import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubjectFile } from '../models/file.models';
import { API } from '../constants/core.constants';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private http = inject(HttpClient);

  getAll(alias: string, subjectId: number): Observable<SubjectFile[]> {
    return this.http.get<SubjectFile[]>(`${API}/files/${alias}/${subjectId}`);
  }

  upload(alias: string, subjectId: number, file: File): Observable<{ id: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: number }>(`${API}/files/${alias}/${subjectId}`, form);
  }

  downloadUrl(alias: string, subjectId: number, fileId: number): string {
    return `${API}/files/${alias}/${subjectId}/${fileId}/download`;
  }

  downloadAllSubjectUrl(alias: string, subjectId: number): string {
    return `${API}/files/${alias}/subject/${subjectId}/download-all`;
  }

  downloadAllDirectionUrl(alias: string): string {
    return `${API}/files/${alias}/download-all`;
  }

  delete(alias: string, subjectId: number, fileId: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(`${API}/files/${alias}/${subjectId}/${fileId}`);
  }
}
