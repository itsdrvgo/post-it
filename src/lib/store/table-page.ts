import { create } from "zustand";

interface TablePageState {
    currentPage: number;
    setCurrentPage: (state: number) => void;
}

interface DynamicTablePageState {
    lastLoadedPage: number;
    setLastLoadedPage: (state: number) => void;
}

export const useTablePageStore = create<TablePageState>((set) => ({
    currentPage: 1,
    setCurrentPage: (state) => set({ currentPage: state }),
}));

export const useDynamicTablePageStore = create<DynamicTablePageState>(
    (set) => ({
        lastLoadedPage: 1,
        setLastLoadedPage: (state) => set({ lastLoadedPage: state }),
    })
);
