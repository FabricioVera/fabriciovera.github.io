import type { Warframe } from "src/types/warframe";
import { hasIntersection, haveSameElements } from "../../../utils/array";
import type { ColumnDef } from "src/types/table";

interface TableCellProps<T> {
  guess: T;
  target: T;
  columnDef: ColumnDef<T>;
}

export default function TableCell<T>({
  guess,
  target,
  columnDef,
}: TableCellProps<T>) {
  const customClass = columnDef.getCellClass
    ? columnDef.getCellClass(guess, target)
    : "";

  return (
    <td className={`px-1 lg:px-4 lg:p-2 ${customClass}`}>
      {/* Delegamos el renderizado a la configuración de la columna */}
      {columnDef.renderCell(guess, target)}
    </td>
  );
}
