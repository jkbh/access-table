import { useEffect, useRef, useState } from "react";
import { getAssignCount, makeUsers, User } from "../data/user";
import { getColumns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function AccessTable() {
  const [users, _] = useState<User[]>(makeUsers(30, 100));
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
    columns.forEach(({ columnDef: prevCol, setColumn }, i) => {
      setColumn({ ...prevCol, size: sizes[i] });
    });
  }, []);

  return (
    <table className="whitespace-nowrap">
      <thead>
        <tr className="align-bottom">
          {table.getLeftLeafHeaders().map((header, i) => (
            <th
              ref={thRefs[i]}
              key={header.id}
              className="sticky top-0 z-30 border border-gray-300 bg-white text-left"
              style={{ left: header.column.getStart() }}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
          {table.getCenterLeafHeaders().map((header, i) => (
            <th
              ref={thRefs[i + table.getLeftLeafHeaders().length]} // offset index to skip pinned column refs
              key={header.id}
              className="sticky top-0 z-20 border border-gray-300 bg-white"
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getLeftVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className="sticky z-10 border border-gray-300 bg-white"
                style={{ left: cell.column.getStart() }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
            {row.getCenterVisibleCells().map((cell) => (
              <td key={cell.id} className="border border-gray-300">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
