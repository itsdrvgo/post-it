import { create } from "zustand";

interface TablePageState {
    currentPage: number;
    setCurrentPage: (state: number) => void;
}

export const useTablePageStore = create<TablePageState>((set) => ({
    currentPage: 1,
    setCurrentPage: (state) => set({ currentPage: state }),
}));
