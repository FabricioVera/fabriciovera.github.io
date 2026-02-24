interface TableHeaderProps {
  tableHeaderNames: string[];
  classes?: string;
}

export default function TableHeader({
  tableHeaderNames,
  classes,
}: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {tableHeaderNames.map((title, index) => (
          <th
            key={index}
            className={`${classes} p-1 lg:p-3 border-r border-secondary`}
          >
            {title}
          </th>
        ))}
      </tr>
    </thead>
  );
}
