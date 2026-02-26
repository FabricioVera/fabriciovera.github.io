import type { ColumnDef } from "src/types/table";

interface TableHeaderProps<T> {
  columns: ColumnDef<T>[];
  className?: string;
}

export default function TableHeader<T>({
  columns,
  className = "",
}: TableHeaderProps<T>) {
  return (
    <thead>
      <tr>
        {columns.map((col, index) => (
          <th
            key={index}
            className={`${className} p-1 lg:p-3 border-r border-secondary`}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
