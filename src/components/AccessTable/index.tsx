import { createContext, useEffect, useRef, useState } from "react";
import {
  makeUsers,
  User,
  AssignmentState,
  getGroupsSorted,
} from "../../data/user";
import { getColumns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import {
  calculateRoles,
  getRoleScore,
  removeRoleFromRoles,
  Role,
} from "./role";
import RoleButton from "./RoleButton";

// function to allow changed the original user state from inside the indivual cell renderers
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateAssigmentState: (
      rowIndex: number,
      columnId: string,
      value: AssignmentState,
    ) => void;
  }
}

interface RoleContext {
  roles: Map<string, Role>;
  hoveredRole: Role | undefined;
}

// context to be used in the cell renderers
export const RolesContext = createContext<RoleContext>({
  roles: new Map(),
  hoveredRole: undefined,
});

export default function AccessTable() {
  const [users, setUsers] = useState<User[]>(makeUsers(10, 50));
  const [hoveredRole, setHoveredRole] = useState<Role | undefined>(undefined);
  const [roles, setRoles] = useState<Map<string, Role>>(calculateRoles(users));

  function recalculateRoles() {
    setRoles(() => calculateRoles(users));
    setUsers((prevUsers) => {
      return prevUsers.map((user) => {
        return { ...user, roles: [] };
      });
    });
    console.log("recalculating roles");
  }

  const groups = getGroupsSorted(users);

  // setup state for each column definition, to trigger a rerender when the column size is set after the first render
  // i need this to calculate the correct pin position, without knowing the column widths initially
  const columns = getColumns(groups).map((column) => {
    const [col, setCol] = useState(column);
    return {
      columnDef: col,
      setColumn: setCol,
    };
  });

  const table = useReactTable({
    data: users,
    columns: columns.map((column) => column.columnDef),
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        left: ["id", "name"],
      },
    },
    meta: {
      updateAssigmentState: (rowIndex, columnId, value) => {
        setUsers((old) => {
          const user = old[rowIndex];
          const newUser: User = {
            ...user,
            groupStates: { ...user.groupStates, [columnId]: value },
          };
          return [
            ...old.slice(0, rowIndex),
            newUser,
            ...old.slice(rowIndex + 1),
          ];
        });
      },
    },
  });

  // setup references to cells to fetch rendered width
  const thRefs = table
    .getAllColumns()
    .map(() => useRef<HTMLTableCellElement>(null));

  // update columns sizes in the tanstack table state after the table has rendered
  useEffect(() => {
    const sizes = thRefs.map((ref) => ref.current?.clientWidth);
    columns.forEach(({ columnDef: c, setColumn }, i) => {
      setColumn({ ...c, size: sizes[i] });
    });
  }, []);

  function pushRole(role: Role) {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (role.users.includes(user.name)) {
          return {
            ...user,
            roles: [...user.roles, role.id],
          };
        }
        return user;
      }),
    );
    setRoles((r) => removeRoleFromRoles(role, r));
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-1 overflow-x-auto">
        <button
          onClick={recalculateRoles}
          className="cursor-pointer rounded bg-blue-500 text-white hover:bg-blue-300"
        >
          Recalculate Roles
        </button>
        {Array.from(roles.values())
          .sort((a, b) => getRoleScore(b) - getRoleScore(a))
          .map((role) => (
            <RoleButton
              key={role.id}
              role={role}
              onClick={() => pushRole(role)}
              onMouseEnter={() => setHoveredRole(() => role)}
              onMouseLeave={() => setHoveredRole(undefined)}
            />
          ))}
      </div>
      <div className="h-full overflow-auto overscroll-none rounded-lg border border-gray-300 shadow-sm">
        <RolesContext.Provider value={{ roles, hoveredRole }}>
          <table className="border-separate border-spacing-0 whitespace-nowrap">
            <thead>
              <tr className="align-bottom">
                {table.getLeftLeafHeaders().map((header, i) => (
                  <th
                    ref={thRefs[i]}
                    key={header.id}
                    className="sticky top-0 z-30 border-r border-b border-gray-300 bg-white text-left"
                    style={{
                      left: thRefs[i].current
                        ? header.column.getStart() + i
                        : 0,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
                {table.getCenterLeafHeaders().map((header, i) => (
                  <th
                    ref={thRefs[i + table.getLeftLeafHeaders().length]} // offset index to skip pinned column refs
                    key={header.id}
                    className="sticky top-0 z-20 border-r border-b border-gray-300 bg-white"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getLeftVisibleCells().map((cell, i) => (
                    <td
                      key={cell.id}
                      className="sticky z-10 border-r border-b border-gray-300 bg-white"
                      style={{
                        left: thRefs[i].current
                          ? cell.column.getStart() + i
                          : 0,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                  {row.getCenterVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-r border-b border-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </RolesContext.Provider>
      </div>
    </div>
  );
}
