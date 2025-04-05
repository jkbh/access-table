import { useEffect, useRef, useState } from "react";
import { getAssignCount, makeUsers, User } from "../data/user";
import { getColumns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function AccessTable() {
  const [users, setUsers] = useState<User[]>(makeUsers(30, 100));
  const groups = Object.keys(users[0].groupStates).sort(
    (a, b) => getAssignCount(b, users) - getAssignCount(a, users)
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
    <table style={{ whiteSpace: "nowrap", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {table.getLeftLeafHeaders().map((header, i) => (
            <th
              ref={thRefs[i]}
              key={header.id}
              style={{
                verticalAlign: "bottom",
                position: "sticky",
                top: 0,
                left: header.column.getStart(),
                backgroundColor: "white",
                zIndex: 3,
              }}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
          {table.getCenterLeafHeaders().map((header, i) => (
            <th
              ref={thRefs[i + table.getLeftLeafHeaders().length]} // offset index to skip pinned column refs
              key={header.id}
              style={{
                verticalAlign: "bottom",
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 2,
              }}
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
                style={{
                  position: "sticky",
                  left: cell.column.getStart(),
                  zIndex: 1,
                  backgroundColor: "white",
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
            {row.getCenterVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
