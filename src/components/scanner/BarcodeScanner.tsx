import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateCode39Barcode } from '@/lib/mealLogic';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function BarcodeScanner({ onScan, isProcessing = false, disabled = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string>('');
  const cooldownRef = useRef<boolean>(false);

  const startScanning = useCallback(async () => {
    if (!videoRef.current || disabled) return;

    try {
      setError(null);
      
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_39]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      const reader = new BrowserMultiFormatReader(hints);
      readerRef.current = reader;

      // Get video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoInputDevices.length === 0) {
        setError('No camera found');
        return;
      }

      // Prefer back camera on mobile devices
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const deviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      setIsScanning(true);

      reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result && !cooldownRef.current && !isProcessing) {
            const barcodeText = result.getText().toUpperCase();
            
            // Validate Code 39 format
            if (validateCode39Barcode(barcodeText) && barcodeText !== lastScannedRef.current) {
              lastScannedRef.current = barcodeText;
              cooldownRef.current = true;
              
              onScan(barcodeText);
              
              // Cooldown to prevent rapid duplicate scans
              setTimeout(() => {
                cooldownRef.current = false;
                lastScannedRef.current = '';
              }, 3000);
            }
          }
        }
      );

      setCameraReady(true);
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  }, [onScan, isProcessing, disabled]);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Scanner Container */}
      <div className="relative aspect-[4/3] bg-foreground/5 rounded-2xl overflow-hidden border-2 border-primary/20">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Scanning Overlay */}
        {isScanning && cameraReady && (
          <>
            <div className="scanner-overlay" />
            <div className="scan-line" />
            
            {/* Corner brackets */}
            <div className="absolute inset-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-accent rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-accent rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-accent rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-accent rounded-br-lg" />
            </div>
          </>
        )}

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/50 flex items-center justify-center"
            >
              <div className="bg-card rounded-xl p-6 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not scanning state */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/90">
            <Camera className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">Camera not active</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-destructive/10">
            <CameraOff className="w-16 h-16 text-destructive" />
            <p className="text-destructive font-medium text-center px-4">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center gap-4">
        {!isScanning ? (
          <Button
            variant="scan"
            size="xl"
            onClick={startScanning}
            disabled={disabled}
            className="min-w-48"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Scanning
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="lg"
            onClick={stopScanning}
            className="min-w-48"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            Stop Scanner
          </Button>
        )}
      </div>

      {/* Instructions */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Position the student ID barcode within the scanner frame
      </p>
    </div>
  );
}
