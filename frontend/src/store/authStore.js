import { create } from "zustand";

const authStore = (set) => ({
  email: "",

  setEmail: ({ email }) =>
    set((state) => ({
      email: email ?? state.email,
    })),
});

const useAuthStore = create(authStore);
export default useAuthStore;
