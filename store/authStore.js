import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import asyncStorageOfflineService from "../services/asyncStorageOfflineService";
import NetInfo from "@react-native-community/netinfo";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (email, password, completeName, agency, position, contactNumber) => {
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
          email,
          password,
          completeName,
          agency,
          position,
          contactNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Save to AsyncStorage for offline access
      await asyncStorageOfflineService.saveAuthData({
        ...data.user,
        token: data.token
      });

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

      // Save to AsyncStorage for offline access
      await asyncStorageOfflineService.saveAuthData({
        ...data.user,
        token: data.token
      });

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

      // If no data in AsyncStorage, try AsyncStorage service (offline persistence)
      if (!token || !user) {
        const authData = await asyncStorageOfflineService.getAuthData();
        if (authData) {
          token = authData.token;
          user = {
            id: authData.id,
            email: authData.email,
            completeName: authData.completeName,
            agency: authData.agency,
            position: authData.position,
            contactNumber: authData.contactNumber,
            role: authData.role,
            status: authData.status,
            profileImage: authData.profileImage,
            createdAt: authData.createdAt
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
    
    // Clear AsyncStorage service
    await asyncStorageOfflineService.clearAuthData();
    
    set({ token: null, user: null });
  },

  updateUser: async (userData) => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to update profile");

      // Update local storage
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      
      // Update AsyncStorage service
      await asyncStorageOfflineService.saveAuthData({
        ...data.user,
        token
      });

      set({ user: data.user });

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
}));
