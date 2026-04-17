export interface Teacher {
  id: number;
  name: string;
  email: string | null;
}

export interface TeacherSubject {
  direction_id: number;
  id: number;
  subject: string;
}
