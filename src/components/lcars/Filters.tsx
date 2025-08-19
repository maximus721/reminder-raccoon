import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilter: 'all' | 'next30' | 'overdue';
  onFilterChange: (filter: 'all' | 'next30' | 'overdue') => void;
  resultCount: number;
}

export const Filters = ({ 
  searchTerm, 
  onSearchChange, 
  activeFilter, 
  onFilterChange, 
  resultCount 
}: FiltersProps) => {
  const filterOptions = [
    { key: 'all' as const, label: 'All Bills', count: null },
    { key: 'next30' as const, label: 'Next 30 Days', count: null },
    { key: 'overdue' as const, label: 'Overdue', count: null }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search bills by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">Filter:</span>
        {filterOptions.map((option) => (
          <Button
            key={option.key}
            variant={activeFilter === option.key ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(option.key)}
            className={`transition-all duration-200 ${
              activeFilter === option.key 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            {option.label}
          </Button>
        ))}
        
        {/* Results Count */}
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {resultCount} {resultCount === 1 ? 'bill' : 'bills'}
          </Badge>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || activeFilter !== 'all') && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchTerm && (
            <Badge variant="outline" className="gap-1">
              Search: "{searchTerm}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onSearchChange('')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {activeFilter !== 'all' && (
            <Badge variant="outline" className="gap-1">
              {filterOptions.find(f => f.key === activeFilter)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onFilterChange('all')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onFilterChange('all');
            }}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};