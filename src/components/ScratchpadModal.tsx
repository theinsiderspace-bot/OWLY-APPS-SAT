import React, { useRef, useState, useEffect } from "react";
import { X, Eraser, PenTool, RotateCcw, Download } from "lucide-react";

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#1e293b");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<"draw" | "notes">("draw");
  const [notesText, setNotesText] = useState<string>("");

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // preserve background
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-800">SAT Scratchpad & Scratch Paper</span>
            <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs">
              <button
                onClick={() => setActiveTab("draw")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "draw" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                }`}
              >
                Canvas Pen
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "notes" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600"
                }`}
              >
                Scratch Notes
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === "draw" ? (
          <div className="p-4 space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Color:</span>
                {["#1e293b", "#2563eb", "#dc2626", "#16a34a"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      color === c ? "scale-110 border-slate-900 shadow-xs" : "border-white"
                    }`}
                  />
                ))}
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <span className="text-xs text-slate-500 font-medium">Size:</span>
                {[2, 4, 8].map((size) => (
                  <button
                    key={size}
                    onClick={() => setLineWidth(size)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      lineWidth === size ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Drawing Canvas */}
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={600}
                height={350}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[350px] touch-none"
              />
              <div className="absolute top-2 right-2 text-[10px] text-slate-400 select-none pointer-events-none">
                Grid / Draft Canvas
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Type your intermediate calculations, algebra steps, or reading notes here..."
              className="w-full h-[350px] p-4 text-sm font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
