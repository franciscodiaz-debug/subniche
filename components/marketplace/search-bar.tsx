import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  placeholder?: string;
};

export function SearchBar({
  placeholder = "Search listings, brands, models...",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input className="pl-9" placeholder={placeholder} />
    </div>
  );
}
