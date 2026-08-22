import React, { createContext, useState, useEffect, useCallback } from 'react';
import { googleLogin, fetchCurrentUser, logoutUser } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rakthalink_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('rakthalink_token');
      if (storedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            setDonorProfile(res.data.donorProfile || null);
          } else {
            logout();
          }
        } catch (error) {
          console.error('[AUTH RESTORE FAILED]:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle Google Login Callback
  const loginWithGoogleToken = async (credential) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await googleLogin(credential);
      if (res.success && res.data) {
        const { token: appToken, user: appUser, donorProfile: appDonorProfile, isNewUser } = res.data;

        // Store token in browser local storage
        localStorage.setItem('rakthalink_token', appToken);
        setToken(appToken);
        setUser(appUser);
        setDonorProfile(appDonorProfile || null);

        setIsLoading(false);
        return { success: true, isNewUser, user: appUser };
      } else {
        throw new Error(res.message || 'Authentication failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to authenticate with Google';
      setAuthError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignore
    } finally {
      localStorage.removeItem('rakthalink_token');
      localStorage.removeItem('rakthalink_user');
      setToken(null);
      setUser(null);
      setDonorProfile(null);
      setAuthError(null);
    }
  };

  // Update live user profile state (e.g. after editing profile or changing availability)
  const updateUserProfile = (updatedUser, updatedDonorProfile = null) => {
    if (updatedUser) setUser(updatedUser);
    if (updatedDonorProfile !== null) setDonorProfile(updatedDonorProfile);
  };

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      if (res.success && res.data) {
        setUser(res.data.user);
        setDonorProfile(res.data.donorProfile || null);
      }
    } catch (error) {
      console.error('[REFRESH USER ERROR]:', error);
    }
  }, []);

  const value = {
    user,
    donorProfile,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    authError,
    setAuthError,
    loginWithGoogleToken,
    logout,
    updateUserProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
