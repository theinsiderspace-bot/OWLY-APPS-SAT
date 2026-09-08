import React, { useState } from "react";
import { X, Delete, RefreshCw, Eye } from "lucide-react";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState<string>("0");
  const [history, setHistory] = useState<string>("");
  const [activeMode, setActiveMode] = useState<"standard" | "graphing">("standard");
  const [graphFunc, setGraphFunc] = useState<string>("x^2 - 4");

  if (!isOpen) return null;

  const handleInput = (val: string) => {
    setDisplay((prev) => {
      if (prev === "0" && !["+", "-", "*", "/", "^", "."].includes(val)) {
        return val;
      }
      return prev + val;
    });
  };

  const handleClear = () => {
    setDisplay("0");
    setHistory("");
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const handleCalculate = () => {
    try {
      let expression = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(");

      // Evaluate safely
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${expression})`)();
      setHistory(display + " =");
      setDisplay(String(Number(result.toFixed(6))));
    } catch {
      setDisplay("Error");
    }
  };

  // Simple canvas plotting for SAT Graphing mode
  const renderGraphPoints = () => {
    const points: { x: number; y: number }[] = [];
    const width = 360;
    const height = 240;
    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    for (let px = 0; px <= width; px += 4) {
      const mathX = xMin + (px / width) * (xMax - xMin);
      try {
        let expr = graphFunc
          .replace(/x/g, `(${mathX})`)
          .replace(/\^/g, "**")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/sqrt/g, "Math.sqrt");
        // eslint-disable-next-line no-new-func
        const mathY = Function(`'use strict'; return (${expr})`)();
        if (typeof mathY === "number" && !isNaN(mathY) && isFinite(mathY)) {
          const py = height - ((mathY - yMin) / (yMax - yMin)) * height;
          if (py >= 0 && py <= height) {
            points.push({ x: px, y: py });
          }
        }
      } catch {
        // Skip point on error
      }
    }
    return points;
  };

  const graphPoints = activeMode === "graphing" ? renderGraphPoints() : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-indigo-400">SAT Scientific & Graphing Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setActiveMode("standard")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeMode === "standard" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Scientific
              </button>
              <button
                onClick={() => setActiveMode("graphing")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeMode === "graphing" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Graphing
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeMode === "standard" ? (
          <div className="p-4 space-y-3">
            {/* Display */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-right font-mono">
              <div className="text-xs text-slate-500 h-4">{history}</div>
              <div className="text-2xl font-bold tracking-wider text-slate-100 overflow-x-auto no-scrollbar">
                {display}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
              {/* Row 1 */}
              <button
                onClick={() => handleInput("sin(")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                sin
              </button>
              <button
                onClick={() => handleInput("cos(")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                cos
              </button>
              <button
                onClick={() => handleInput("tan(")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                tan
              </button>
              <button
                onClick={handleBackspace}
                className="p-2.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                AC
              </button>

              {/* Row 2 */}
              <button
                onClick={() => handleInput("sqrt(")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                √
              </button>
              <button
                onClick={() => handleInput("^2")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                x²
              </button>
              <button
                onClick={() => handleInput("^")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                xʸ
              </button>
              <button
                onClick={() => handleInput("(")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                (
              </button>
              <button
                onClick={() => handleInput(")")}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                )
              </button>

              {/* Row 3 */}
              <button
                onClick={() => handleInput("7")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                7
              </button>
              <button
                onClick={() => handleInput("8")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                8
              </button>
              <button
                onClick={() => handleInput("9")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                9
              </button>
              <button
                onClick={() => handleInput("÷")}
                className="p-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-sm font-bold"
              >
                ÷
              </button>
              <button
                onClick={() => handleInput("π")}
                className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                π
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handleInput("4")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                4
              </button>
              <button
                onClick={() => handleInput("5")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                5
              </button>
              <button
                onClick={() => handleInput("6")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                6
              </button>
              <button
                onClick={() => handleInput("×")}
                className="p-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-sm font-bold"
              >
                ×
              </button>
              <button
                onClick={() => handleInput("log(")}
                className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                log
              </button>

              {/* Row 5 */}
              <button
                onClick={() => handleInput("1")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                1
              </button>
              <button
                onClick={() => handleInput("2")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                2
              </button>
              <button
                onClick={() => handleInput("3")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                3
              </button>
              <button
                onClick={() => handleInput("-")}
                className="p-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-sm font-bold"
              >
                -
              </button>
              <button
                onClick={() => handleInput("ln(")}
                className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                ln
              </button>

              {/* Row 6 */}
              <button
                onClick={() => handleInput("0")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                0
              </button>
              <button
                onClick={() => handleInput(".")}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-sm"
              >
                .
              </button>
              <button
                onClick={() => handleInput("+")}
                className="p-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-sm font-bold"
              >
                +
              </button>
              <button
                onClick={handleCalculate}
                className="col-span-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold shadow-md shadow-indigo-900/40"
              >
                =
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">y =</span>
              <input
                type="text"
                value={graphFunc}
                onChange={(e) => setGraphFunc(e.target.value)}
                placeholder="e.g. 2*x + 3 or x^2 - 4"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Canvas Plot */}
            <div className="relative w-full h-[240px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Axes */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Grid lines */}
                {[-8, -6, -4, -2, 2, 4, 6, 8].map((val) => {
                  const gx = ((val + 10) / 20) * 360;
                  const gy = 240 - ((val + 10) / 20) * 240;
                  return (
                    <g key={val} className="stroke-slate-800/60" strokeWidth="1">
                      <line x1={gx} y1={0} x2={gx} y2={240} />
                      <line x1={0} y1={gy} x2={360} y2={gy} />
                    </g>
                  );
                })}
                {/* Main X and Y axis */}
                <line x1={180} y1={0} x2={180} y2={240} className="stroke-slate-600" strokeWidth="1.5" />
                <line x1={0} y1={120} x2={360} y2={120} className="stroke-slate-600" strokeWidth="1.5" />

                {/* Function Curve */}
                {graphPoints.length > 1 && (
                  <path
                    d={graphPoints.reduce(
                      (acc, curr, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`,
                      ""
                    )}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                  />
                )}
              </svg>
              <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
                X: [-10, 10] | Y: [-10, 10]
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400">Presets:</span>
              {["2*x + 3", "x^2 - 4", "3*x^2 - 6*x + 2", "-2*x + 7", "2^x"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setGraphFunc(preset)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
