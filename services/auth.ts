export interface UserSession {
  token: string;
  refreshToken: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<UserSession> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token",
          refreshToken: "dummy_refresh_token",
          user: { name: "Vincent N.", email: "vincent@nurofin.com", role: "CEO" }
        });
      }, 500);
    });
  },
  refresh: async (token: string): Promise<string> => {
    return Promise.resolve("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_dummy_token");
  },
  logout: async (): Promise<void> => {
    return Promise.resolve();
  }
};
