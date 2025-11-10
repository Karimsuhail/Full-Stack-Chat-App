import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in CheckAuth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully ✅");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed ❌");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully ✅ ");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed ❌");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket(); // ✅ disconnect before clearing user
      set({ authUser: null });
      toast.success("Logged out successfully ✅");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed ❌");
    }
  },

  updateProfile: async (profilePic) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", {
        profilePic: profilePic === null ? "" : profilePic,
      });

      set({ authUser: res.data.user });

      return {
        user: res.data.user,
        message: res.data.message || "Profile updated successfully",
      };
    } catch (error) {
      console.error("Error in updateProfile:", error);

      let errorMessage = "Update failed ❌";
      if (error.response?.status === 413) {
        errorMessage = "Image is too large. Please try a smaller image ❌";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { error: errorMessage };
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Correct socket connection logic
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
      transports: ["websocket"],
    });

    // ✅ Listen for online users update
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
