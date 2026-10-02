import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from './ToastContext';
import { firebaseGoogleLogin, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vk_token'));
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('wash_and_wow_token') || localStorage.getItem('vk_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('wash_and_wow_user', JSON.stringify(res.user));
            localStorage.setItem('vk_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout(false);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('wash_and_wow_token', res.token);
        localStorage.setItem('wash_and_wow_user', JSON.stringify(res.user));
        localStorage.setItem('vk_token', res.token);
        localStorage.setItem('vk_user', JSON.stringify(res.user));
        addToast(res.message || 'Login successful!', 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    }
  };

  const signup = async (formData) => {
    try {
      const res = await authAPI.signup(formData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('wash_and_wow_token', res.token);
        localStorage.setItem('wash_and_wow_user', JSON.stringify(res.user));
        localStorage.setItem('vk_token', res.token);
        localStorage.setItem('vk_user', JSON.stringify(res.user));
        addToast('Account created successfully! Welcome to JKM Dry Clean.', 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Signup failed.', 'error');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase Auth is not yet configured with your project API keys. Please update client/.env with your Firebase project credentials.');
      }

      // Real Firebase Google popup
      const result = await firebaseGoogleLogin();
      const firebaseUser = result.user;

      const payload = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        firebaseUid: firebaseUser.uid,
        avatar: firebaseUser.photoURL || '',
        phone: firebaseUser.phoneNumber || '',
      };

      const res = await authAPI.googleAuth(payload);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('wash_and_wow_token', res.token);
        localStorage.setItem('wash_and_wow_user', JSON.stringify(res.user));
        localStorage.setItem('vk_token', res.token);
        localStorage.setItem('vk_user', JSON.stringify(res.user));
        addToast(`Welcome, ${res.user.name}!`, 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Google sign-in failed.', 'error');
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('wash_and_wow_user', JSON.stringify(res.user));
        localStorage.setItem('vk_user', JSON.stringify(res.user));
        addToast('Profile updated successfully!', 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    }
  };

  const logout = (notify = true) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wash_and_wow_token');
    localStorage.removeItem('wash_and_wow_user');
    localStorage.removeItem('vk_token');
    localStorage.removeItem('vk_user');
    if (notify) {
      addToast('You have been logged out.', 'info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : 'guest',
        isAuthenticated: !!user,
        isAdmin: user ? user.role === 'admin' : false,
        loading,
        login,
        signup,
        loginWithGoogle,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
