import React, { useState, useEffect, useCallback } from 'react';
import { calculateCashBreakdown } from '../../utils/barcodeUtils';

interface CashierCalculatorProps {
  initialTotalDue?: number;
  onApplyTendered?: (amount: number) => void;
  onApplyDiscount?: (discountAmount: number) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export type CalcTab = 'standard' | 'kembalian' | 'margin' | 'diskon' | 'grosir';

export const CashierCalculator: React.FC<CashierCalculatorProps> = ({
  initialTotalDue = 0,
  onApplyTendered,
  onApplyDiscount,
  onClose,
  isModal = false
}) => {
  const [activeTab, setActiveTab] = useState<CalcTab>('standard');

  // Standard Calculator State
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [equationHistory, setEquationHistory] = useState<string>('');
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);

  // Tab 2: Kembalian State
  const [billAmount, setBillAmount] = useState<number>(initialTotalDue || 128000);
  const [cashTendered, setCashTendered] = useState<number>(150000);

  // Tab 3: Margin & Markup State
  const [hppInput, setHppInput] = useState<number>(25000);
  const [sellingPriceInput, setSellingPriceInput] = useState<number>(30000);

  // Tab 4: Diskon State
  const [discountBasePrice, setDiscountBasePrice] = useState<number>(100000);
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [discountNominal, setDiscountNominal] = useState<number>(10000);

  // Tab 5: Grosir vs Ecer State
  const [cartonPrice, setCartonPrice] = useState<number>(118000);
  const [cartonUnits, setCartonUnits] = useState<number>(40);
  const [singleRetailPrice, setSingleRetailPrice] = useState<number>(3100);

