import { create } from "zustand";

export const useGroupStore = create((set, get) => ({
  allGroups: [],
  selectedGroup: null,
  openCreateGroupPopup: false,

  setOpenCreateGroupPopup: (openCreateGroupPopup) => {
    set({ openCreateGroupPopup });
  },

  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  getAllGroups: () => {},
}));
