import React, { useState } from 'react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult?: (resultValue: number) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyResult
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [lastCalculated, setLastCalculated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (lastCalculated) {
      setDisplay(digit);
      setEquation('');
      setLastCalculated(false);
      return;
    }

    if (display === '0' && digit !== '.') {
      setDisplay(digit);
    } else if (digit === '.' && display.includes('.')) {
      return;
    } else {
      setDisplay((prev) => prev + digit);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
    setLastCalculated(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setLastCalculated(false);
  };

  const handleBackspace = () => {
    if (lastCalculated) {
      handleClear();
      return;
    }
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalculate = () => {
    if (!equation) return;
    try {
      const fullExpr = equation + display;
      // Sanitize input to only allowed numbers and operators
      if (!/^[\d\s+\-*/.()]+$/.test(fullExpr)) {
        setDisplay('Error');
        return;
      }
      // Calculate
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${fullExpr})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        // Round to 2 decimal places if needed
        const formatted = Math.round(result * 100) / 100;
        setDisplay(formatted.toString());
        setEquation(`${fullExpr} =`);
        setLastCalculated(true);
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleCopy = () => {
    const num = parseFloat(display);
    if (!isNaN(num)) {
      navigator.clipboard.writeText(num.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleApply = () => {
    const num = parseFloat(display);
    if (!isNaN(num) && onApplyResult) {
      onApplyResult(num);
      onClose();
    }
  };

  const numericVal = parseFloat(display);
  const displayFormatted = !isNaN(numericVal) ? numericVal.toLocaleString('id-ID') : display;

  return (
    <div className="fixed inset-0 z-50 bg-[#00130a]/65 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden flex flex-col border border-[#dee8ff] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-3.5 px-4 border-b border-[#e7eeff] flex items-center justify-between bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#82f5c1] text-[#00714e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">calculate</span>
            </span>
            <div>
              <h3 className="font-headline-md font-bold text-[#00130a] text-sm leading-tight">
                Kalkulator Kasir
              </h3>
              <p className="text-[10px] text-[#727974]">Timbangan Curah & Hitung Cepat</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white border border-[#dee8ff] flex items-center justify-center text-[#424844] hover:bg-[#e7eeff] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-[#00130a] text-white flex flex-col items-end justify-end h-24 select-none">
          <span className="text-xs text-[#85f8c4] font-mono h-4 overflow-hidden truncate">
            {equation}
          </span>
          <span className="font-mono text-2xl font-bold tracking-tight text-white mt-1 truncate max-w-full">
            {displayFormatted}
          </span>
        </div>

        {/* Keypad */}
        <div className="p-3 bg-[#f9f9ff] grid grid-cols-4 gap-1.5 select-none">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="h-11 rounded-xl bg-[#ffdad6] text-[#ba1a1a] font-bold text-sm hover:bg-[#ffcdd2] active:scale-95 transition-all cursor-pointer"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="h-11 rounded-xl bg-[#dee8ff] text-[#00130a] font-bold text-xs hover:bg-[#d8e3fb] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">backspace</span>
          </button>
          <button
            onClick={() => {
              const val = parseFloat(display);
              if (!isNaN(val)) setDisplay((val / 100).toString());
            }}
            className="h-11 rounded-xl bg-[#dee8ff] text-[#00130a] font-bold text-sm hover:bg-[#d8e3fb] active:scale-95 transition-all cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="h-11 rounded-xl bg-[#006c4a] text-white font-bold text-base hover:bg-[#005137] active:scale-95 transition-all cursor-pointer"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('*')}
            className="h-11 rounded-xl bg-[#006c4a] text-white font-bold text-base hover:bg-[#005137] active:scale-95 transition-all cursor-pointer"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="h-11 rounded-xl bg-[#006c4a] text-white font-bold text-base hover:bg-[#005137] active:scale-95 transition-all cursor-pointer"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="h-11 rounded-xl bg-[#006c4a] text-white font-bold text-base hover:bg-[#005137] active:scale-95 transition-all cursor-pointer"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('00')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-xs hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            00
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="h-11 rounded-xl bg-white border border-[#dee8ff] text-[#00130a] font-bold text-base hover:bg-[#e7eeff] active:scale-95 transition-all cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="h-11 rounded-xl bg-[#85f8c4] text-[#002114] font-bold text-lg hover:bg-[#68dba9] active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            =
          </button>
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-white border-t border-[#e7eeff] flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 h-9 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#00130a] text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 border border-[#dee8ff]"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>

          {onApplyResult && (
            <button
              onClick={handleApply}
              className="flex-1 h-9 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">
                input
              </span>
              <span>Gunakan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
