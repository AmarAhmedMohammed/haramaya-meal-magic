import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
} from "@zxing/library";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, RefreshCw, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateStudentBarcode } from "@/lib/mealLogic";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function BarcodeScanner({
  onScan,
  isProcessing = false,
  disabled = false,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanConfidence, setScanConfidence] = useState(0);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopScanning = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setCameraReady(false);
    setScanConfidence(0);
  }, []);

  // Image preprocessing for better barcode detection
  const preprocessImage = useCallback(
    (canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply contrast enhancement and sharpening for faded barcodes
      // 1. Increase contrast
      const contrast = 1.5;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale with weighted average
        const gray =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Apply contrast
        const enhanced = factor * (gray - 128) + 128;
        const value = Math.max(0, Math.min(255, enhanced));

        data[i] = value; // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
      }

      // Apply sharpening kernel for better edge detection
      const sharpened = new Uint8ClampedArray(data.length);
      const width = canvas.width;
      const height = canvas.height;

      // Simple sharpening kernel
      const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const pixel = ((y + ky) * width + (x + kx)) * 4;
              const weight = kernel[(ky + 1) * 3 + (kx + 1)];
              sum += data[pixel] * weight;
            }
          }
          const idx = (y * width + x) * 4;
          const value = Math.max(0, Math.min(255, sum));
          sharpened[idx] = value;
          sharpened[idx + 1] = value;
          sharpened[idx + 2] = value;
          sharpened[idx + 3] = 255;
        }
      }

      // Put enhanced image back
      for (let i = 0; i < data.length; i++) {
        data[i] = sharpened[i] || data[i];
      }

      ctx.putImageData(imageData, 0, 0);
    },
    []
  );

  const startScanning = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || disabled) return;

    try {
      setError(null);
      setIsScanning(true);

      // Request HIGH RESOLUTION camera for long-distance scanning
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920, max: 3840 }, // High resolution
          height: { ideal: 1080, max: 2160 },
          aspectRatio: { ideal: 16 / 9 },
          frameRate: { ideal: 60, min: 30 }, // High frame rate
          focusMode: "continuous" as any, // Continuous autofocus
          exposureMode: "continuous" as any, // Auto exposure
          whiteBalanceMode: "continuous" as any, // Auto white balance
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            resolve();
          };
        }
      });

      // Set canvas size to match video
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      setCameraReady(true);

      // Initialize barcode reader with CODE 128 PRIORITY for student IDs
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128, // PRIMARY - Student ID format
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.ITF,
        BarcodeFormat.CODABAR,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true); // Exhaustive search
      hints.set(DecodeHintType.PURE_BARCODE, false); // Allow imperfect barcodes
      hints.set(DecodeHintType.ALSO_INVERTED, true); // Try inverted colors

      const reader = new BrowserMultiFormatReader(hints);
      readerRef.current = reader;

      let consecutiveFailures = 0;
      const MAX_FAILURES = 5;

      // Multi-pass scanning loop with preprocessing
      const decodeLoop = async () => {
        if (!readerRef.current || !videoRef.current || !canvasRef.current)
          return;

        try {
          // Method 1: Direct video decode (fastest)
          let result = null;
          try {
            result = await reader.decodeFromVideoElement(videoRef.current);
          } catch (e) {
            // Method 2: Preprocessed canvas decode (better for faded barcodes)
            preprocessImage(canvasRef.current, videoRef.current);
            try {
              result = await reader.decodeFromCanvas(canvasRef.current);
            } catch (e2) {
              // No barcode found
            }
          }

          if (result && !cooldownRef.current && !isProcessing) {
            const barcodeText = result.getText().trim();

            // Update confidence indicator
            setScanConfidence(100);
            consecutiveFailures = 0;

            // Validate barcode format
            if (
              validateStudentBarcode(barcodeText) &&
              barcodeText !== lastScannedRef.current
            ) {
              lastScannedRef.current = barcodeText;
              cooldownRef.current = true;

              onScan(barcodeText);

              // Cooldown for rapid scanning
              setTimeout(() => {
                cooldownRef.current = false;
                lastScannedRef.current = "";
                setScanConfidence(0);
              }, 1500);
            }
          } else {
            // Gradual confidence decrease
            consecutiveFailures++;
            setScanConfidence(Math.max(0, 100 - consecutiveFailures * 5));
          }
        } catch (err) {
          consecutiveFailures++;
          setScanConfidence(Math.max(0, 100 - consecutiveFailures * 5));
        }

        // Continue high-frequency scanning
        if (readerRef.current) {
          animationFrameRef.current = requestAnimationFrame(decodeLoop);
        }
      };

      decodeLoop();
    } catch (err: any) {
      console.error("Scanner error:", err);
      if (err.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera permission and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError(
          "Failed to access camera. Please ensure camera permissions are granted."
        );
      }
      setIsScanning(false);
    }
  }, [onScan, isProcessing, disabled, preprocessImage]);

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
          autoPlay
        />

        {/* Hidden canvas for preprocessing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning Overlay */}
        {isScanning && cameraReady && (
          <>
            <div className="scanner-overlay" />
            <div className="scan-line" />

            {/* Enhanced corner brackets with glow */}
            <div className="absolute inset-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-accent rounded-tl-lg shadow-lg shadow-accent/50" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-accent rounded-tr-lg shadow-lg shadow-accent/50" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-accent rounded-bl-lg shadow-lg shadow-accent/50" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-accent rounded-br-lg shadow-lg shadow-accent/50" />

              {/* Center target indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Target className="w-8 h-8 text-accent animate-pulse" />
              </div>
            </div>

            {/* Confidence meter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      scanConfidence > 70
                        ? "bg-success"
                        : scanConfidence > 40
                        ? "bg-warning"
                        : "bg-muted-foreground"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${scanConfidence}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground min-w-[3ch]">
                  {scanConfidence > 0 ? `${Math.round(scanConfidence)}%` : "--"}
                </span>
              </div>
            </div>

            {/* Distance guidance */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-medium text-center">
              <p className="text-accent">📱 Hold steady • 30-70cm distance</p>
              <p className="text-muted-foreground mt-0.5">
                Works with faded barcodes
              </p>
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
              className="absolute inset-0 bg-foreground/50 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="bg-card rounded-xl p-6 flex flex-col items-center gap-3 shadow-2xl">
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
            <p className="text-muted-foreground font-medium">
              Camera not active
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-xs text-center px-4">
              Enhanced scanner for Code 128 barcodes
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-destructive/10 p-6">
            <CameraOff className="w-16 h-16 text-destructive" />
            <p className="text-destructive font-medium text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Try Again
            </Button>
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
            disabled={disabled || !!error}
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

      {/* Enhanced Instructions */}
      <div className="mt-4 space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          Position the student ID barcode within the scanner frame
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>1920x1080 HD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Code 128 Optimized</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Faded Compatible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
