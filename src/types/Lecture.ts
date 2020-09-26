export interface Lecture {
  subcourse: { id: number };
  instructor: { id: number };
  start: Date;
  duration: number;
}
