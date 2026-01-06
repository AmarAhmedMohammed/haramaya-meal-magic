import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RotateCw } from "lucide-react";

interface InlineScannerProps {
  onScan: (code: string) => void;
  isActive: boolean;
}

export function InlineScanner({ onScan, isActive }: InlineScannerProps) {
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "html5qr-code-full-region";
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
     try {
        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop();
            scannerRef.current.clear();
        }
     } catch(e) {
         console.warn("Error stopping scanner", e);
     }
     if (mountedRef.current) {
         setScanning(false);
     }
  }, []);

  const startScanner = useCallback(async () => {
    if (!mountedRef.current) return;
    setInitializing(true);
    setError("");

    try {
        // Ensure clean slate
        await stopScanner();

        // Create instance if not exists
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(regionId);
        }

        const config = {
             fps: 10,
             qrbox: { width: 250, height: 250 },
             aspectRatio: 1.0
        };

        // Prefer environment camera
        await scannerRef.current.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
                // Success callback
                onScan(decodedText);
            },
            (errorMessage) => {
                // Ignore parse errors
            }
        );

        if (mountedRef.current) {
            setScanning(true);
            setInitializing(false);
        }

    } catch (err: any) {
        if (mountedRef.current) {
            setInitializing(false);
            console.error("Error starting html5-qrcode:", err);
            setError("Camera error: " + (err?.message || "Could not start camera"));
        }
    }
  }, [onScan, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;

    if (isActive) {
        // slight delay to ensure DOM is ready
        setTimeout(() => startScanner(), 100);
    }

    return () => {
        mountedRef.current = false;
        // Cleanup is crucial
        if (scannerRef.current) {
             try {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current?.clear();
                    }).catch(console.error);
                } else {
                    scannerRef.current.clear();
                }
             } catch (e) {
                 console.error("Cleanup error", e);
             }
        }
    };
  }, [isActive, startScanner]);

  const handleRetry = () => {
    startScanner();
  };

  return (
    <Card className="overflow-hidden border border-border shadow-md bg-white">
      {/* Header - Matching Reference */}
      <div className="py-4 border-b border-gray-100 text-center">
        <h3 className="text-xl font-bold text-[#006d5b]">
          Student ID Scanner
        </h3>
      </div>

      <div className="relative p-2">
        {/* Camera View Container - Square Aspect Ratio */}
        <div 
          className="relative bg-black rounded-lg overflow-hidden aspect-square w-full max-w-[400px] mx-auto shadow-inner"
        >
           {/* The html5-qrcode library needs a div with an ID */}
           <div id={regionId} className="w-full h-full text-[0px]" />

          {/* Loading / Error States - Overlaying the scanner div */}
          {!scanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 bg-zinc-900 z-20">
              {initializing ? (
                <>
                   <RotateCw className="w-8 h-8 animate-spin" />
                   <p>Starting Camera...</p>
                </>
              ) : (
                <p>Camera is paused</p>
              )}
            </div>
          )}
          
          {error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center bg-zinc-900 z-20">
               <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
               <p className="text-red-400 font-medium mb-4">{error}</p>
               <Button onClick={handleRetry} variant="secondary" size="sm">
                 Retry Camera
               </Button>
             </div>
          )}

          {/* UI Overlay (When Scanning) - Purely cosmetic over the video */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none z-10">
              
              {/* Central Active Area */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px]">
                {/* White Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-[4px] border-t-[4px] border-white" />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-[4px] border-t-[4px] border-white" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-[4px] border-b-[4px] border-white" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-[4px] border-b-[4px] border-white" />

                {/* Animated Green Scan Line */}
                 <div className="absolute left-0 right-0 h-[2px] bg-[#22c55e] shadow-[0_0_10px_#22c55e] animate-scan-move" />
              </div>
            </div>
          )}
          
          <style>{`
            @keyframes scan-move {
              0% { top: 0; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scan-move {
              animation: scan-move 2s linear infinite;
            }
            #html5qr-code-full-region video {
                object-fit: cover !important;
                border-radius: 0.5rem;
            }
          `}</style>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 max-w-[400px] mx-auto w-full">
        {scanning ? (
           <Button 
            variant="destructive" 
            className="w-full h-12 text-lg font-medium bg-[#ef4444] hover:bg-[#dc2626] shadow-sm rounded-md"
            onClick={stopScanner}
          >
            Stop Scanning
          </Button>
        ) : (
           <Button 
            className="w-full h-12 text-lg font-medium bg-[#006d5b] hover:bg-[#005a4b] text-white shadow-sm rounded-md"
            onClick={() => startScanner()}
            disabled={initializing}
          >
            {initializing ? "Starting..." : "Start Scanning"}
          </Button>
        )}
      </div>
    </Card>
  );
}
