import { createContext } from "react";
import { Role } from "./role";

interface RolesContext {
  roles: Map<string, Role>;
  hoveredRole: Role | undefined;
}

// context to be used in the cell renderers
export const RolesContext = createContext<RolesContext>({
  roles: new Map(),
  hoveredRole: undefined,
});
