import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterBar({ filters }: { filters: FilterDef[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
      {filters.map((f) => (
        <Select key={f.key} value={f.value} onValueChange={f.onChange}>
           <SelectTrigger className="h-9 w-full text-sm sm:w-auto sm:min-w-36" aria-label={f.label}>
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
            {f.options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
