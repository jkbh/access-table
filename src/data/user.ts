import { fakerDE } from "@faker-js/faker";

export interface User {
  id: string;
  name: string;
  groupStates: {
    [key: string]: AssignmentState;
  };
  roles: string[];
}

export type AssignmentState = "assigned" | "notAssigned" | "assumed";

export function makeUsers(numUsers: number, numGroups: number) {
  const groups = fakerDE.helpers.multiple(
    () => fakerDE.word.words({ count: { min: 1, max: 3 } }),
    {
      count: numGroups,
    },
  );

  const users: User[] = [];
  for (let i = 0; i < numUsers; i++)
    users.push({
      id: `u${fakerDE.string.numeric(6)}`,
      name: fakerDE.person.fullName(),
      groupStates: {},
      roles: [],
    });

  groups.forEach((group, i) => {
    users.forEach((user) => {
      user.groupStates[group] =
        Math.random() * numGroups > i ? "assigned" : "notAssigned";
    });
  });

  return users;
}

export function getAssignCount(group: string, users: User[]) {
  return users.filter((user) => user.groupStates[group] === "assigned").length;
}

export function getGroupsSorted(users: User[]) {
  return Object.keys(users[0].groupStates).sort(
    (a, b) => getAssignCount(b, users) - getAssignCount(a, users),
  );
}
