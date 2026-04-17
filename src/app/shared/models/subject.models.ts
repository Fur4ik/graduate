export interface Subject {
  id: number;
  subject: string;
  statusId: number;
  statusName: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string | null;
}
