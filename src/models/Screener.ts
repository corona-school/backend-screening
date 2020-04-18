export interface Screener {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  verified: boolean;
  active: boolean;
}

export interface ScreenerRequest {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
}

export interface IRawScreener {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  verified: boolean;
  active: boolean;
  passwordHash?: string;
}
