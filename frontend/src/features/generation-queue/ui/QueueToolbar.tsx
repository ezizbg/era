import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Chip } from "@/shared/ui/era/Chip";
import type { TaskStatus } from "@/entities/generation-task";

type FilterOption = "all" | TaskStatus;

interface QueueToolbarProps {
  filter: FilterOption;
  sort: "newest" | "oldest";
  onFilterChange: (f: FilterOption) => void;
  onSortChange: (s: "newest" | "oldest") => void;
}

const FILTERS: Array<{ value: FilterOption; label: string }> = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

export function QueueToolbar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: QueueToolbarProps) {
  return (
    <div
      className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
    >
      {/* Chips — не переносятся */}
      <div className="flex items-center gap-1.5 shrink-0">
        {FILTERS.map(({ value, label }) => (
          <Chip
            key={value}
            active={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </Chip>
        ))}
      </div>

      {/* Фиксированный отступ 34px + дропдаун прижат вправо */}
      <div className="ml-[34px] shrink-0">
        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as "newest" | "oldest")}
        >
          <SelectTrigger className="h-[31px] px-[14px] rounded-full text-[13px] bg-card border-[var(--c-line)] text-[var(--c-fg-mute)] w-auto gap-1.5 [&>svg]:size-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[var(--c-bg-1)] border-[var(--c-line)]">
            <SelectItem value="newest" className="text-[13px] text-[var(--c-fg)]">
              Сначала новые
            </SelectItem>
            <SelectItem value="oldest" className="text-[13px] text-[var(--c-fg)]">
              Сначала старые
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
