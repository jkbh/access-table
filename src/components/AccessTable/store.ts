import { create } from "zustand/react";
import { User } from "../../data/user";
import { Role } from "./role";
import { devtools } from "zustand/middleware";

// interface Group {
//   id: string;
//   name: string;
// }

type tableStoreState = {
  users: {
    [key: string]: User;
  };
  groups: string[];
  //   groups: {
  //     [key: string]: Group;
  //   };
  roles: {
    [key: string]: Role;
  };
  hoveredRole: string | undefined;
};

type tableStoreAction = {
  setUser: (key: string, fn: (user: User) => User) => void;
  setUsers: (users: User[]) => void;
  //   setGroup: (key: string, fn: (user: Group) => Group) => void;
  //   setGroups: (users: Group[]) => void;
  setRole: (key: string, fn: (user: Role) => Role) => void;
  setRoles: (users: Role[]) => void;
  setHoveredRole: (role: string | undefined) => void;
};

export const tableStore = create<tableStoreState & tableStoreAction>()(
  devtools((set) => ({
    users: {},
    groups: [],
    roles: {},
    hoveredRole: undefined,
    setHoveredRole: (role) => set(() => ({ hoveredRole: role })),
    setUser: (key, fn) =>
      set((state) => ({
        users: {
          ...state.users,
          [key]: fn(state.users[key]),
        },
      })),
    setUsers: (users) =>
      set(() => {
        const newUsers = {} as tableStoreState["users"];
        users.forEach((user) => {
          newUsers[user.id] = user;
        });
        return { users: newUsers };
      }),
    // setGroup: (key, fn) =>
    //   set((state) => ({
    //     groups: {
    //       ...state.groups,
    //       [key]: fn(state.groups[key]),
    //     },
    //   })),
    // setGroups: (groups) =>
    //   set(() => {
    //     const newGroups = {} as tableStoreState["groups"];
    //     groups.forEach((group) => {
    //       newGroups[group.id] = group;
    //     });
    //     return { groups: newGroups };
    //   }),
    setRole: (key, fn) =>
      set((state) => ({
        roles: {
          ...state.roles,
          [key]: fn(state.roles[key]),
        },
      })),
    setRoles: (roles) =>
      set(() => {
        const newRoles = {} as tableStoreState["roles"];
        roles.forEach((role) => {
          newRoles[role.id] = role;
        });
        return { roles: newRoles };
      }),
  })),
);
