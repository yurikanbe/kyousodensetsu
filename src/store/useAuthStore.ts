"use client";
import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  addCoins: (amount) =>
    set((state) => ({
      user: state.user ? { ...state.user, coins: state.user.coins + amount } : null,
    })),
  addXp: (amount) =>
    set((state) => {
      if (!state.user) return {};
      const newXp = state.user.xp + amount;
      const newXpToNext = state.user.xpToNext;
      if (newXp >= newXpToNext) {
        return {
          user: {
            ...state.user,
            xp: newXp - newXpToNext,
            xpToNext: Math.floor(newXpToNext * 1.5),
            level: state.user.level + 1,
          },
        };
      }
      return { user: { ...state.user, xp: newXp } };
    }),
}));
