import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
// import { faceRecognitionService, IImageWithFaces } from './FaceRecognitionService';
import styles from './ImageGalleryWithFaceRecognition.module.scss';

export interface IImageGalleryProps {
  galleryFolderUrl: string;
  siteUrl: string;
  listName: string;
}

type SearchMode = 'selection' | 'profile' | 'upload' | 'camera' | 'results';

export const ImageGalleryWithFaceRecognition: React.FC<IImageGalleryProps> = (props) => {
  const [allImages, setAllImages] = useState<any[]>([]);
  const [filteredImages, setFilteredImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mode, setMode] = useState<SearchMode>('selection');
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [capturedImagePreview, setCapturedImagePreview] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initializeGallery();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [props.galleryFolderUrl]);

  const initializeGallery = async () => {
    try {
      setIsLoading(true);
      setError('');
    //   await faceRecognitionService.loadModels();
      const images = await fetchGalleryImages();
    //   const processedImages = await faceRecognitionService.processGalleryImages(images);
    //   setAllImages(processedImages);
    //   setFilteredImages(processedImages);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing gallery:', err);
      setError('Failed to load gallery. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchGalleryImages = async (): Promise<string[]> => {
    try {
      const response = await fetch(
        `${props.siteUrl}/_api/web/GetFolderByServerRelativeUrl('${props.galleryFolderUrl}')/Files?$select=ServerRelativeUrl,Name&$filter=substringof('.jpg',Name) or substringof('.jpeg',Name) or substringof('.png',Name)`,
        {
          headers: {
            'Accept': 'application/json;odata=verbose'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      return data.d.results.map((file: any) => `${props.siteUrl}${file.ServerRelativeUrl}`);
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  };

  const getUserProfilePicture = async (): Promise<string> => {
    const response = await fetch(
      `${props.siteUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`,
      {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      }
    );
    const data = await response.json();
    return data.d.PictureUrl;
  };

  const handleProfilePictureSearch = async () => {
    try {
      setIsProcessing(true);
      setError('');
      setMode('profile');
      
      const profilePicUrl = await getUserProfilePicture();
      if (!profilePicUrl) {
        throw new Error('No profile picture found');
      }

    //   const matches = await faceRecognitionService.findMatchingImages(profilePicUrl, allImages, 0.6);
      
    //   setFilteredImages(matches);
      setMode('results');
      setIsProcessing(false);
    } catch (err) {
      console.error('Error with profile picture:', err);
      setError('Could not process profile picture. Please try another method.');
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    // Validate file
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setError('Please upload only JPG or PNG images');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process the image
    try {
      setIsProcessing(true);
      setError('');

    //   const matches = await faceRecognitionService.findMatchingImages(file, allImages, 0.6);

    //   if (matches.length === 0) {
    //     setError('No matching images found. Try a different photo with your face clearly visible.');
    //     setIsProcessing(false);
    //     return;
    //   }

    //   setFilteredImages(matches);
      setMode('results');
      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing uploaded image:', err);
      setError('Failed to process image. Please ensure the photo shows your face clearly.');
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsProcessing(true);
      setError('');

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(video, 0, 0);
      
      // Get preview
      const previewUrl = canvas.toDataURL('image/jpeg');
      setCapturedImagePreview(previewUrl);

      // Convert to blob and process
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg');
      });
      
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

    //   const matches = await faceRecognitionService.findMatchingImages(file, allImages, 0.6);

    //   if (matches.length === 0) {
    //     setError('No matching images found. Try again with better lighting or clearer face visibility.');
    //     setIsProcessing(false);
    //     return;
    //   }

    //   setFilteredImages(matches);
      setMode('results');
      setIsProcessing(false);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo. Please try again.');
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImagePreview('');
    startCamera();
  };

  const handleDownload = async (image: any) => {
    try {
    //   await faceRecognitionService.downloadImage(image.url, image.fileName);
    } catch (err) {
      console.error('Error downloading image:', err);
      alert('Failed to download image');
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsProcessing(true);
    //   await faceRecognitionService.downloadMultipleImages(filteredImages);
      setIsProcessing(false);
      alert(`Downloaded ${filteredImages.length} images`);
    } catch (err) {
      console.error('Error downloading images:', err);
      setIsProcessing(false);
      alert('Failed to download some images');
    }
  };

  const resetToSelection = () => {
    setMode('selection');
    setFilteredImages(allImages);
    setError('');
    setUploadedImagePreview('');
    setCapturedImagePreview('');
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const viewAllImages = () => {
    setMode('results');
    setFilteredImages(allImages);
    setError('');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading gallery and processing images...</p>
        <p className={styles.subText}>This may take a moment while we analyze faces in photos</p>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      {/* Selection Mode */}
      {mode === 'selection' && (
        <div className={styles.selectionMode}>
          <h1 className={styles.title}>Face Recognition</h1>
          <p className={styles.subtitle}>Find photos where you appear</p>

          <div className={styles.methodCards}>
            <div className={styles.methodCard} onClick={handleProfilePictureSearch}>
              <div className={styles.methodIcon}>👤</div>
              <h3>Use Profile Picture</h3>
              <p>Search using your SharePoint profile photo</p>
            </div>

            <div className={styles.methodCard} onClick={() => setMode('upload')}>
              <div className={styles.methodIcon}>📁</div>
              <h3>Upload a Picture</h3>
              <p>Upload an image from your device</p>
            </div>

            <div className={styles.methodCard} onClick={startCamera}>
              <div className={styles.methodIcon}>📷</div>
              <h3>Capture Your Image</h3>
              <p>Take a photo using your camera</p>
            </div>
          </div>

          <button className={styles.viewAllBtn} onClick={viewAllImages}>
            View All Images ({allImages.length})
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className={styles.uploadMode}>
          <button className={styles.backBtn} onClick={resetToSelection}>
            ← Back
          </button>

          <h1 className={styles.title}>Face Recognition</h1>
          <p className={styles.subtitle}>File picker modal opens (jpg/png only, &lt;5MB)</p>

          <div 
            className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedImagePreview ? (
              <div className={styles.previewContainer}>
                <img src={uploadedImagePreview} alt="Preview" className={styles.preview} />
                <p className={styles.fileName}>Image uploaded successfully</p>
              </div>
            ) : (
              <>
                <div className={styles.uploadIcon}>
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <circle cx="30" cy="30" r="30" fill="#f0f0f0"/>
                    <path d="M30 20C25 20 21 24 21 29C21 30 21 31 21.5 32L23 31.5C22.5 30.5 22.5 29.5 22.5 29C22.5 25 25.5 21.5 30 21.5C34.5 21.5 37.5 25 37.5 29C37.5 29.5 37.5 30.5 37 31.5L38.5 32C39 31 39 30 39 29C39 24 35 20 30 20Z" fill="#c8766b"/>
                    <circle cx="26" cy="27" r="2" fill="#c8766b"/>
                    <circle cx="34" cy="27" r="2" fill="#c8766b"/>
                    <path d="M30 33C28 33 26.5 31.5 26 30H25C25.5 32 27.5 34 30 34C32.5 34 34.5 32 35 30H34C33.5 31.5 32 33 30 33Z" fill="#c8766b"/>
                  </svg>
                </div>
                <p className={styles.dropText}>
                  Drag an image or <span className={styles.uploadLink}>Upload a file</span>
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />

          {error && <div className={styles.error}>{error}</div>}
          {isProcessing && (
            <div className={styles.processingInline}>
              <div className={styles.spinner}></div>
              <p>Processing your image...</p>
            </div>
          )}
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className={styles.cameraMode}>
          <button className={styles.backBtn} onClick={resetToSelection}>
            ← Back
          </button>

          <h1 className={styles.title}>Capture Your Image</h1>
          <p className={styles.subtitle}>Position your face in the frame and click capture</p>

          {capturedImagePreview ? (
            <div className={styles.capturePreview}>
              <img src={capturedImagePreview} alt="Captured" />
              <div className={styles.captureActions}>
                <button className={styles.retakeBtn} onClick={retakePhoto}>
                  🔄 Retake Photo
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.cameraContainer}>
              <video ref={videoRef} autoPlay playsInline className={styles.video}></video>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              <button 
                className={styles.captureBtn} 
                onClick={capturePhoto}
                disabled={isProcessing}
              >
                <div className={styles.captureBtnInner}></div>
              </button>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {isProcessing && (
            <div className={styles.processingInline}>
              <div className={styles.spinner}></div>
              <p>Processing your photo...</p>
            </div>
          )}
        </div>
      )}

      {/* Results Mode */}
      {mode === 'results' && (
        <div className={styles.resultsMode}>
          <div className={styles.resultsHeader}>
            <button className={styles.backBtn} onClick={resetToSelection}>
              ← Find Me
            </button>
            <div className={styles.resultsInfo}>
              {filteredImages.length < allImages.length ? (
                <>
                  <h2>Found {filteredImages.length} photo(s) with your face! 🎉</h2>
                  <div className={styles.headerActions}>
                    <button onClick={handleDownloadAll} className={styles.downloadAllBtn}>
                      ⬇ Download All ({filteredImages.length})
                    </button>
                    <button onClick={viewAllImages} className={styles.viewAllImagesBtn}>
                      View All Photos ({allImages.length})
                    </button>
                  </div>
                </>
              ) : (
                <h2>All Gallery Images ({allImages.length})</h2>
              )}
            </div>
          </div>

          {filteredImages.length === 0 ? (
            <div className={styles.noResults}>
              <p>😔 No images found</p>
              <button onClick={resetToSelection} className={styles.tryAgainBtn}>
                Try Again
              </button>
            </div>
          ) : (
            <div className={styles.imageGrid}>
              {filteredImages.map((image, index) => (
                <div key={index} className={styles.imageCard}>
                  <img 
                    src={image.url} 
                    alt={image.fileName}
                    onClick={() => setSelectedImage(image)}
                    className={styles.thumbnail}
                  />
                  {image.isMatch && (
                    <div className={styles.matchBadge}>
                      ✓ {image.matchConfidence}% Match
                    </div>
                  )}
                  <div className={styles.imageActions}>
                    <button 
                      onClick={() => handleDownload(image)}
                      className={styles.downloadBtn}
                    >
                      ⬇ Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage.url} alt={selectedImage.fileName} />
            <div className={styles.lightboxActions}>
              <button onClick={() => handleDownload(selectedImage)}>
                ⬇ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};