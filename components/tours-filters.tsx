import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TourFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  cities: string[];
}

export function TourFilters({ filters, setFilters, cities }: TourFiltersProps) {
  return (
    <Card>
      <CardHeader className="p-2">
        <CardTitle>Filter Tours</CardTitle>
        <CardDescription>
          Find the perfect tour by refining your search.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="gastronomy">Gastronomy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={filters.duration || 'all'}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, duration: value === 'all' ? '' : value }))}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Any Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="half-day">Half-day</SelectItem>
                <SelectItem value="full-day">Full-day</SelectItem>
                <SelectItem value="multi-day">Multi-day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select
              value={filters.destination || 'all'}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, destination: value === 'all' ? '' : value }))}
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="All Destinations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Starting Point */}
          <div className="space-y-2">
            <Label htmlFor="starting-point">Starting Point</Label>
            <Select
              value={filters.starting_point || 'all'}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, starting_point: value === 'all' ? '' : value }))}
            >
              <SelectTrigger id="starting-point">
                <SelectValue placeholder="Any Starting Point" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Starting Point</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Label>Price Range</Label>
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                placeholder="Min"
                value={filters.min_price || '0'}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, min_price: e.target.value ? Number(e.target.value) : 0 }))}
              />
              <span>-</span>
              <Input 
                type="number" 
                placeholder="Max" 
                value={filters.max_price || ''}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, max_price: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Minimum Rating</Label>
            <Select
              value={filters.min_rating?.toString() || 'all'}
              onValueChange={(value) => setFilters((prev: any) => ({ ...prev, min_rating: value === 'all' ? null : Number(value) }))}
            >
              <SelectTrigger id="rating">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="1">1 Star & Up</SelectItem>
                <SelectItem value="2">2 Stars & Up</SelectItem>
                <SelectItem value="3">3 Stars & Up</SelectItem>
                <SelectItem value="4">4 Stars & Up</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <Label>Services</Label>
          <div className="flex flex-wrap gap-4">
            {[ 'hotel-pickup', 'small-group', 'private-tour' ].map(service => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox 
                  id={service}
                  checked={filters.services.includes(service)}
                  onCheckedChange={(checked) => {
                    setFilters((prev: any) => ({
                      ...prev,
                      services: checked
                        ? [...prev.services, service]
                        : prev.services.filter((s: string) => s !== service)
                    }))
                  }}
                />
                <Label htmlFor={service} className="font-normal capitalize">
                  {service.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline"
            onClick={() => setFilters({
              city: "", search: "", category: "", duration: "",
              destination: "", starting_point: "", min_price: null,
              max_price: null, min_rating: null, services: [],
            })}
          >
            Clear Filters
          </Button>
          {/* The apply button can be used for manual refetching if desired */}
          {/* <Button>Apply Filters</Button> */}
        </div>
      </CardContent>
    </Card>
  );
}