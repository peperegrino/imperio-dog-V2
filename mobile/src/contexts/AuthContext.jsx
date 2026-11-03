import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, ROLE_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../services/api';

const AuthContext = createContext(null);

function getLoginDetails(response) {
  const payload = response?.data ?? response;
  const user = payload?.user ?? payload?.usuario;
  const token = payload?.token ?? payload?.accessToken ?? payload?.access_token;
  const roleValue = payload?.role ?? user?.role;
  const role = Array.isArray(roleValue) ? roleValue[0] : roleValue;

  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('A resposta do servidor não contém um token de acesso.');
  }

  if (typeof role !== 'string') {
    throw new Error('A resposta do servidor não contém o perfil do usuário.');
  }

  const normalizedRole = role.trim().toUpperCase().replace(/^ROLE_/, '');
  if (normalizedRole === 'ADMIN') {
    return { token: token.trim(), role: 'ADMIN' };
  }

  if (['USER', 'TUTOR', 'CLIENT', 'CUSTOMER'].includes(normalizedRole)) {
    return { token: token.trim(), role: normalizedRole };
  }

  throw new Error('O perfil retornado pelo servidor não é reconhecido.');
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const [token, role] = await AsyncStorage.multiGet([TOKEN_STORAGE_KEY, ROLE_STORAGE_KEY])
          .then((entries) => entries.map(([, value]) => value));

        if (token && ['ADMIN', 'USER', 'TUTOR', 'CLIENT', 'CUSTOMER'].includes(role)) {
          if (active) {
            setSession({ token, role });
          }
        } else if (token || role) {
          await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, ROLE_STORAGE_KEY]);
        }
      } catch (error) {
        if (active) {
          setInitializationError(error);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const nextSession = getLoginDetails(response);

    try {
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, nextSession.token],
        [ROLE_STORAGE_KEY, nextSession.role],
      ]);
    } catch (error) {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, ROLE_STORAGE_KEY]);
      throw error;
    }

    setSession(nextSession);
    return nextSession;
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, ROLE_STORAGE_KEY]);
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    session,
    isLoading,
    initializationError,
    signIn,
    signOut,
  }), [session, isLoading, initializationError, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
