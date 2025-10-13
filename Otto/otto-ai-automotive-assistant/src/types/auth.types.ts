export type UserCredentials = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserPayload = {
  id: string;
  email: string;
  role: string;
};