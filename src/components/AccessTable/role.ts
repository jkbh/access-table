import { faker } from "@faker-js/faker";
import { User } from "../../data/user";

export interface Role {
  id: string;
  color: string;
  groups: string[];
  users: string[];
  used: boolean;
}

export function calculateRoles(users: User[]) {
  const groupToRole: Map<string, Role> = new Map();

  for (const user of users) {
    const userGroups = Array.from(
      Object.entries(user.groupStates)
        .filter(
          ([_, assigned]) => assigned === "assigned" || assigned === "assumed",
        )
        .map(([group, _]) => group),
    );
    for (const group of userGroups) {
      if (!groupToRole.has(group)) {
        faker.seed(stringToHash(group));
        groupToRole.set(group, {
          id: group,
          color: faker.color.rgb(),
          groups: [...userGroups],
          users: [user.name],
          used: false,
        });
      } else {
        const intersection = groupToRole
          .get(group)!
          .groups.filter((g) => userGroups.includes(g));
        groupToRole.get(group)!.groups = intersection;
        groupToRole.get(group)!.users.push(user.name);
      }
    }
  }

  const unique: Role[] = [];
  for (const role of groupToRole.values()) {
    if (
      !unique.some((seenRole) => {
        const seenSet = new Set(seenRole.groups);
        const candidateSet = new Set(role.groups);
        return (
          seenSet.size === candidateSet.size &&
          [...seenSet].every((group) => candidateSet.has(group))
        );
      })
    ) {
      unique.push(role);
    }
  }
  const uniqueMap = new Map<string, Role>();
  for (const role of unique) {
    uniqueMap.set(role.id, role);
  }

  return uniqueMap;
}

export function removeRoleFromRoles(role: Role, roles: Map<string, Role>) {
  const newRoles = new Map(roles);
  newRoles.set(role.id, {
    ...role,
    used: true,
  });
  newRoles.forEach((value) => {
    if (!value.used) {
      value.groups = value.groups.filter((g) => !role.groups.includes(g));
    }
    if (value.groups.length <= 1) {
      newRoles.delete(value.id);
    }
  });
  return newRoles;
}

function stringToHash(string: string) {
  return string.split("").reduce((hash, char) => {
    return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
  }, 0);
}

export function getRoleScore(role: Role) {
  return role.groups.length * role.users.length ** 2;
}
