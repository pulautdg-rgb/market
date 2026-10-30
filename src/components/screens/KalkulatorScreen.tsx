import React from 'react';
import { CashierCalculator } from '../common/CashierCalculator';
import { NavMenuId } from '../../types';

interface KalkulatorScreenProps {
  onNavigate?: (tab: NavMenuId) => void;
}

export const KalkulatorScreen: React.FC<KalkulatorScreenProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 md:p-6 pb-28 min-h-screen text-[#111c2d]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[28px]">
              calculate
            </span>
            <h1 className="font-headline-md font-bold text-2xl text-[#111c2d]">
              Kalkulator Kasir
            </h1>
          </div>
          <p className="text-xs text-[#424844] mt-1">
            Kalkulator retail cerdas untuk hitung cepat kembalian, pecahan uang rupiah, margin laba, diskon, dan grosir
          </p>
        </div>

        {onNavigate && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('kasir')}
              className="px-4 py-2 rounded-xl bg-[#006c4a] hover:bg-[#005237] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              <span>Buka Kasir POS</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Calculator, Right Store Helper Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Main Interactive Calculator (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md">
            <CashierCalculator />
          </div>
        </div>

        {/* Right Column: Shortcuts & Quick Reference (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Keyboard Shortcuts Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e7eeff] shadow-sm">
            <h3 className="font-bold text-sm text-[#111c2d] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[18px]">
                keyboard
              </span>
              Pintasan Keyboard Komputer
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Angka 0 - 9 & Titik (.)</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-[11px]">
                  0 - 9, .
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Operasi Hitung (+, -, *, /)</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-[11px]">
                  + - * /
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Sama Dengan (Hasil Akhir)</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-[11px]">
                  Enter atau =
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Hapus Satu Digit Terakhir</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-[11px]">
                  Backspace
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Reset Semua / Hapus (C)</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-[11px]">
                  Escape (Esc)
                </kbd>
              </div>
            </div>
          </div>

          {/* Sembako Margin Reference */}
          <div className="bg-white rounded-2xl p-5 border border-[#e7eeff] shadow-sm">
            <h3 className="font-bold text-sm text-[#111c2d] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[18px]">
                store
              </span>
              Panduan Margin Standar Toko Sembako
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Beras & Gula Pasir</p>
                  <p className="text-[10px] text-gray-500">Komoditas pokok perputaran cepat</p>
                </div>
                <span className="font-bold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-1 rounded-lg">
                  5% - 8%
                </span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Minyak Goreng Kemasan</p>
                  <p className="text-[10px] text-gray-500">Bimoli, SunCo, Tropical</p>
                </div>
                <span className="font-bold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-1 rounded-lg">
                  6% - 10%
                </span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Mie Instan & Tepung</p>
                  <p className="text-[10px] text-gray-500">Eceran & grosir karton</p>
                </div>
                <span className="font-bold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-1 rounded-lg">
                  8% - 14%
                </span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Bumbu & Perlengkapan Dapur</p>
                  <p className="text-[10px] text-gray-500">Kemasan sachet & bumbu racik</p>
                </div>
                <span className="font-bold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-1 rounded-lg">
                  15% - 25%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
