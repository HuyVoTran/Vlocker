import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card } from './card';
import { Search } from 'lucide-react';
import { Label } from './label';

export type FilterOption = {
  value: string | number;
  label: string;
};

export type FilterConfig = {
  id: string;
  type: 'search' | 'select';
  label?: string; // Optional label above the filter
  placeholder?: string;
  options?: FilterOption[];
  className?: string;
  icon?: React.ReactNode;
  // A condition to determine if the filter should be rendered
  shouldRender?: boolean;
};

interface FilterBarProps {
  filters: FilterConfig[];
  filterValues: { [key: string]: string | number };
  onFilterChange: (id: string, value: string) => void;
  className?: string;
  gridClass?: string;
}

export function FilterBar({
  filters,
  filterValues,
  onFilterChange,
  className = 'p-4 md:p-6 mb-6',
  gridClass = 'grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end'
}: FilterBarProps) {
  const renderableFilters = filters.filter(f => f.shouldRender !== false);

  return (
    <Card className={className}>
      <div className={gridClass}>
        {renderableFilters.map((filter) => (
          <div key={filter.id} className={filter.className}>
            {filter.label && <Label className="text-xs text-gray-500 mb-1">{filter.label}</Label>}
            {(() => {
              switch (filter.type) {
                case 'search':
                  return (
                    <div className="relative">
                      {filter.icon !== null && (filter.icon || <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />)}
                      <Input
                        placeholder={filter.placeholder}
                        value={filterValues[filter.id] || ''}
                        onChange={(e) => onFilterChange(filter.id, e.target.value)}
                        className={filter.icon !== null ? "pl-10" : ""}
                      />
                    </div>
                  );
                case 'select':
                  return (
                    <Select
                      value={String(filterValues[filter.id] || '')}
                      onValueChange={(value) => onFilterChange(filter.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filter.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                default:
                  return null;
              }
            })()}
          </div>
        ))}
      </div>
    </Card>
  );
}