'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'
import { ImageUploadService, type UploadResponse, type ImageUploadOptions } from '@/services/image-upload-service'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
  className?: string
  uploadOptions?: ImageUploadOptions
  showPreview?: boolean
  allowReorder?: boolean
}

interface FileWithPreview {
  file: File
  preview: string
  error?: string
}

export function ImageUpload({
  value = [],
  onChange,
  multiple = true,
  maxFiles = 10,
  disabled = false,
  className,
  uploadOptions = {},
  showPreview = true,
  allowReorder = true
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<FileWithPreview[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled) return

    const fileArray = Array.from(files)
    const totalFiles = value.length + fileArray.length

    // Check max files limit
    if (totalFiles > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    // Validate files
    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = ImageUploadService.validateImage(file, uploadOptions)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push({
          file,
          preview: ImageUploadService.generatePreview(file)
        })
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }

    if (validFiles.length === 0) return

    setUploadingFiles(prev => [...prev, ...validFiles])
    uploadFiles(validFiles)
  }, [value.length, maxFiles, disabled, uploadOptions])

  const uploadFiles = async (filesToUpload: FileWithPreview[]) => {
    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const fileWithPreview = filesToUpload[i]
        const fileKey = fileWithPreview.file.name + fileWithPreview.file.lastModified

        try {
          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }))

          // Simulate progress (since we don't have real upload progress)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              [fileKey]: Math.min((prev[fileKey] || 0) + 10, 90)
            }))
          }, 100)

          const result = await ImageUploadService.uploadImage(fileWithPreview.file, uploadOptions)
          newUrls.push(result.url)

          // Complete progress
          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }))

          // Cleanup preview
          ImageUploadService.cleanupPreview(fileWithPreview.preview)

        } catch (error: any) {
          toast.error(`Error subiendo ${fileWithPreview.file.name}: ${error.message}`)
          // Mark file with error
          setUploadingFiles(prev => prev.map(f => 
            f.file.name === fileWithPreview.file.name 
              ? { ...f, error: error.message }
              : f
          ))
        }
      }

      // Update parent component with new URLs
      if (newUrls.length > 0) {
        const allUrls = multiple ? [...value, ...newUrls] : newUrls
        onChange?.(allUrls)
        toast.success(`${newUrls.length} imagen(es) subida(s) correctamente`)
      }

      // Clean up successful uploads
      setUploadingFiles(prev => prev.filter(f => 
        !newUrls.some(url => url.includes(f.file.name)) && !f.error
      ))

    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const removeFile = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange?.(newUrls)
  }

  const removeUploadingFile = (fileName: string) => {
    setUploadingFiles(prev => {
      const fileToRemove = prev.find(f => f.file.name === fileName)
      if (fileToRemove) {
        ImageUploadService.cleanupPreview(fileToRemove.preview)
      }
      return prev.filter(f => f.file.name !== fileName)
    })
  }

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return
    
    const newUrls = [...value]
    const [movedUrl] = newUrls.splice(fromIndex, 1)
    newUrls.splice(toIndex, 0, movedUrl)
    onChange?.(newUrls)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver && !disabled && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled ? openFileSelector : undefined}
      >
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Arrastra imágenes aquí o haz clic para seleccionar
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {multiple ? `Sube hasta ${maxFiles} imágenes` : 'Sube una imagen'}
              <br />
              Formatos: JPG, PNG, WebP (máx. {uploadOptions.maxSize || 5}MB)
            </p>
            <Button variant="outline" disabled={disabled} type="button">
              <Plus className="h-4 w-4 mr-2" />
              Seleccionar archivos
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Subiendo archivos...</h4>
          {uploadingFiles.map((fileWithPreview) => {
            const fileKey = fileWithPreview.file.name + fileWithPreview.file.lastModified
            const progress = uploadProgress[fileKey] || 0
            
            return (
              <Card key={fileKey} className="p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={fileWithPreview.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {fileWithPreview.file.name}
                    </div>
                    {fileWithPreview.error ? (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {fileWithPreview.error}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {progress}% - {Math.round(fileWithPreview.file.size / 1024)}KB
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUploadingFile(fileWithPreview.file.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Uploaded Images */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Imágenes subidas ({value.length}/{maxFiles})
            </h4>
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <Card key={url} className="group relative overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg'
                    }}
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Primary image indicator */}
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 text-xs">
                      Principal
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-muted-foreground">
        La primera imagen será la imagen principal del tour.
        {allowReorder && ' Puedes reorganizar las imágenes arrastrándolas.'}
      </div>
    </div>
  )
}

export default ImageUpload