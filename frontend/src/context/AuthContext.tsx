import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Household, Member, MemberMe, AuthResponse } from '../types';
import { api, getStoredToken, setStoredToken } from '../api/client';

export interface AuthContextType {
  token: string | null;
  member: Member | null;
  household: Household | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { nickname: string; pin?: string; invite_code?: string; household_id?: string }) => Promise<void>;
  join: (data: { invite_code: string; nickname: string; pin?: string }) => Promise<void>;
  createHousehold: (data: { name: string; timezone?: string; nickname: string; pin?: string }) => Promise<void>;
  logout: () => void;
  updateStatus: (status: 'active' | 'away', away_until?: string | null) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [member, setMember] = useState<Member | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = useCallback(async () => {
    try {
      const data: MemberMe = await api.getMe();
      setMember(data);
      setHousehold(data.household);
    } catch (err) {
      setStoredToken(null);
      setToken(null);
      setMember(null);
      setHousehold(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshMe();
    } else {
      setIsLoading(false);
    }
  }, [token, refreshMe]);

  const handleAuthSuccess = (res: AuthResponse) => {
    setStoredToken(res.access_token);
    setToken(res.access_token);
    setMember(res.member);
    setHousehold(res.household);
  };

  const login = async (data: { nickname: string; pin?: string; invite_code?: string; household_id?: string }) => {
    const res = await api.login(data);
    handleAuthSuccess(res);
  };

  const join = async (data: { invite_code: string; nickname: string; pin?: string }) => {
    const res = await api.joinHousehold(data);
    handleAuthSuccess(res);
  };

  const createHousehold = async (data: { name: string; timezone?: string; nickname: string; pin?: string }) => {
    const res = await api.createHousehold(data);
    handleAuthSuccess(res);
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setMember(null);
    setHousehold(null);
  };

  const updateStatus = async (status: 'active' | 'away', away_until?: string | null) => {
    const updated = await api.updateMyStatus({ status, away_until });
    setMember(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        member,
        household,
        isAuthenticated: !!token && !!member,
        isLoading,
        login,
        join,
        createHousehold,
        logout,
        updateStatus,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const defaultAuthContext: AuthContextType = {
  token: null,
  member: null,
  household: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  join: async () => {},
  createHousehold: async () => {},
  logout: () => {},
  updateStatus: async () => {},
  refreshMe: async () => {},
};

export function useAuthSafe(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}

