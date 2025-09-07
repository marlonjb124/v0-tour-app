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
import { TourFilters } from "@/services/tour-service"

interface FilterSection {
  id: string
  title: string
  type: 'checkbox' | 'range' | 'text'
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
}

interface FilterPopupProps {
  filters: TourFilters
  onFiltersChange: (filters: TourFilters) => void
  cities?: string[]
  categories?: string[]
  services?: string[]
  customSections?: FilterSection[]
}

export function FilterPopup({ 
  filters, 
  onFiltersChange, 
  cities = [], 
  categories = [], 
  services = [],
  customSections = []
}: FilterPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<TourFilters>(filters)

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return value > 0
    return value !== undefined && value !== null
  }).length

  const filterSections: FilterSection[] = [
    {
      id: 'cities',
      title: 'Ciudades',
      type: 'checkbox',
      options: cities.map(city => ({ value: city, label: city }))
    },
    {
      id: 'categories',
      title: 'Categorías',
      type: 'checkbox',
      options: categories.map(cat => ({ value: cat, label: cat }))
    },
    {
      id: 'services',
      title: 'Servicios',
      type: 'checkbox',
      options: services.map(service => ({ value: service, label: service }))
    },
    {
      id: 'tour_type',
      title: 'Tipo de Tour',
      type: 'checkbox',
      options: [
        { value: 'tour', label: 'Tour' },
        { value: 'ticket', label: 'Solo Ticket' }
      ]
    },
    {
      id: 'location_type',
      title: 'Ubicación',
      type: 'checkbox',
      options: [
        { value: 'domestic', label: 'Perú' },
        { value: 'international', label: 'Internacional' }
      ]
    },
    {
      id: 'price_range',
      title: 'Rango de Precio (USD)',
      type: 'range',
      min: 0,
      max: 1000,
      step: 10
    },
    {
      id: 'rating',
      title: 'Valoración Mínima',
      type: 'range',
      min: 1,
      max: 5,
      step: 0.5
    },
    {
      id: 'duration',
      title: 'Duración (días)',
      type: 'range',
      min: 1,
      max: 30,
      step: 1
    },
    ...customSections
  ]

  const handleCheckboxChange = (sectionId: string, value: string, checked: boolean) => {
    if (sectionId === 'cities') {
      setLocalFilters(prev => ({ ...prev, city: checked ? value : '' }))
    } else if (sectionId === 'categories') {
      setLocalFilters(prev => ({ ...prev, category: checked ? value : '' }))
    } else if (sectionId === 'tour_type') {
      setLocalFilters(prev => ({ ...prev, tour_type: checked ? value as any : undefined }))
    } else if (sectionId === 'location_type') {
      setLocalFilters(prev => ({ ...prev, location_type: checked ? value as any : undefined }))
    } else if (sectionId === 'services') {
      setLocalFilters(prev => ({
        ...prev,
        services: checked 
          ? [...(prev.services || []), value]
          : (prev.services || []).filter(s => s !== value)
      }))
    }
  }

  const handleRangeChange = (sectionId: string, values: number[]) => {
    if (sectionId === 'price_range') {
      setLocalFilters(prev => ({
        ...prev,
        min_price: values[0],
        max_price: values[1]
      }))
    } else if (sectionId === 'rating') {
      setLocalFilters(prev => ({ ...prev, min_rating: values[0] }))
    } else if (sectionId === 'duration') {
      setLocalFilters(prev => ({
        ...prev,
        min_days: values[0],
        max_days: values[1]
      }))
    }
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: TourFilters = {
      city: '',
      search: filters.search || '', // Preserve search
      category: '',
      duration: undefined,
      destination: '',
      starting_point: '',
      min_price: undefined,
      max_price: undefined,
      min_rating: undefined,
      services: [],
      tour_type: undefined,
      location_type: undefined,
      min_days: undefined,
      max_days: undefined
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setIsOpen(false)
  }

  const renderSection = (section: FilterSection) => {
    if (section.type === 'checkbox' && section.options) {
      return (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">{section.title}</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {section.options.map(option => {
              let isChecked = false
              
              if (section.id === 'cities') {
                isChecked = localFilters.city === option.value
              } else if (section.id === 'categories') {
                isChecked = localFilters.category === option.value
              } else if (section.id === 'tour_type') {
                isChecked = localFilters.tour_type === option.value
              } else if (section.id === 'location_type') {
                isChecked = localFilters.location_type === option.value
              } else if (section.id === 'services') {
                isChecked = (localFilters.services || []).includes(option.value)
              }

              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${section.id}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(section.id, option.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`${section.id}-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (section.type === 'range') {
      let values: number[] = []
      let displayText = ''

      if (section.id === 'price_range') {
        values = [localFilters.min_price || section.min || 0, localFilters.max_price || section.max || 1000]
        displayText = `$${values[0]} - $${values[1]}`
      } else if (section.id === 'rating') {
        values = [localFilters.min_rating || section.min || 1]
        displayText = `${values[0]}+ estrellas`
      } else if (section.id === 'duration') {
        values = [localFilters.min_days || section.min || 1, localFilters.max_days || section.max || 30]
        displayText = `${values[0]} - ${values[1]} días`
      }

      return (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-sm text-gray-900">{section.title}</h4>
            <span className="text-xs text-gray-500">{displayText}</span>
          </div>
          <Slider
            value={values}
            onValueChange={(newValues) => handleRangeChange(section.id, newValues)}
            max={section.max}
            min={section.min}
            step={section.step}
            className="w-full"
          />
        </div>
      )
    }

    return null
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
          {filterSections.map(section => (
            <div key={section.id}>
              {renderSection(section)}
            </div>
          ))}
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
