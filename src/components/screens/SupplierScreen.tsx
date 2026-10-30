import React, { useState } from 'react';
import { Supplier, UserRole } from '../../types';

interface SupplierScreenProps {
  suppliers: Supplier[];
  userRole: UserRole;
  onAddSupplier: (supplier: Supplier) => void;
  onNavigateToDebts: (supplierName?: string) => void;
}

export const SupplierScreen: React.FC<SupplierScreenProps> = ({
  suppliers,
  userRole,
  onAddSupplier,
  onNavigateToDebts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [commodities, setCommodities] = useState('');
  const [term, setTerm] = useState('Net 14');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.commodities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name,
      initials: name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toUpperCase(),
      contactPerson: contactPerson || 'Sales Toko',
      phone,
      address: address || 'Pergudangan Sembako',
      commodities: commodities ? commodities.split(',').map((c) => c.trim()) : ['Sembako'],
      term,
      totalOrders: 0,
      activeDebt: 0
    };

    onAddSupplier(newSup);
    setShowAddModal(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setCommodities('');
  };

  return (
    <div className="flex flex-col w-full pb-32 px-gutter pt-3 gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-label-sm text-[#006c4a] uppercase tracking-wider font-semibold">
            Manajemen Mitra Distribusi
          </span>
          <h2 className="font-headline-lg font-bold text-[#00130a] tracking-tight">
            Data Supplier Rekanan
          </h2>
          <p className="text-xs text-[#727974]">
            Total {suppliers.length} rekanan penyuplai komoditas sembako aktif
          </p>
        </div>

        {userRole !== 'kasir' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-auto h-11 px-4 rounded-xl bg-[#00130a] hover:bg-[#006c4a] text-white font-label-md font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">person_add</span>
            <span>Tambah Supplier Baru</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#e7eeff]">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727974] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama supplier, penanggung jawab, atau komoditas..."
            className="w-full h-11 pl-10 pr-4 bg-[#f0f3ff] rounded-xl font-body-md text-sm text-[#111c2d] placeholder:text-[#727974] focus:outline-none border border-[#dee8ff]"
          />
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#e7eeff] flex flex-col justify-between gap-3 hover:border-[#82f5c1] transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#0f291e] text-[#85f8c4] flex items-center justify-center font-bold text-sm shrink-0">
                  {sup.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-title-md font-bold text-[#00130a] truncate">{sup.name}</h3>
                  <p className="text-xs text-[#727974] flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-[#006c4a]">person</span>
                    <span>{sup.contactPerson}</span>
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-[#dee8ff] text-[#00130a] text-[11px] font-bold shrink-0">
                {sup.term}
              </span>
            </div>

            {/* Address and commodities */}
            <div className="space-y-1.5 text-xs text-[#424844] bg-[#f0f3ff] p-3 rounded-xl border border-[#dee8ff]">
              <div className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#727974] shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="line-clamp-2">{sup.address}</span>
              </div>
              <div className="flex items-start gap-1.5 pt-1 border-t border-[#dee8ff]/60">
                <span className="material-symbols-outlined text-[15px] text-[#006c4a] shrink-0 mt-0.5">
                  inventory_2
                </span>
                <span className="line-clamp-1 text-[#006c4a] font-medium">
                  {sup.commodities.join(' • ')}
                </span>
              </div>
            </div>

            {/* Metrics & Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-[#f0f3ff]">
              <div>
                <span className="text-[10px] text-[#727974] block">Utang Aktif:</span>
                <span
                  className={`font-mono text-xs font-bold ${
                    sup.activeDebt > 0 ? 'text-[#ba1a1a]' : 'text-[#006c4a]'
                  }`}
                >
                  {sup.activeDebt > 0 ? `Rp ${sup.activeDebt.toLocaleString('id-ID')}` : 'Lunas (Rp 0)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${sup.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3 rounded-xl bg-[#82f5c1] text-[#00714e] font-bold text-xs flex items-center gap-1 hover:bg-[#85f8c4] transition-all cursor-pointer"
                  title="Kirim Pesan WhatsApp"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => onNavigateToDebts(sup.name)}
                  className="h-9 px-3 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#00130a] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-[#dee8ff]"
                  title="Lihat Buku Utang Supplier"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  <span>Utang</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Tambah Supplier Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#00130a]/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={handleSaveSupplier}
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#e7eeff]">
              <h3 className="font-headline-md font-bold text-[#00130a]">Tambah Supplier Rekanan</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0f3ff] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Nama Perusahaan / Supplier *</label>
              <input
                required
                type="text"
                placeholder="cth. CV Beras Sentosa Makmur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">Nama Kontak (Sales)</label>
                <input
                  type="text"
                  placeholder="cth. Pak Joko"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#727974] font-semibold">No. Telepon / WA *</label>
                <input
                  required
                  type="text"
                  placeholder="cth. 0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Alamat Gudang / Kantor</label>
              <input
                type="text"
                placeholder="cth. Pasar Induk Cipinang Blok A-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Komoditas yang Dipasok</label>
              <input
                type="text"
                placeholder="cth. Beras Ramos, Pandan Wangi, Ketan (pisahkan koma)"
                value={commodities}
                onChange={(e) => setCommodities(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#727974] font-semibold">Syarat Pembayaran (Term)</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="h-10 px-3 bg-[#f0f3ff] rounded-lg text-sm border border-[#dee8ff]"
              >
                <option value="COD">Tunai Langsung (COD)</option>
                <option value="Net 7">Tempo 7 Hari</option>
                <option value="Net 14">Tempo 14 Hari</option>
                <option value="Net 30">Tempo 30 Hari</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#00130a] hover:bg-[#006c4a] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95"
            >
              Simpan Supplier
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
