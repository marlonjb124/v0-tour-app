// Tipos basados en la estructura exacta del Excel
export interface TourExcel {
  id: string;
  item: number;
  country: string;
  location: string;
  tipo_tour: string;
  titulo: string;
  durations_hours: number;
  rango_horario_inicio: string;
  hora_inicio: string;
  hora_fin: string;
  caracteristicas_servicio: string;
  languages: string;
  purchase_anticipation_hours: number;
  adult: number;
  child: number;
  edad_ninos: string;
  includes: string;
  no_includes: string;
  before_you_go: string;
  accesibilidad: string;
  highlights: string;
  tour_program: string;
  created_at: string;
  updated_at: string;
}

// Filtros para la nueva estructura
export interface TourExcelFilters {
  country?: string;
  location?: string;
  tipo_tour?: string;
  durations_hours?: number;
  languages?: string;
  adult_min?: number;
  adult_max?: number;
  child_min?: number;
  child_max?: number;
  search?: string;
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

