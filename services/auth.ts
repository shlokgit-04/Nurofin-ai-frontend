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
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!res.ok) {
      throw new Error('Invalid email or password');
    }

    const data = await res.json();
    const token = data.data.access_token;
    const user = data.data.user;

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }

    return {
      token,
      refreshToken: "dummy_refresh_token",
      user: {
        name: user.full_name || "User",
        email: user.email,
        role: user.role || "Member"
      }
    };
  },
  refresh: async (token: string): Promise<string> => {
    return Promise.resolve("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_dummy_token");
  },
  logout: async (): Promise<void> => {
    return Promise.resolve();
  }
};
