import React, { useState } from 'react';
import { Expense, ShiftInfo } from '../../types';

interface LaporanScreenProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  shiftInfo: ShiftInfo;
  onCloseShift: (physicalCash: number) => void;
}

export const LaporanScreen: React.FC<LaporanScreenProps> = ({
  expenses,
  onAddExpense,
  shiftInfo,
  onCloseShift
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | 'month'>('today');

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);
  const [isPrintingShift, setIsPrintingShift] = useState(false);
  const [shiftCountInput, setShiftCountInput] = useState<number>(shiftInfo.physicalCash);

  // New Expense form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Operasional');

  // Multi-period financial simulations
  const financialData = {
    today: {
      netProfit: 1320000,
      netMargin: '15.7% Net',
      omzet: 8420000,
      omzetComparison: '+8.4% vs kemarin',
      hpp: 6890000,
      grossProfit: 1530000,
      grossMargin: 'Margin 18.2%',
      operationalCost: 210000,
      txCount: 142,
      avgTicket: 'Rp59.300 / struk',
      peakHours: 'Peak: 11:30 - 12:30 WIB',
      cashAmount: 4850000,
      cashPct: '57.6%',
      qrisAmount: 2670000,
      qrisPct: '31.7%',
      transferAmount: 900000,
      transferPct: '10.7%'
    },
    '7days': {
      netProfit: 9840000,
      netMargin: '16.2% Net',
      omzet: 60800000,
      omzetComparison: '+12.1% vs minggu lalu',
      hpp: 49500000,
      grossProfit: 11300000,
      grossMargin: 'Margin 18.5%',
      operationalCost: 1460000,
      txCount: 988,
      avgTicket: 'Rp61.500 / struk',
      peakHours: 'Peak: Sabtu 10:00 - 14:00',
      cashAmount: 34500000,
      cashPct: '56.7%',
      qrisAmount: 19800000,
      qrisPct: '32.5%',
      transferAmount: 6500000,
      transferPct: '10.8%'
    },
    month: {
      netProfit: 42500000,
      netMargin: '16.8% Net',
      omzet: 252000000,
      omzetComparison: '+15.4% MoM',
      hpp: 203800000,
      grossProfit: 48200000,
      grossMargin: 'Margin 19.1%',
      operationalCost: 5700000,
      txCount: 4120,
      avgTicket: 'Rp61.100 / struk',
      peakHours: 'Peak: Awal Bulan (Gajian)',
      cashAmount: 142000000,
      cashPct: '56.3%',
      qrisAmount: 82500000,
      qrisPct: '32.7%',
      transferAmount: 27500000,
      transferPct: '11.0%'
    }
  };

  const currentStats = financialData[period];

  // Handle Save Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    const amt = parseInt(expenseAmount, 10) || 0;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title: expenseTitle,
      amount: amt,
      category: expenseCategory,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      cashier: 'Budi Santoso'
    };

    onAddExpense(newExp);
    setShowExpenseModal(false);
    setExpenseTitle('');
    setExpenseAmount('');
  };

  // Close shift action
  const handleConfirmCloseShift = () => {
    setIsPrintingShift(true);
    setTimeout(() => {
      onCloseShift(shiftCountInput);
      setIsPrintingShift(false);
      setShowShiftCloseModal(false);
    }, 800);
  };

  // Export CSV
  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Kategori Laporan,Nilai (Rp),Keterangan\n' +
      `Omzet Penjualan Bersih,${currentStats.omzet},${currentStats.omzetComparison}\n` +
      `HPP Barang Terjual,${currentStats.hpp},Biaya pokok komoditas\n` +
      `Laba Kotor,${currentStats.grossProfit},${currentStats.grossMargin}\n` +
      `Beban Operasional,${currentStats.operationalCost},Listrik air plastik\n` +
      `Estimasi Laba Bersih,${currentStats.netProfit},${currentStats.netMargin}\n` +
      `Pembayaran Tunai,${currentStats.cashAmount},${currentStats.cashPct}\n` +
      `Pembayaran QRIS,${currentStats.qrisAmount},${currentStats.qrisPct}\n` +
      `Pembayaran Transfer Bank,${currentStats.transferAmount},${currentStats.transferPct}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Sembako_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Interactive Period Pill Bar */}
      <div className="px-gutter pt-3 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#dee8ff] rounded-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center font-label-md text-label-md transition-all cursor-pointer ${
              period === 'today'
                ? 'bg-[#00130a] text-white shadow-sm font-semibold'
                : 'text-[#424844] hover:text-[#111c2d]'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setPeriod('7days')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
              period === '7days'
                ? 'bg-[#00130a] text-white shadow-sm font-semibold'
                : 'text-[#424844] hover:text-[#111c2d]'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
              period === 'month'
                ? 'bg-[#00130a] text-white shadow-sm font-semibold'
                : 'text-[#424844] hover:text-[#111c2d]'
            }`}
          >
            Maret 2025
          </button>
        </div>
      </div>

      {/* Real-Time Sync & Time Indicator */}
      <div className="px-gutter flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#006c4a]">update</span>
          <span className="font-label-sm text-label-sm text-[#424844]">Update: 16:45 WIB • Shift Pagi</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] font-label-sm text-label-sm font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
          {currentStats.txCount} Transaksi
        </div>
      </div>

      {/* Primary Financial Spotlight (Laba Bersih Hero Card) */}
      <div className="px-gutter mb-4">
        <div className="relative overflow-hidden rounded-xl bg-[#00130a] text-white p-4 shadow-md">
          <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-[#006c4a]/25 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">
                    account_balance_wallet
                  </span>
                </div>
                <span className="font-label-md text-label-md text-[#cce9d8] uppercase tracking-wider font-semibold">
                  Estimasi Laba Bersih
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#002114] font-label-sm text-label-sm font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>{' '}
                {currentStats.netMargin}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-headline-xl-mobile text-headline-xl-mobile text-white font-bold tracking-tight">
                Rp {currentStats.netProfit.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Progress Flow Bar: Omzet -> HPP -> Beban -> Laba */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center font-label-sm text-label-sm text-[#cce9d8]">
                <span>Efisiensi Margin Usaha</span>
                <span className="font-semibold text-[#85f8c4]">81.8% Laba Ditahan</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden flex">
                <div className="h-full bg-[#85f8c4]" style={{ width: '15.7%' }}></div>
                <div className="h-full bg-[#ba1a1a]/70" style={{ width: '2.5%' }}></div>
                <div className="h-full bg-white/40" style={{ width: '81.8%' }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#b0cdbd]">
                <span>Laba Kotor Rp {currentStats.grossProfit.toLocaleString('id-ID')}</span>
                <span>Beban Toko Rp {currentStats.operationalCost.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="px-gutter grid grid-cols-2 gap-2.5 mb-4">
        {/* Omzet Penjualan Bersih */}
        <div className="p-3.5 rounded-xl bg-[#f0f3ff] shadow-sm flex flex-col justify-between border border-[#dee8ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm text-[#424844]">Omzet Bersih</span>
            <div className="w-6 h-6 rounded-md bg-[#82f5c1] flex items-center justify-center text-[#00714e]">
              <span className="material-symbols-outlined text-[15px]">storefront</span>
            </div>
          </div>
          <div>
            <div className="font-currency-display-mobile text-currency-display-mobile text-[#111c2d] font-bold tracking-tight">
              Rp {currentStats.omzet.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#006c4a] font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">north_east</span>
              <span>{currentStats.omzetComparison}</span>
            </div>
          </div>
        </div>

        {/* HPP Realized */}
        <div className="p-3.5 rounded-xl bg-[#f0f3ff] shadow-sm flex flex-col justify-between border border-[#dee8ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm text-[#424844]">HPP Barang Terjual</span>
            <div className="w-6 h-6 rounded-md bg-[#d8e3fb] flex items-center justify-center text-[#424844]">
              <span className="material-symbols-outlined text-[15px]">inventory</span>
            </div>
          </div>
          <div>
            <div className="font-currency-display-mobile text-currency-display-mobile text-[#111c2d] font-bold tracking-tight">
              Rp {currentStats.hpp.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#424844] font-label-sm text-label-sm">
              <span>81.8% dari Omzet</span>
            </div>
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="p-3.5 rounded-xl bg-[#f0f3ff] shadow-sm flex flex-col justify-between border border-[#dee8ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm text-[#424844]">Laba Kotor</span>
            <div className="w-6 h-6 rounded-md bg-[#cce9d8] flex items-center justify-center text-[#062016]">
              <span className="material-symbols-outlined text-[15px]">add_chart</span>
            </div>
          </div>
          <div>
            <div className="font-currency-display-mobile text-currency-display-mobile text-[#006c4a] font-bold tracking-tight">
              Rp {currentStats.grossProfit.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#424844] font-label-sm text-label-sm">
              <span className="px-1.5 py-0.2 rounded bg-[#dee8ff] font-semibold text-[#006c4a]">
                {currentStats.grossMargin}
              </span>
            </div>
          </div>
        </div>

        {/* Beban Operasional */}
        <div className="p-3.5 rounded-xl bg-[#f0f3ff] shadow-sm flex flex-col justify-between border border-[#dee8ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm text-[#424844]">Beban Operasional</span>
            <div className="w-6 h-6 rounded-md bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
              <span className="material-symbols-outlined text-[15px]">receipt</span>
            </div>
          </div>
          <div>
            <div className="font-currency-display-mobile text-currency-display-mobile text-[#ba1a1a] font-bold tracking-tight">
              Rp {currentStats.operationalCost.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#424844] font-label-sm text-label-sm truncate">
              <span>Listrik, Plastik & Ops</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Trend & Hourly Velocity Chart */}
      <div className="px-gutter mb-4">
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#e7eeff]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-[#111c2d] font-bold">
                Tren Penjualan Hari Ini
              </span>
              <span className="font-label-sm text-label-sm text-[#424844]">
                Grafik omzet per rentang waktu operasional
              </span>
            </div>
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">insights</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-32 w-full flex items-end justify-between gap-1.5 pt-4 pb-1">
            <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full bg-[#68dba9] rounded-t-sm transition-all group-hover:bg-[#006c4a]"
                style={{ height: '38%' }}
              ></div>
              <span className="font-label-sm text-label-sm text-[#424844] text-[10px]">07-09</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full bg-[#68dba9] rounded-t-sm transition-all group-hover:bg-[#006c4a]"
                style={{ height: '72%' }}
              ></div>
              <span className="font-label-sm text-label-sm text-[#424844] text-[10px]">09-11</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="w-full bg-[#006c4a] rounded-t-sm relative shadow-sm" style={{ height: '94%' }}>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-[#00130a] text-white text-[9px] font-bold">
                  Puncak
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-[#006c4a] font-bold text-[10px]">11-13</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full bg-[#68dba9] rounded-t-sm transition-all group-hover:bg-[#006c4a]"
                style={{ height: '52%' }}
              ></div>
              <span className="font-label-sm text-label-sm text-[#424844] text-[10px]">13-15</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full bg-[#68dba9] rounded-t-sm transition-all group-hover:bg-[#006c4a]"
                style={{ height: '68%' }}
              ></div>
              <span className="font-label-sm text-label-sm text-[#424844] text-[10px]">15-17</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="w-full bg-[#dee8ff] rounded-t-sm" style={{ height: '18%' }}></div>
              <span className="font-label-sm text-label-sm text-[#424844] text-[10px]">17-21</span>
            </div>
          </div>

          <div className="mt-2 pt-2 flex items-center justify-between border-t border-[#e7eeff] font-label-sm text-label-sm text-[#424844]">
            <span>Rata-rata: {currentStats.avgTicket}</span>
            <span className="text-[#006c4a] font-semibold">{currentStats.peakHours}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Metode Pembayaran Masuk Card */}
      <div className="px-gutter mb-4">
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#e7eeff]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-title-md text-title-md text-[#111c2d] font-bold">
                Metode Pembayaran Masuk
              </span>
              <p className="font-body-sm text-body-sm text-[#424844]">Distribusi aliran dana real-time</p>
            </div>
            <span className="material-symbols-outlined text-[#424844] text-[20px]">payments</span>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="h-3 w-full rounded-full bg-[#dee8ff] overflow-hidden flex mb-3">
            <div className="h-full bg-[#006c4a]" style={{ width: '57.6%' }} title="Tunai 57.6%"></div>
            <div className="h-full bg-[#68dba9]" style={{ width: '31.7%' }} title="QRIS 31.7%"></div>
            <div className="h-full bg-[#4a6457]" style={{ width: '10.7%' }} title="Transfer 10.7%"></div>
          </div>

          {/* Channel Detail Rows */}
          <div className="space-y-2.5">
            {/* Tunai */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#f0f3ff] border border-[#dee8ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#82f5c1] flex items-center justify-center text-[#00714e]">
                  <span className="material-symbols-outlined text-[18px]">local_atm</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-[#111c2d] font-semibold">
                    Tunai / Uang Pas & Kembalian
                  </div>
                  <div className="font-label-sm text-label-sm text-[#424844]">Kas fisik laci kasir</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-num text-mono-num font-bold text-[#111c2d]">
                  Rp {currentStats.cashAmount.toLocaleString('id-ID')}
                </div>
                <div className="font-label-sm text-label-sm text-[#006c4a] font-semibold">
                  {currentStats.cashPct}
                </div>
              </div>
            </div>

            {/* QRIS */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#f0f3ff] border border-[#dee8ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d8e3fb] flex items-center justify-center text-[#424844]">
                  <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-[#111c2d] font-semibold">
                    QRIS Statis & Dinamis
                  </div>
                  <div className="font-label-sm text-label-sm text-[#424844]">Settlement langsung H+0</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-num text-mono-num font-bold text-[#111c2d]">
                  Rp {currentStats.qrisAmount.toLocaleString('id-ID')}
                </div>
                <div className="font-label-sm text-label-sm text-[#424844] font-semibold">
                  {currentStats.qrisPct}
                </div>
              </div>
            </div>

            {/* Transfer Bank */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#f0f3ff] border border-[#dee8ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#dee8ff] flex items-center justify-center text-[#424844]">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-[#111c2d] font-semibold">
                    Transfer BCA & Mandiri
                  </div>
                  <div className="font-label-sm text-label-sm text-[#424844]">Verifikasi mutasi rekening</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-num text-mono-num font-bold text-[#111c2d]">
                  Rp {currentStats.transferAmount.toLocaleString('id-ID')}
                </div>
                <div className="font-label-sm text-label-sm text-[#424844] font-semibold">
                  {currentStats.transferPct}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Expenses Micro-Breakdown */}
      <div className="px-gutter mb-4">
        <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-title-md text-title-md text-[#111c2d] font-bold">
              Rincian Beban Operasional Hari Ini
            </span>
            <button
              type="button"
              onClick={() => setShowExpenseModal(true)}
              className="text-[#006c4a] font-label-sm text-label-sm font-semibold flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              + Catat Beban
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-2 rounded-lg bg-white border border-[#e7eeff]">
                <span className="font-label-sm text-label-sm text-[#424844] block truncate">
                  {exp.title}
                </span>
                <span className="font-mono-num text-mono-num font-bold text-[#111c2d]">
                  Rp {exp.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rekap Kasir Shift 1 */}
      <div className="px-gutter mb-4">
        <div className="p-4 rounded-xl bg-white shadow-sm border border-[#006c4a]/20">
          {/* Header Shift */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#e7eeff]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#85f8c4] flex items-center justify-center text-[#002114]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-title-md text-title-md text-[#111c2d] font-bold">
                    Rekap Kasir Shift 1
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-[#82f5c1] text-[#00714e] font-label-sm text-label-sm font-semibold">
                    {shiftInfo.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-[#424844]">
                  Kasir: Siti Nurhaliza • {shiftInfo.timeRange}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#c2c8c2]">lock_clock</span>
          </div>

          {/* Ledger Numbers */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <span className="text-[#424844]">Modal Awal Laci (Kas Awal)</span>
              <span className="font-mono-num text-mono-num font-medium text-[#111c2d]">
                Rp {shiftInfo.initialCash.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <span className="text-[#424844]">Penerimaan Penjualan Tunai</span>
              <span className="font-mono-num text-mono-num font-semibold text-[#006c4a]">
                +Rp {shiftInfo.cashSales.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <span className="text-[#424844]">Ekspektasi Uang di Laci</span>
              <span className="font-mono-num text-mono-num font-bold text-[#111c2d]">
                Rp {shiftInfo.expectedCash.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm font-body-sm">
              <span className="text-[#424844]">Kas Fisik Terhitung Kasir</span>
              <span className="font-mono-num text-mono-num font-bold text-[#111c2d]">
                Rp {shiftInfo.physicalCash.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Reconciliation Status Highlight */}
          <div className="p-3 rounded-lg bg-[#85f8c4]/30 flex items-center justify-between border border-[#82f5c1]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[22px]">check_circle</span>
              <div>
                <span className="font-label-md text-label-md text-[#002114] font-bold block">
                  Selisih Kas: Rp {shiftInfo.variance} (Pas/Seimbang)
                </span>
                <span className="font-label-sm text-label-sm text-[#005137]">
                  Seluruh fisik uang laci cocok dengan catatan sistem
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">verified</span>
          </div>
        </div>
      </div>

      {/* Primary Action Dock */}
      <div className="px-gutter flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setShowShiftCloseModal(true)}
          className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#00130a] hover:bg-[#0f291e] text-white font-headline-md text-headline-md font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">print</span>
          <span>Tutup Shift Sekarang & Cetak Rekap</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportPDF}
            className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#dee8ff] hover:bg-[#d8e3fb] text-[#111c2d] font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#424844]">description</span>
            <span>Ekspor PDF Nota</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#dee8ff] hover:bg-[#d8e3fb] text-[#111c2d] font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">table_view</span>
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: Catat Beban Operasional */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleSaveExpense}
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-[#111c2d]">Catat Beban Operasional</h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Keperluan / Nama Beban</label>
                <input
                  required
                  type="text"
                  placeholder="cth. Galon Air Minum Karyawan"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Kategori</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                >
                  <option>Operasional Toko</option>
                  <option>Listrik & Air</option>
                  <option>Plastik & Kemasan</option>
                  <option>Uang Makan Staff</option>
                  <option>Kebersihan & Keamanan</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Nominal Beban (Rp)</label>
                <input
                  required
                  type="number"
                  placeholder="cth. 25000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg font-mono text-sm border border-[#dee8ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#ba1a1a] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">receipt</span>
              Simpan Pengeluaran Kas
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: Konfirmasi Tutup Shift */}
      {showShiftCloseModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl transition-all">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e7eeff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#82f5c1] flex items-center justify-center text-[#00714e]">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <span className="font-headline-md text-headline-md text-[#111c2d] font-bold">
                  Konfirmasi Tutup Kas
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowShiftCloseModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#424844] hover:text-[#111c2d]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <p className="font-body-md text-body-md text-[#424844]">
                Anda akan mengunci transaksi <strong className="text-[#111c2d]">Shift 1</strong> dan mencetak
                slip pertanggungjawaban fisik ke printer thermal kasir.
              </p>

              <div className="p-3 rounded-xl bg-[#f0f3ff] space-y-1.5 border border-[#dee8ff]">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-[#424844]">Total Setoran Kas Fisik</span>
                  <span className="font-bold text-[#111c2d]">
                    Rp {shiftInfo.physicalCash.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-[#424844]">Status Selisih</span>
                  <span className="font-bold text-[#006c4a]">Rp0 (Seimbang Sempurna)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmCloseShift}
                disabled={isPrintingShift}
                className="w-full py-3.5 px-4 rounded-xl bg-[#006c4a] text-white font-headline-md text-headline-md font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isPrintingShift ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    <span>Mencetak Slip Thermal...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">receipt</span>
                    <span>Konfirmasi & Cetak Kertas</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowShiftCloseModal(false)}
                className="w-full py-2.5 text-center font-label-md text-label-md text-[#424844] hover:text-[#111c2d] cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
