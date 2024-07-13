import { create } from "zustand";

interface SidebarState {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: false,
    setIsOpen: (state) => set({ isOpen: state }),
}));
