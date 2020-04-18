export interface Screener {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  verified: boolean;
  active: boolean;
}
