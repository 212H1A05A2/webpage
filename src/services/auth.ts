export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

const AUTH_KEY = 'ox_sos_auth';

export const authService = {
  getAuthState(): AuthState {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.isAuthenticated && parsed.user) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return {
      isAuthenticated: false,
      user: null,
    };
  },

  signIn(email: string, _password: string, name?: string): { success: boolean; user: AuthUser } {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split('@')[0] || 'Player 1';
    
    const user: AuthUser = {
      id: 'user_' + Date.now().toString(36),
      email: cleanEmail,
      name: displayName,
      avatar: '🦊',
    };

    const state: AuthState = {
      isAuthenticated: true,
      user,
    };

    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    } catch {
      // Ignore
    }

    return { success: true, user };
  },

  signUp(email: string, password: string, name?: string): { success: boolean; user: AuthUser } {
    return this.signIn(email, password, name);
  },

  signOut(): void {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // Ignore
    }
  },
};
