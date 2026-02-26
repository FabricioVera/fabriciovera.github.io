import type { ReactNode } from "react";

export interface ColumnDef<T> {
  header: string;
  getCellClass?: (guess: T, target: T) => string;
  renderCell: (guess: T, target: T) => ReactNode;
}
