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

  getAll(directionId: number, subjectId: number): Observable<SubjectFile[]> {
    return this.http.get<SubjectFile[]>(`${API}/files/${directionId}/${subjectId}`);
  }

  upload(directionId: number, subjectId: number, file: File): Observable<{ id: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: number }>(`${API}/files/${directionId}/${subjectId}`, form);
  }

  downloadUrl(directionId: number, subjectId: number, fileId: number): string {
    return `${API}/files/${directionId}/${subjectId}/${fileId}/download`;
  }

  downloadAllSubjectUrl(directionId: number, subjectId: number): string {
    return `${API}/files/${directionId}/subject/${subjectId}/download-all`;
  }

  downloadAllDirectionUrl(directionId: number): string {
    return `${API}/files/${directionId}/download-all`;
  }

  reportUrl(directionId: number): string {
    return `${API}/report/${directionId}`;
  }

  delete(directionId: number, subjectId: number, fileId: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(
      `${API}/files/${directionId}/${subjectId}/${fileId}`,
    );
  }
}
