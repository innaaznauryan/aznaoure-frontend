import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCurrentUser } from "@/api/users.ts";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string
}

type SignInPromptReason = "favorites" | "cart";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signInPromptReason: SignInPromptReason | null;
  promptSignIn: (reason: SignInPromptReason) => void;
  closeSignInPrompt: () => void;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signInPromptReason, setSignInPromptReason] = useState<SignInPromptReason | null>(null);

  const promptSignIn = (reason: SignInPromptReason) => setSignInPromptReason(reason);
  const closeSignInPrompt = () => setSignInPromptReason(null);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const handleTokenUpdate = (event: Event) => {
      setToken((event as CustomEvent<string | null>).detail);
    };
    window.addEventListener('aznaoure:auth-token', handleTokenUpdate);
    return () => window.removeEventListener('aznaoure:auth-token', handleTokenUpdate);
  }, []);

  async function loadSession() {
    const storedToken = localStorage.getItem('aznaoure_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('aznaoure_token');
      localStorage.removeItem('aznaoure_refresh_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = (newToken: string, refreshToken: string, newUser: User) => {
    localStorage.setItem('aznaoure_token', newToken);
    if (refreshToken) {
      localStorage.setItem('aznaoure_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('aznaoure_refresh_token');
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('aznaoure_token');
    localStorage.removeItem('aznaoure_refresh_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      signInPromptReason,
      promptSignIn,
      closeSignInPrompt,
      login,
      logout,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};