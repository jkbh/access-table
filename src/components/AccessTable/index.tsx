import { useEffect, useRef, useState } from "react";
import {
  getAssignCount,
  makeUsers,
  User,
  AssignmentState,
} from "../../data/user";
import { getColumns } from "./columns";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

export default function AccessTable() {
  const [users, setUsers] = useState<User[]>(makeUsers(30, 100));

  // const [users, _] = useState<User[]>(makeUsers(30, 100));
  const groups = Object.keys(users[0].groupStates).sort(
    (a, b) => getAssignCount(b, users) - getAssignCount(a, users),
  );

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

  return (
    <div className="h-full overflow-auto overscroll-none rounded-lg border border-gray-300 shadow-sm">
      <table className="border-separate border-spacing-0 whitespace-nowrap">
        <thead>
          <tr className="align-bottom">
            {table.getLeftLeafHeaders().map((header, i) => (
              <th
                ref={thRefs[i]}
                key={header.id}
                className="sticky top-0 z-30 border-r border-b border-gray-300 bg-white text-left"
                style={{
                  left: thRefs[i].current ? header.column.getStart() + i : 0,
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
                    left: thRefs[i].current ? cell.column.getStart() + i : 0,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              {row.getCenterVisibleCells().map((cell) => (
                <td key={cell.id} className="border-r border-b border-gray-300">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
