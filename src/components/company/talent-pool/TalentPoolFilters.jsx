import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const TalentPoolFilters = ({ filters, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchTerm });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onFilterChange]);

  const handleClearAll = () => {
    setSearchTerm('');
    onFilterChange({ search: '' });
  };

  const hasActiveFilters = !!searchTerm;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearAll} className="gap-2">
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};

export default TalentPoolFilters;
