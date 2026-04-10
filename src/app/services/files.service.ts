import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubjectFile {
  id: number;
  subjectId: number;
  name: string;
  type: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(table: string, subjectId: number): Observable<SubjectFile[]> {
    return this.http.get<SubjectFile[]>(
      `${this.api}/files/${encodeURIComponent(table)}/${subjectId}`
    );
  }

  upload(table: string, subjectId: number, file: File): Observable<{ id: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: number }>(
      `${this.api}/files/${encodeURIComponent(table)}/${subjectId}`,
      form
    );
  }

  downloadUrl(table: string, subjectId: number, fileId: number): string {
    return `${this.api}/files/${encodeURIComponent(table)}/${subjectId}/${fileId}/download`;
  }

  delete(table: string, subjectId: number, fileId: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(
      `${this.api}/files/${encodeURIComponent(table)}/${subjectId}/${fileId}`
    );
  }
}