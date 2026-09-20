import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreatableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
}

export function CreatableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
}: CreatableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const matchesExisting = options.some((option) => option.toLowerCase() === normalizedQuery.toLowerCase());

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) setQuery("");
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between px-3 font-normal shadow-sm"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="z-[80] w-[min(var(--radix-popover-trigger-width),calc(100vw-1rem))] p-0 shadow-raised">
        <Command shouldFilter>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <CommandList className="max-h-64 p-1">
            <CommandEmpty className="px-3 py-5 text-center text-sm text-muted-foreground">
              {normalizedQuery ? "No matching saved name." : emptyLabel}
            </CommandEmpty>
            <CommandGroup heading="Existing">
              {options.map((option) => (
                <CommandItem key={option} value={option} onSelect={() => choose(option)} className="min-h-9 px-2.5">
                  <Check className={cn("size-4 text-primary", value === option ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {normalizedQuery && !matchesExisting ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Custom name">
                  <CommandItem value={`custom-${normalizedQuery}`} onSelect={() => choose(normalizedQuery)} className="min-h-10 px-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Plus className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">Use custom name</span>
                      <span className="block truncate font-medium">{normalizedQuery}</span>
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}