'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TourService, CreateTourRequest } from '@/services/tour-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@radix-ui/react-label'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Star,
  Upload,
  X
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

// Validation schema
const tourSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'La descripción no puede exceder 500 caracteres'),
  full_description: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida').max(100, 'La ciudad no puede exceder 100 caracteres'),
  location: z.string().min(5, 'La ubicación debe tener al menos 5 caracteres').max(500, 'La ubicación no puede exceder 500 caracteres'),
  meeting_point: z.string().min(5, 'El punto de encuentro debe tener al menos 5 caracteres').max(500, 'El punto de encuentro no puede exceder 500 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor a 0').max(99999, 'El precio no puede exceder $99,999'),
  original_price: z.number().optional(),
  duration: z.string().min(1, 'La duración es requerida').max(50, 'La duración no puede exceder 50 caracteres'),
  max_group_size: z.number().min(1, 'El tamaño del grupo debe ser al menos 1').max(1000, 'El tamaño del grupo no puede exceder 1000'),
  highlights: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  cancellation_policy: z.string().min(10, 'La política de cancelación debe tener al menos 10 caracteres'),
  images: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

type TourFormData = z.infer<typeof tourSchema>

const cities = ['Cusco', 'Lima', 'Arequipa', 'Ica', 'Puno', 'Trujillo', 'Chiclayo', 'Piura', 'Huacachina', 'Paracas']

export default function NewTourPage() {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      title: '',
      description: '',
      full_description: '',
      city: '',
      location: '',
      meeting_point: '',
      price: 0,
      original_price: undefined,
      duration: '',
      max_group_size: 10,
      highlights: [],
      included: [],
      cancellation_policy: 'Cancelación gratuita hasta 24 horas antes del tour',
      images: [],
      is_featured: false,
      is_active: true,
    }
  })

  const highlightsFieldArray = useFieldArray({
    control: form.control,
    name: 'highlights'
  })

  const includedFieldArray = useFieldArray({
    control: form.control,
    name: 'included'
  })

  // Create tour mutation
  const createTourMutation = useMutation({
    mutationFn: (data: CreateTourRequest) => TourService.createTour(data),
    onSuccess: (tour) => {
      toast.success('Tour creado exitosamente')
      router.push('/admin/tours')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al crear el tour')
    }
  })

  const onSubmit = (data: TourFormData) => {
    const tourData: CreateTourRequest = {
      ...data,
      images: imageUrls,
      highlights: data.highlights?.filter(h => h.trim() !== '') || [],
      included: data.included?.filter(i => i.trim() !== '') || [],
    }
    
    createTourMutation.mutate(tourData)
  }

  const addHighlight = () => {
    highlightsFieldArray.append('')
  }

  const addIncluded = () => {
    includedFieldArray.append('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/tours">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Tour</h1>
          <p className="text-muted-foreground">
            Completa la información para crear un nuevo tour
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                  <CardDescription>
                    Información principal del tour
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Tour *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Machu Picchu Tour Completo" {...field} />
                        </FormControl>
                        <FormDescription>
                          Un título atractivo y descriptivo (3-200 caracteres)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una ciudad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duración *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 2-3 horas, Día completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción Corta *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Una breve descripción del tour para las listas..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Descripción breve que se muestra en las listas (10-500 caracteres)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción Completa</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción detallada del tour, experiencias, historia..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Descripción detallada que se muestra en la página del tour
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Centro Histórico de Cusco, Perú" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ubicación general del tour
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meeting_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punto de Encuentro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Plaza de Armas de Cusco, frente a la Catedral" {...field} />
                        </FormControl>
                        <FormDescription>
                          Punto específico donde inicia el tour
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing & Logistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Precios y Logística
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Actual *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="original_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Original</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00 (opcional)"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Para mostrar descuentos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_group_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño Máximo del Grupo *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="cancellation_policy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Política de Cancelación *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción de la política de cancelación..."
                            className="min-h-[60px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Lo Más Destacado
                  </CardTitle>
                  <CardDescription>
                    Puntos destacados del tour
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {highlightsFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`highlights.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Ej: Vistas panorámicas de los Andes" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => highlightsFieldArray.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addHighlight}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Destacado
                  </Button>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Qué Incluye
                  </CardTitle>
                  <CardDescription>
                    Servicios incluidos en el tour
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {includedFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`included.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Ej: Guía turístico profesional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => includedFieldArray.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addIncluded}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Servicio Incluido
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Tour Activo</FormLabel>
                          <FormDescription>
                            El tour será visible para los usuarios
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Tour Destacado</FormLabel>
                          <FormDescription>
                            Aparecerá en la sección de tours destacados
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Imágenes del Tour
                  </CardTitle>
                  <CardDescription>
                    Sube las imágenes del tour. La primera imagen será la imagen principal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={imageUrls}
                    onChange={setImageUrls}
                    multiple={true}
                    maxFiles={10}
                    uploadOptions={{
                      maxSize: 5, // 5MB
                      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
                      quality: 0.85,
                      maxWidth: 1920,
                      maxHeight: 1080
                    }}
                    showPreview={true}
                    allowReorder={true}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createTourMutation.isPending}
                    >
                      {createTourMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Crear Tour
                        </>
                      )}
                    </Button>
                    
                    <Link href="/admin/tours" className="w-full">
                      <Button type="button" variant="outline" className="w-full">
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}