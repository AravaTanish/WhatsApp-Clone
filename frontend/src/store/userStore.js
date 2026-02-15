import { create } from "zustand";

const userStore = (set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (value) => set({ loading: value }),
  clearUser: () => set({ user: null, loading: false }),
});

const useUserStore = create(userStore);
export default useUserStore;
