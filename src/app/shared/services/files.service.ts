import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubjectFile {
  id: number;
  subjectId: number;
  name: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(alias: string, subjectId: number): Observable<SubjectFile[]> {
    return this.http.get<SubjectFile[]>(`${this.api}/files/${alias}/${subjectId}`);
  }

  upload(alias: string, subjectId: number, file: File): Observable<{ id: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ id: number }>(`${this.api}/files/${alias}/${subjectId}`, form);
  }

  downloadUrl(alias: string, subjectId: number, fileId: number): string {
    return `${this.api}/files/${alias}/${subjectId}/${fileId}/download`;
  }

  delete(alias: string, subjectId: number, fileId: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(
      `${this.api}/files/${alias}/${subjectId}/${fileId}`,
    );
  }
}
