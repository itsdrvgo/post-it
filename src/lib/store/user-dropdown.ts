import { create } from "zustand";

interface UserDropdownState {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
}

export const useUserDropdownStore = create<UserDropdownState>((set) => ({
    isOpen: false,
    setIsOpen: (state) => set({ isOpen: state }),
}));
