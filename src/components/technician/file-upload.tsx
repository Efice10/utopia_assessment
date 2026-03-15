'use client';

import { useState, useCallback, useRef } from 'react';

import { Upload, X, FileText, Image, Video, AlertCircle, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  accept?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'image/*': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'video/*': ['video/mp4', 'video/webm', 'video/quicktime'],
  '.pdf': ['application/pdf'],
};

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'image/': Image,
  'video/': Video,
  'application/pdf': FileText,
};

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 6,
  maxFileSize = 10,
  accept = 'image/*,video/*,.pdf',
  disabled = false,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const getFileIcon = (file: File) => {
    for (const [type, Icon] of Object.entries(FILE_ICONS)) {
      if (file.type.startsWith(type) || file.type === type) {
        return Icon;
      }
    }
    return FileText;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').flatMap((type) => {
      if (type.includes('/*')) {
        return ACCEPTED_TYPES[type] || [];
      }
      return [type.trim()];
    });

    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return 'File type not supported';
    }

    return null;
  };

  const createPreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          video.currentTime = 1;
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => resolve(null);
        video.src = URL.createObjectURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const processFiles = async (selectedFiles: File[]) => {
    setError(null);

    // Check max files limit
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const validFiles: File[] = [];
    const errors: string[] = [];
    const newPreviews = new Map(previews);

    for (const file of filesToAdd) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      validFiles.push(file);

      // Create preview for the file
      const preview = await createPreview(file);
      if (preview) {
        newPreviews.set(`${file.name}-${file.size}`, preview);
      }
    }

    if (errors.length > 0) {
      setError(errors[0]); // Show first error
    }

    if (validFiles.length > 0) {
      setPreviews(newPreviews);
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      await processFiles(selectedFiles);
    }
    // Reset input to allow selecting same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        await processFiles(droppedFiles);
      }
    },
    [disabled, files, maxFiles]
  );

  const removeFile = (index: number) => {
    const file = files[index];
    const fileKey = `${file.name}-${file.size}`;

    // Clean up preview URL
    const preview = previews.get(fileKey);
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    const newPreviews = new Map(previews);
    newPreviews.delete(fileKey);
    setPreviews(newPreviews);

    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFilePreview = (file: File): string | null => {
    return previews.get(`${file.name}-${file.size}`) || null;
  };

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-foreground'>
          Attachments
        </span>
        <span
          className={cn(
            'text-sm tabular-nums',
            files.length >= maxFiles
              ? 'text-destructive font-medium'
              : 'text-muted-foreground'
          )}
        >
          {files.length} / {maxFiles}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type='file'
          multiple
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className='hidden'
          id='file-upload'
        />
        <label
          htmlFor='file-upload'
          className={cn(
            'flex flex-col items-center justify-center cursor-pointer py-8 px-4 min-h-[140px]',
            disabled && 'cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
              isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            <Upload className='w-6 h-6' />
          </div>
          <span className='text-sm font-medium text-foreground mb-1'>
            {isDragging ? 'Drop files here' : 'Tap to upload'}
          </span>
          <span className='text-xs text-muted-foreground text-center'>
            Photos, videos or PDFs
            <br />
            Max {maxFileSize}MB each
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className='flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive'>
          <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
          <p className='text-sm'>{error}</p>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <CheckCircle2 className='w-4 h-4 text-emerald-500' />
            <span>Files ready to upload</span>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const preview = getFilePreview(file);

              return (
                <div
                  key={`${file.name}-${index}`}
                  className='group relative rounded-xl overflow-hidden bg-muted border border-border transition-all hover:shadow-md'
                >
                  {/* Preview Area */}
                  <div className='aspect-square relative'>
                    {preview ? (
                      <img
                        src={preview}
                        alt={file.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-3'>
                        <FileIcon className='w-8 h-8 text-muted-foreground mb-2' />
                        <span className='text-xs text-muted-foreground text-center truncate max-w-full'>
                          {file.name}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>

                  {/* File Info */}
                  <div className='absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform bg-black/60 backdrop-blur-sm'>
                    <p className='text-xs text-white truncate'>{file.name}</p>
                    <p className='text-xs text-white/70'>{formatFileSize(file.size)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type='button'
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className={cn(
                      'absolute top-2 right-2 p-1.5 rounded-full transition-all',
                      'bg-black/50 text-white hover:bg-destructive hover:text-destructive-foreground',
                      'opacity-0 group-hover:opacity-100',
                      'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50',
                      'min-w-[32px] min-h-[32px] flex items-center justify-center'
                    )}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className='w-4 h-4' />
                  </button>

                  {/* File Type Badge */}
                  <div className='absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm'>
                    {file.type.startsWith('image/')
                      ? 'Photo'
                      : file.type.startsWith('video/')
                        ? 'Video'
                        : 'PDF'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
