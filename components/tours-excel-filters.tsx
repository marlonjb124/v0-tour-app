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
    min_adult: number
    max_adult: number
    min_child: number
    max_child: number
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

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return value > 0
    return value !== undefined && value !== null
  }).length

  const filterSections = [
    {
      id: 'countries',
      title: 'Países',
      type: 'checkbox' as const,
      options: countries.map(country => ({ value: country, label: country }))
    },
    {
      id: 'locations',
      title: 'Ubicaciones',
      type: 'checkbox' as const,
      options: locations.map(location => ({ value: location, label: location }))
    },
    {
      id: 'tourTypes',
      title: 'Tipo de Tour',
      type: 'checkbox' as const,
      options: tourTypes.map(type => ({ value: type, label: type }))
    },
    {
      id: 'languages',
      title: 'Idiomas',
      type: 'checkbox' as const,
      options: languages.map(lang => ({ value: lang, label: lang }))
    },
    {
      id: 'adultPrice',
      title: 'Precio Adulto (USD)',
      type: 'range' as const,
      min: priceStats?.min_adult || 0,
      max: priceStats?.max_adult || 1000,
      step: 10
    },
    {
      id: 'childPrice',
      title: 'Precio Niño (USD)',
      type: 'range' as const,
      min: priceStats?.min_child || 0,
      max: priceStats?.max_child || 500,
      step: 5
    },
    {
      id: 'duration',
      title: 'Duración (horas)',
      type: 'range' as const,
      min: 1,
      max: 24,
      step: 1
    }
  ]

  const handleCheckboxChange = (sectionId: string, value: string, checked: boolean) => {
    if (sectionId === 'countries') {
      setLocalFilters(prev => ({ ...prev, country: checked ? value : '' }))
    } else if (sectionId === 'locations') {
      setLocalFilters(prev => ({ ...prev, location: checked ? value : '' }))
    } else if (sectionId === 'tourTypes') {
      setLocalFilters(prev => ({ ...prev, tipo_tour: checked ? value : '' }))
    } else if (sectionId === 'languages') {
      setLocalFilters(prev => ({ ...prev, languages: checked ? value : '' }))
    }
  }

  const handleRangeChange = (sectionId: string, values: number[]) => {
    if (sectionId === 'adultPrice') {
      setLocalFilters(prev => ({
        ...prev,
        adult_min: values[0],
        adult_max: values[1]
      }))
    } else if (sectionId === 'childPrice') {
      setLocalFilters(prev => ({
        ...prev,
        child_min: values[0],
        child_max: values[1]
      }))
    } else if (sectionId === 'duration') {
      setLocalFilters(prev => ({ ...prev, durations_hours: values[0] }))
    }
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: TourExcelFilters = {
      country: '',
      location: '',
      tipo_tour: '',
      languages: '',
      durations_hours: undefined,
      adult_min: undefined,
      adult_max: undefined,
      child_min: undefined,
      child_max: undefined,
      search: filters.search || '' // Preservar búsqueda
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setIsOpen(false)
  }

  const renderSection = (section: any) => {
    if (section.type === 'checkbox' && section.options) {
      return (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">{section.title}</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {section.options.map((option: any) => {
              let isChecked = false
              
              if (section.id === 'countries') {
                isChecked = localFilters.country === option.value
              } else if (section.id === 'locations') {
                isChecked = localFilters.location === option.value
              } else if (section.id === 'tourTypes') {
                isChecked = localFilters.tipo_tour === option.value
              } else if (section.id === 'languages') {
                isChecked = localFilters.languages === option.value
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

      if (section.id === 'adultPrice') {
        values = [localFilters.adult_min || section.min || 0, localFilters.adult_max || section.max || 1000]
        displayText = `$${values[0]} - $${values[1]}`
      } else if (section.id === 'childPrice') {
        values = [localFilters.child_min || section.min || 0, localFilters.child_max || section.max || 500]
        displayText = `$${values[0]} - $${values[1]}`
      } else if (section.id === 'duration') {
        values = [localFilters.durations_hours || section.min || 1]
        displayText = `${values[0]} horas`
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
          Filtros Excel
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
            Filtrar tours (Excel)
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

