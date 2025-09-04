"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface TicketFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  cities: string[];
  categories: string[];
}

export function TicketFilters({ filters, setFilters, cities, categories }: TicketFiltersProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Filter Tickets</CardTitle>
        <CardDescription>Refine your search for tickets and events.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select 
              value={filters.destination || 'all'}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, destination: value === 'all' ? '' : value }))}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={filters.category || 'all'}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, category: value === 'all' ? '' : value }))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                placeholder="Min"
                value={filters.min_price || ''}
                onChange={(e) => {
                  const { value } = e.target;
                  setFilters((prev: any) => ({ ...prev, min_price: value === '' ? undefined : Number(value) }));
                }}
              />
              <span>-</span>
              <Input 
                type="number" 
                placeholder="Max" 
                value={filters.max_price || ''}
                onChange={(e) => {
                  const { value } = e.target;
                  setFilters((prev: any) => ({ ...prev, max_price: value === '' ? undefined : Number(value) }));
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
