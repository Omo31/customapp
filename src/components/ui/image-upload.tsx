
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '@/firebase/config';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, UploadCloud, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  storagePath: string;
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

const storage = getStorage(app);

export function ImageUpload({ storagePath, currentImageUrl, onUploadComplete }: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (currentImageUrl) {
        // Don't delete the old image until the new one is successfully uploaded
        // to avoid a broken image state if the new upload fails.
        // The deletion will be handled after the new upload completes.
      }

      const fileRef = ref(storage, `${storagePath}${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      setIsUploading(true);
      setUploadProgress(0);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          toast({
            title: 'Upload Failed',
            description: 'There was an error uploading your image. Please try again.',
            variant: 'destructive',
          });
          setIsUploading(false);
          setUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            
            // Delete the old image if it exists
            if (currentImageUrl) {
                try {
                    const oldImageRef = ref(storage, currentImageUrl);
                    deleteObject(oldImageRef).catch(err => {
                        // This might fail if the URL is not a storage URL, which is fine.
                        // Or if permissions are denied. We can silently fail here.
                        console.warn("Could not delete old image: ", err.message);
                    });
                } catch (error) {
                     console.warn("Error creating ref for old image: ", (error as Error).message);
                }
            }

            onUploadComplete(downloadURL);
            setIsUploading(false);
            setUploadProgress(null);
            toast({
              title: 'Upload Successful',
              description: 'Your image has been uploaded.',
            });
          });
        }
      );
    },
    [storagePath, onUploadComplete, toast, currentImageUrl]
  );

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering the file dialog
    e.preventDefault();

    if (!currentImageUrl) return;

    try {
        const imageRef = ref(storage, currentImageUrl);
        deleteObject(imageRef)
            .then(() => {
                onUploadComplete('');
                toast({ title: 'Image Removed' });
            })
            .catch((error) => {
                console.error('Error removing image:', error);
                // If it fails, maybe the URL is not from storage. Still clear it from the form.
                if (error.code === 'storage/object-not-found' || error.code === 'storage/invalid-argument') {
                    onUploadComplete('');
                    toast({ title: 'Image Cleared', description: 'The image URL has been cleared from the form.' });
                } else {
                    toast({
                        title: 'Error',
                        description: 'Could not remove the image from storage.',
                        variant: 'destructive',
                    });
                }
            });
    } catch (error) {
        // This can happen if the URL is not a valid storage URL.
        // In this case, just clear the field.
        onUploadComplete('');
        toast({ title: 'Image URL Cleared' });
    }
  };


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50
      ${isDragActive ? 'border-primary bg-primary/10' : ''}
      ${currentImageUrl || isUploading ? 'h-48' : 'h-32'}`}
    >
      <input {...getInputProps()} />

      {isUploading && uploadProgress !== null && (
        <div className="flex w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <UploadCloud className="h-8 w-8" />
          <p>Uploading...</p>
          <Progress value={uploadProgress} className="w-full" />
          <p>{Math.round(uploadProgress)}%</p>
        </div>
      )}

      {!isUploading && currentImageUrl && (
        <>
          <Image src={currentImageUrl} alt="Current product image" fill style={{ objectFit: 'contain' }} className="rounded-md" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 z-10 h-7 w-7"
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity hover:opacity-100">
             <p className="text-white">Click or drag to replace</p>
          </div>
        </>
      )}

      {!isUploading && !currentImageUrl && (
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          {isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <p>Drag & drop an image, or click to select</p>
          )}
        </div>
      )}
    </div>
  );
}
