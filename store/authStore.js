import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import sqliteService from "../services/sqliteService";
import NetInfo from "@react-native-community/netinfo";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      // Check network connectivity
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        throw new Error("No internet connection. Please connect to the internet to register.");
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Save to SQLite for offline access
      await sqliteService.saveUserAuth(data.user, data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // Check network connectivity
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        throw new Error("No internet connection. Please connect to the internet to login.");
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Save to SQLite for offline access
      await sqliteService.saveUserAuth(data.user, data.token);

      set({ token: data.token, user: data.user, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    try {
      // First try AsyncStorage
      let token = await AsyncStorage.getItem("token");
      let userJson = await AsyncStorage.getItem("user");
      let user = userJson ? JSON.parse(userJson) : null;

      // If no data in AsyncStorage, try SQLite (offline persistence)
      if (!token || !user) {
        const sqliteAuth = await sqliteService.getUserAuth();
        if (sqliteAuth) {
          token = sqliteAuth.token;
          user = {
            id: sqliteAuth.user_id,
            username: sqliteAuth.username,
            email: sqliteAuth.email
          };
          
          // Sync back to AsyncStorage
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }
      }

      set({ token, user });
    } catch (error) {
      console.log("Auth check failed", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    // Clear AsyncStorage
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    
    // Clear SQLite
    await sqliteService.clearUserAuth();
    
    set({ token: null, user: null });
  },
}));
