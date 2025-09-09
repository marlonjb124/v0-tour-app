"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { TourExcelFilters } from "@/lib/types-excel"

interface ToursExcelFiltersProps {
  filters: TourExcelFilters
  onFiltersChange: (filters: TourExcelFilters) => void
  locations?: string[]
  countries?: string[]
  tourTypes?: string[]
  languages?: string[]
  priceStats?: {
    min_adult: number;
    max_adult: number;
    min_child: number;
    max_child: number;
  }
}

export function ToursExcelFilters({ 
  filters, 
  onFiltersChange, 
  locations = [], 
  countries = [],
  tourTypes = [],
  languages = [],
  priceStats
}: ToursExcelFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<TourExcelFilters>(filters)

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false // Don't count search as a filter
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') {
      // For duration filters, only count if they're different from default values
      if (key === 'min_duration_hours') return value !== 1
      if (key === 'max_duration_hours') return value !== 24
      return value > 0
    }
    return value !== undefined && value !== null
  }).length

  const handleCheckboxChange = (field: keyof TourExcelFilters, value: string, checked: boolean) => {
    if (field === 'location') {
      setLocalFilters(prev => ({ ...prev, location: checked ? value : undefined }))
    } else if (field === 'country') {
      setLocalFilters(prev => ({ ...prev, country: checked ? value : undefined }))
    } else if (field === 'tipo_tour') {
      setLocalFilters(prev => ({ ...prev, tipo_tour: checked ? value : undefined }))
    } else if (field === 'languages') {
      setLocalFilters(prev => ({ ...prev, languages: checked ? value : undefined }))
    }
  }

  const handleRangeChange = (field: keyof TourExcelFilters, values: number[]) => {
    if (field === 'adult_min' || field === 'adult_max') {
      setLocalFilters(prev => ({
        ...prev,
        adult_min: values[0],
        adult_max: values[1]
      }))
    } else if (field === 'child_min' || field === 'child_max') {
      setLocalFilters(prev => ({
        ...prev,
        child_min: values[0],
        child_max: values[1]
      }))
    } else if (field === 'min_duration_hours' || field === 'max_duration_hours') {
      setLocalFilters(prev => ({
        ...prev,
        min_duration_hours: values[0],
        max_duration_hours: values[1]
      }))
    }
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: TourExcelFilters = {
      search: filters.search || '', // Preserve search
      min_duration_hours: 1,
      max_duration_hours: 24,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filtrar resultados
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Ubicaciones */}
          {locations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">Ubicaciones</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {locations.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={localFilters.location === location}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('location', location, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`location-${location}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Países */}
          {countries.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">Países</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {countries.map(country => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={localFilters.country === country}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('country', country, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`country-${country}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {country}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de Tour */}
          {tourTypes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">Tipos de Tour</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tourTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={localFilters.tipo_tour === type}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('tipo_tour', type, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`type-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {languages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900">Idiomas</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {languages.map(language => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={`language-${language}`}
                      checked={localFilters.languages === language}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('languages', language, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`language-${language}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rango de Precio Adulto */}
          {priceStats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm text-gray-900">Precio Adulto (USD)</h4>
                <span className="text-xs text-gray-500">
                  ${localFilters.adult_min || priceStats.min_adult} - ${localFilters.adult_max || priceStats.max_adult}
                </span>
              </div>
              <Slider
                value={[localFilters.adult_min || priceStats.min_adult, localFilters.adult_max || priceStats.max_adult]}
                onValueChange={(newValues) => handleRangeChange('adult_min', newValues)}
                max={priceStats.max_adult}
                min={priceStats.min_adult}
                step={10}
                className="w-full"
              />
            </div>
          )}

          {/* Rango de Precio Niño */}
          {priceStats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm text-gray-900">Precio Niño (USD)</h4>
                <span className="text-xs text-gray-500">
                  ${localFilters.child_min || priceStats.min_child} - ${localFilters.child_max || priceStats.max_child}
                </span>
              </div>
              <Slider
                value={[localFilters.child_min || priceStats.min_child, localFilters.child_max || priceStats.max_child]}
                onValueChange={(newValues) => handleRangeChange('child_min', newValues)}
                max={priceStats.max_child}
                min={priceStats.min_child}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Duración */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm text-gray-900">Duración (horas)</h4>
              <span className="text-xs text-gray-500">
                {localFilters.min_duration_hours ?? 1} - {localFilters.max_duration_hours ?? 24}h
              </span>
            </div>
            <Slider
              value={[localFilters.min_duration_hours ?? 1, localFilters.max_duration_hours ?? 24]}
              onValueChange={(newValues) => handleRangeChange('min_duration_hours', newValues)}
              max={24}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            Limpiar
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}