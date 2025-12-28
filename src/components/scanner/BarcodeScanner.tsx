import React, { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "@ericblade/quagga2";
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
  const videoRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanConfidence, setScanConfidence] = useState(0);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);
  const confidenceDecayRef = useRef<NodeJS.Timeout | null>(null);

  const stopScanning = useCallback(() => {
    try {
      Quagga.stop();
      Quagga.offDetected();
      Quagga.offProcessed();
    } catch (e) {
      // Already stopped
    }
    if (confidenceDecayRef.current) {
      clearInterval(confidenceDecayRef.current);
      confidenceDecayRef.current = null;
    }
    setIsScanning(false);
    setCameraReady(false);
    setScanConfidence(0);
  }, []);

  const startScanning = useCallback(async () => {
    if (!videoRef.current || disabled) return;

    try {
      setError(null);
      setIsScanning(true);

      // QuaggaJS Configuration - Optimized for Code 128 Student IDs
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: videoRef.current,
            constraints: {
              width: { min: 640, ideal: 1920, max: 3840 },
              height: { min: 480, ideal: 1080, max: 2160 },
              aspectRatio: { ideal: 16 / 9 },
              facingMode: "environment",
              frameRate: { min: 30, ideal: 60 },
            },
            area: {
              top: "20%",
              right: "10%",
              left: "10%",
              bottom: "20%",
            },
          },
          locator: {
            patchSize: "medium", // Balance speed vs accuracy
            halfSample: false, // Full resolution for distance scanning
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          frequency: 10, // 10 scans per second
          decoder: {
            readers: [
              "code_128_reader", // PRIMARY - Student ID format
              "code_39_reader", // Fallback
              "ean_reader",
            ],
            multiple: false,
          },
          locate: true, // Enable barcode locator for pre-detection
        },
        (err) => {
          if (err) {
            console.error("QuaggaJS initialization error:", err);

            if (err.name === "NotAllowedError") {
              setError(
                "Camera access denied. Please allow camera permission and try again."
              );
            } else if (err.name === "NotFoundError") {
              setError("No camera found on this device.");
            } else {
              setError("Failed to initialize scanner. Please try again.");
            }
            setIsScanning(false);
            return;
          }

          setCameraReady(true);
          Quagga.start();

          // Confidence decay interval
          confidenceDecayRef.current = setInterval(() => {
            setScanConfidence((prev) => Math.max(0, prev - 5));
          }, 300);

          // Detection handler - fires when barcode is successfully detected
          // MUST be registered AFTER Quagga.init completes
          Quagga.onDetected((result) => {
            if (
              !result ||
              !result.codeResult ||
              cooldownRef.current ||
              isProcessing
            )
              return;

            const barcode = result.codeResult.code?.trim();
            if (!barcode) return;

            // Calculate confidence from quality metrics
            const quality = result.codeResult.decodedCodes?.filter(
              (c: any) => c.error !== undefined
            );
            const avgError =
              quality?.reduce(
                (sum: number, code: any) => sum + (code.error || 0),
                0
              ) / (quality?.length || 1);
            const confidence = Math.round(
              Math.max(0, Math.min(100, (1 - avgError) * 100))
            );

            setScanConfidence(confidence);

            // Validate barcode format
            if (
              validateStudentBarcode(barcode) &&
              barcode !== lastScannedRef.current
            ) {
              lastScannedRef.current = barcode;
              cooldownRef.current = true;

              onScan(barcode);

              // Cooldown for rapid scanning
              setTimeout(() => {
                cooldownRef.current = false;
                lastScannedRef.current = "";
                setScanConfidence(0);
              }, 1500);
            }
          });

          // Processing handler - fires on each frame for feedback
          // MUST be registered AFTER Quagga.init completes
          Quagga.onProcessed((result) => {
            // Update confidence indicator based on barcode detection progress
            if (result && result.boxes) {
              // Barcode area detected but not yet decoded
              setScanConfidence((prev) => Math.min(70, prev + 10));
            }
          });
        }
      );
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
  }, [onScan, isProcessing, disabled]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Scanner Container */}
      <div className="relative aspect-[4/3] bg-foreground/5 rounded-2xl overflow-hidden border-2 border-primary/20">
        {/* QuaggaJS video element */}
        <div
          ref={videoRef}
          className="w-full h-full"
          style={{ position: "relative" }}
        >
          {/* QuaggaJS canvas will be injected here */}
        </div>

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
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30 flex items-center gap-2 z-10">
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-medium text-center z-10">
              <p className="text-accent">📱 Hold steady • 30-70cm distance</p>
              <p className="text-muted-foreground mt-0.5">
                QuaggaJS - Optimized for faded barcodes
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
              className="absolute inset-0 bg-foreground/50 flex items-center justify-center backdrop-blur-sm z-20"
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
              QuaggaJS - Enhanced Code 128 scanner
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
            <span>QuaggaJS Engine</span>
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
