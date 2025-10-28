export interface IAuthResponse {
    accessToken: string;
    expiresAt: Date;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
  