  // Standard Calculator operations
  const handleDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplayValue(digit);
        setWaitingForOperand(false);
      } else {
        setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
      }
    },
    [displayValue, waitingForOperand]
  );

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  }, [displayValue, waitingForOperand]);

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setEquationHistory('');
    setPrevValue(null);
    setPendingOperator(null);
    setWaitingForOperand(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue('0');
    }
  }, [displayValue, waitingForOperand]);

  const calculateResult = (first: number, second: number, operator: string): number => {
    switch (operator) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
      case '*':
        return first * second;
      case '÷':
      case '/':
        return second === 0 ? 0 : first / second;
      default:
        return second;
    }
  };

  const handleOperator = useCallback(
    (nextOperator: string) => {
      const current = parseFloat(displayValue);

      if (prevValue === null) {
        setPrevValue(current);
        setEquationHistory(`${current} ${nextOperator}`);
      } else if (pendingOperator) {
        const result = calculateResult(prevValue, current, pendingOperator);
        setDisplayValue(String(result));
        setPrevValue(result);
        setEquationHistory(`${result} ${nextOperator}`);
      }

      setWaitingForOperand(true);
      setPendingOperator(nextOperator);
    },
    [displayValue, pendingOperator, prevValue]
  );

  const handlePercent = useCallback(() => {
    const current = parseFloat(displayValue);
    if (prevValue !== null && pendingOperator) {
      // Calculate percentage of prevValue
      const percentVal = (prevValue * current) / 100;
      setDisplayValue(String(percentVal));
    } else {
      setDisplayValue(String(current / 100));
    }
  }, [displayValue, pendingOperator, prevValue]);

  const handleEquals = useCallback(() => {
    const current = parseFloat(displayValue);
    if (prevValue !== null && pendingOperator) {
      const result = calculateResult(prevValue, current, pendingOperator);
      setEquationHistory(`${prevValue} ${pendingOperator} ${current} =`);
      setDisplayValue(String(result));
      setPrevValue(null);
      setPendingOperator(null);
      setWaitingForOperand(true);
    }
  }, [displayValue, pendingOperator, prevValue]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only listen if not typing in another input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        handlePercent();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handlePercent,
    handleEquals,
    handleBackspace,
    handleClear
  ]);

  // Calculations for other tabs
  const changeValue = Math.max(0, cashTendered - billAmount);
  const changeBreakdown = calculateCashBreakdown(changeValue);

  const profitRp = Math.max(0, sellingPriceInput - hppInput);
  const marginPercent =
    sellingPriceInput > 0 ? ((profitRp / sellingPriceInput) * 100).toFixed(1) : '0';
  const markupPercent = hppInput > 0 ? ((profitRp / hppInput) * 100).toFixed(1) : '0';

  const discountCalculatedAmount =
    discountType === 'percent'
      ? (discountBasePrice * discountPercent) / 100
      : discountNominal;
  const finalDiscountedPrice = Math.max(0, discountBasePrice - discountCalculatedAmount);

  const pricePerCartonUnit = cartonUnits > 0 ? cartonPrice / cartonUnits : 0;
  const totalRetailIfSoldSingle = singleRetailPrice * cartonUnits;
  const grossProfitPerCarton = totalRetailIfSoldSingle - cartonPrice;
  const savingsPerUnit = Math.max(0, singleRetailPrice - pricePerCartonUnit);

  return (
    <div className="w-full max-w-md mx-auto select-none">
      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#121815] rounded-xl mb-3 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('standard')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'standard'
              ? 'bg-[#006c4a] text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Standar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kembalian')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'kembalian'
              ? 'bg-[#006c4a] text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Kembalian
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('margin')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'margin'
              ? 'bg-[#006c4a] text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Margin Laba
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diskon')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'diskon'
              ? 'bg-[#006c4a] text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Diskon
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grosir')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'grosir'
              ? 'bg-[#006c4a] text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Grosir vs Ecer
        </button>
      </div>

      {/* Main Body per tab */}
      {activeTab === 'standard' && (
        <div className="bg-[#000000] rounded-2xl p-4 md:p-5 border border-neutral-800 shadow-2xl text-white">
          {/* Header Title like screenshot */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Kalkulator Kasir</span>
            {equationHistory && (
              <span className="font-mono text-gray-400 truncate max-w-[200px]">
                {equationHistory}
              </span>
            )}
          </div>

          {/* Large Result Display */}
          <div className="text-right py-4 px-2 mb-3 bg-[#0b0f0d] rounded-xl border border-neutral-900 min-h-[72px] flex flex-col justify-center">
            <span className="font-headline-lg font-black text-4xl md:text-5xl tracking-tight text-white truncate">
              {displayValue}
            </span>
          </div>

          {/* Calculator Buttons Grid (Matching User Screenshot Layout) */}
          <div className="grid grid-cols-4 gap-2 text-base md:text-lg font-bold">
            {/* Row 1: C, Backspace, %, ÷ */}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-full bg-[#202523] hover:bg-[#2d3431] text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              C
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-full bg-[#202523] hover:bg-[#2d3431] text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </button>
            <button
              type="button"
              onClick={handlePercent}
              className="h-14 rounded-full bg-[#202523] hover:bg-[#2d3431] text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              %
            </button>
            <button
              type="button"
              onClick={() => handleOperator('÷')}
              className={`h-14 rounded-full ${
                pendingOperator === '÷'
                  ? 'bg-[#006c4a] text-white'
                  : 'bg-[#1c2e25] text-[#85f8c4] hover:bg-[#233a2f]'
              } flex items-center justify-center transition-colors cursor-pointer active:scale-95`}
            >
              ÷
            </button>

            {/* Row 2: 7, 8, 9, × */}
            <button
              type="button"
              onClick={() => handleDigit('7')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleDigit('8')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleDigit('9')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleOperator('×')}
              className={`h-14 rounded-full ${
                pendingOperator === '×'
                  ? 'bg-[#006c4a] text-white'
                  : 'bg-[#1c2e25] text-[#85f8c4] hover:bg-[#233a2f]'
              } flex items-center justify-center transition-colors cursor-pointer active:scale-95`}
            >
              ×
            </button>

            {/* Row 3: 4, 5, 6, - */}
            <button
              type="button"
              onClick={() => handleDigit('4')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleDigit('5')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleDigit('6')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleOperator('-')}
              className={`h-14 rounded-full ${
                pendingOperator === '-'
                  ? 'bg-[#006c4a] text-white'
                  : 'bg-[#1c2e25] text-[#85f8c4] hover:bg-[#233a2f]'
              } flex items-center justify-center transition-colors cursor-pointer active:scale-95`}
            >
              -
            </button>

            {/* Row 4: 1, 2, 3, + */}
            <button
              type="button"
              onClick={() => handleDigit('1')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleDigit('2')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleDigit('3')}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleOperator('+')}
              className={`h-14 rounded-full ${
                pendingOperator === '+'
                  ? 'bg-[#006c4a] text-white'
                  : 'bg-[#1c2e25] text-[#85f8c4] hover:bg-[#233a2f]'
              } flex items-center justify-center transition-colors cursor-pointer active:scale-95`}
            >
              +
            </button>

            {/* Row 5: 0, ., = */}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 col-span-2 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95 pl-6"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDecimal}
              className="h-14 rounded-full bg-[#0d1210] hover:bg-[#1a211e] text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              .
            </button>
            <button
              type="button"
              onClick={handleEquals}
              className="h-14 rounded-full bg-[#006c4a] hover:bg-[#005237] text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg active:scale-95 font-black text-xl"
            >
              =
            </button>
          </div>

          {/* Quick Action to copy to Cashier */}
          {onApplyTendered && (
            <div className="mt-4 pt-3 border-t border-neutral-800 flex gap-2">
              <button
                type="button"
                onClick={() => onApplyTendered(parseFloat(displayValue) || 0)}
                className="flex-1 py-2.5 rounded-xl bg-[#85f8c4] text-[#002114] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#6be0ac] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                Salin ke Uang Diterima Kasir
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Uang Kembalian & Saran Pecahan Rupiah */}
      {activeTab === 'kembalian' && (
        <div className="bg-[#000000] rounded-2xl p-5 border border-neutral-800 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Hitung Kembalian & Pecahan Uang</span>
            <span className="text-[#85f8c4]">Saran Kasir</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 block mb-1">Total Tagihan (Belanja):</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1">Uang Diterima dari Pembeli:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick buttons for common money */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[50000, 100000, 150000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashTendered(amt)}
                  className="px-2 py-1 bg-[#1a211e] hover:bg-[#25302b] text-[#85f8c4] rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Rp {(amt / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCashTendered(billAmount)}
                className="px-2 py-1 bg-[#1a211e] hover:bg-[#25302b] text-gray-300 rounded-lg text-xs cursor-pointer"
              >
                Uang Pas
              </button>
            </div>
          </div>

          {/* Kembalian Display */}
          <div className="p-3 bg-[#0b0f0d] border border-neutral-900 rounded-xl text-center">
            <span className="text-xs text-gray-400">Total Uang Kembalian:</span>
            <p className="text-3xl font-black text-[#10b981] my-1">
              Rp {changeValue.toLocaleString('id-ID')}
            </p>
            {cashTendered < billAmount && (
              <p className="text-xs text-red-400 font-semibold">
                Uang kurang Rp {(billAmount - cashTendered).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Cash Breakdown */}
          {changeBreakdown.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-gray-400">Saran Pecahan Lembaran Uang:</span>
              <div className="grid grid-cols-2 gap-2">
                {changeBreakdown.map((item) => (
                  <div
                    key={item.denom}
                    className="p-2 bg-[#121815] rounded-lg border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-300 font-mono">{item.label}</span>
                    <span className="font-bold text-[#85f8c4] bg-[#006c4a]/30 px-1.5 py-0.5 rounded">
                      {item.count} lembar
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onApplyTendered && (
            <button
              type="button"
              onClick={() => onApplyTendered(cashTendered)}
              className="w-full py-2.5 rounded-xl bg-[#85f8c4] text-[#002114] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#6be0ac] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Terapkan Uang Diterima (Rp {cashTendered.toLocaleString('id-ID')})
            </button>
          )}
        </div>
      )}

      {/* Mode 3: Margin & Laba Toko */}
      {activeTab === 'margin' && (
        <div className="bg-[#000000] rounded-2xl p-5 border border-neutral-800 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Analisis Margin & Keuntungan</span>
            <span className="text-[#85f8c4]">Kalkulasi HPP</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 block mb-1">HPP / Harga Modal Beli:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                <input
                  type="number"
                  value={hppInput}
                  onChange={(e) => setHppInput(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1">Rencana Harga Jual Ecer:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                <input
                  type="number"
                  value={sellingPriceInput}
                  onChange={(e) => setSellingPriceInput(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-[#0b0f0d] rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-gray-400 block">Laba Kotor</span>
              <span className="text-sm font-bold text-[#10b981]">
                Rp {profitRp.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-[#0b0f0d] rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-gray-400 block">Margin</span>
              <span className="text-sm font-bold text-[#85f8c4]">{marginPercent}%</span>
            </div>
            <div className="p-3 bg-[#0b0f0d] rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] text-gray-400 block">Markup</span>
              <span className="text-sm font-bold text-amber-400">{markupPercent}%</span>
            </div>
          </div>

          <div className="p-3 bg-[#121815] rounded-xl border border-neutral-800 text-xs text-gray-300 space-y-1">
            <p>
              • <strong>Margin:</strong> Persentase keuntungan dari total harga jual.
            </p>
            <p>
              • <strong>Markup:</strong> Persentase kenaikan harga di atas modal pokok (HPP).
            </p>
          </div>
        </div>
      )}

      {/* Mode 4: Hitung Diskon */}
      {activeTab === 'diskon' && (
        <div className="bg-[#000000] rounded-2xl p-5 border border-neutral-800 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Hitung Diskon Promo</span>
            <div className="flex rounded bg-[#1a211e] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDiscountType('percent')}
                className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                  discountType === 'percent' ? 'bg-[#006c4a] text-white' : 'text-gray-400'
                }`}
              >
                % Persen
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('nominal')}
                className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                  discountType === 'nominal' ? 'bg-[#006c4a] text-white' : 'text-gray-400'
                }`}
              >
                Rp Nominal
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 block mb-1">Harga Awal Produk / Tagihan:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                <input
                  type="number"
                  value={discountBasePrice}
                  onChange={(e) => setDiscountBasePrice(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>

            {discountType === 'percent' ? (
              <div>
                <label className="text-xs text-gray-300 block mb-1">Persentase Diskon (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
                <div className="flex gap-2 mt-1.5">
                  {[5, 10, 15, 20, 50].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDiscountPercent(p)}
                      className="px-2 py-1 bg-[#1a211e] hover:bg-[#25302b] text-[#85f8c4] rounded text-xs cursor-pointer font-bold"
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-gray-300 block mb-1">Nominal Potongan Diskon:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                  <input
                    type="number"
                    value={discountNominal}
                    onChange={(e) => setDiscountNominal(Number(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#0b0f0d] border border-neutral-900 rounded-xl text-center space-y-1">
            <span className="text-xs text-gray-400">Harga Akhir Setelah Diskon:</span>
            <p className="text-2xl font-black text-[#10b981]">
              Rp {finalDiscountedPrice.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-amber-400 font-medium">
              Hemat: Rp {discountCalculatedAmount.toLocaleString('id-ID')}
            </p>
          </div>

          {onApplyDiscount && (
            <button
              type="button"
              onClick={() => onApplyDiscount(discountCalculatedAmount)}
              className="w-full py-2.5 rounded-xl bg-[#85f8c4] text-[#002114] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#6be0ac] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">percent</span>
              Salin Potongan Diskon (Rp {discountCalculatedAmount.toLocaleString('id-ID')})
            </button>
          )}
        </div>
      )}

      {/* Mode 5: Grosir vs Ecer */}
      {activeTab === 'grosir' && (
        <div className="bg-[#000000] rounded-2xl p-5 border border-neutral-800 shadow-2xl text-white space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Perbandingan Grosir vs Eceran</span>
            <span className="text-[#85f8c4]">Bongkar Dus</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 block mb-1">Harga 1 Dus / Karton:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Rp</span>
                <input
                  type="number"
                  value={cartonPrice}
                  onChange={(e) => setCartonPrice(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Isi Pcs per Dus:</label>
                <input
                  type="number"
                  value={cartonUnits}
                  onChange={(e) => setCartonUnits(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 block mb-1">Harga Eceran Satuan:</label>
                <input
                  type="number"
                  value={singleRetailPrice}
                  onChange={(e) => setSingleRetailPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0b0f0d] border border-neutral-800 rounded-xl text-white font-bold text-sm focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-[#0b0f0d] border border-neutral-900 rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-400">Modal Pokok per Pcs:</span>
              <span className="font-bold text-white text-sm">
                Rp {Math.round(pricePerCartonUnit).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-3 bg-[#0b0f0d] border border-neutral-900 rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-400">Total Omzet Eceran:</span>
              <span className="font-bold text-white text-sm">
                Rp {totalRetailIfSoldSingle.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-3 bg-[#121815] border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-[#85f8c4] font-semibold">Estimasi Laba per Dus:</span>
              <span className="font-extrabold text-[#10b981] text-base">
                +Rp {grossProfitPerCarton.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Close if Modal */}
      {isModal && onClose && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
          >
            Tutup Kalkulator
          </button>
        </div>
      )}
    </div>
  );
};
