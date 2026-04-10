export interface Teacher {
  id: number;
  name: string;
  email: string | null;
}

export interface TeacherSubject {
  table_name: string;
  id: number;
  subject: string;
}
