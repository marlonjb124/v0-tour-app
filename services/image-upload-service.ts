import { createClient } from '@/lib/supabase'

export interface UploadResponse {
  url: string
  filename: string
  size: number
  type: string
}

export interface ImageUploadOptions {
  maxSize?: number // in MB
  allowedTypes?: string[]
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

export class ImageUploadService {
  private static readonly DEFAULT_MAX_SIZE = 5 // 5MB
  private static readonly DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  private static readonly DEFAULT_QUALITY = 0.85
  private static readonly DEFAULT_MAX_WIDTH = 1920
  private static readonly DEFAULT_MAX_HEIGHT = 1080
  private static readonly BUCKET_NAME = 'tour-images'

  /**
   * Upload a single image file to Supabase Storage
   */
  static async uploadImage(
    file: File,
    options: ImageUploadOptions = {},
    folder = 'tours'
  ): Promise<UploadResponse> {
    const {
      maxSize = this.DEFAULT_MAX_SIZE,
      allowedTypes = this.DEFAULT_ALLOWED_TYPES,
      quality = this.DEFAULT_QUALITY,
      maxWidth = this.DEFAULT_MAX_WIDTH,
      maxHeight = this.DEFAULT_MAX_HEIGHT
    } = options

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`)
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024)
    if (fileSizeInMB > maxSize) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo permitido: ${maxSize}MB`)
    }

    try {
      const supabase = createClient()
      
      // Compress and resize image if needed
      const processedFile = await this.processImage(file, {
        quality,
        maxWidth,
        maxHeight
      })

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Error al subir la imagen: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      return {
        url: publicUrl,
        filename: fileName,
        size: processedFile.size,
        type: processedFile.type
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al subir la imagen')
    }
  }

  /**
   * Upload multiple images to Supabase Storage
   */
  static async uploadMultipleImages(
    files: File[],
    options: ImageUploadOptions = {},
    folder = 'tours',
    onProgress?: (progress: number, currentFile: number) => void
  ): Promise<UploadResponse[]> {
    const results: UploadResponse[] = []
    const total = files.length

    for (let i = 0; i < files.length; i++) {
      try {
        onProgress?.(((i / total) * 100), i + 1)
        const result = await this.uploadImage(files[i], options, folder)
        results.push(result)
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error)
        throw error
      }
    }

    onProgress?.(100, total)
    return results
  }

  /**
   * Delete an uploaded image from Supabase Storage
   */
  static async deleteImage(url: string): Promise<void> {
    try {
      const supabase = createClient()
      
      // Extract filename from URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      
      // Find the full path by checking the last parts of the URL
      const bucketIndex = urlParts.findIndex(part => part === this.BUCKET_NAME)
      if (bucketIndex === -1) {
        throw new Error('Invalid image URL')
      }
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/')
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        throw new Error(`Error al eliminar la imagen: ${error.message}`)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al eliminar la imagen')
    }
  }

  /**
   * Process image (compress and resize)
   */
  private static processImage(
    file: File,
    options: {
      quality: number
      maxWidth: number
      maxHeight: number
    }
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const { maxWidth, maxHeight } = options

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(processedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          options.quality
        )
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Validate image file
   */
  static validateImage(file: File, options: ImageUploadOptions = {}): string | null {
    const {
      maxSize = this.DEFAULT_MAX_SIZE,
      allowedTypes = this.DEFAULT_ALLOWED_TYPES
    } = options

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024)
    if (fileSizeInMB > maxSize) {
      return `El archivo es demasiado grande. Tamaño máximo permitido: ${maxSize}MB`
    }

    return null
  }

  /**
   * Generate preview URL for a file
   */
  static generatePreview(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Cleanup preview URL
   */
  static cleanupPreview(url: string): void {
    URL.revokeObjectURL(url)
  }

  /**
   * Convert file to base64
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

export default ImageUploadService