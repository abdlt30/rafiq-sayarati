// داخل الـ return، ابحث عن الـ Modal وضعه هكذا:
{isModalOpen && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    {/* أضفنا max-h-[90vh] و overflow-y-auto لكي يمكن التمرير */}
    <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] overflow-y-auto">
      <button type="button" onClick={closeModal} className="absolute top-4 left-4 text-[var(--text-muted)] hover:text-white"><X size={20} /></button>
      <h2 className="text-xl font-bold text-center mb-6">{editingId ? t('edit') : t('addFuel')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">التاريخ</label>
          <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark]" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">العداد (KM)</label>
          <input type="number" required value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">اللترات</label>
          <input type="number" required value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">التكلفة ({currency})</label>
          <input type="number" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)]" />
        </div>
      </div>
      
      {/* الزر سيكون دائماً في الأسفل وبإمكانك التمرير للوصول إليه */}
      <button type="submit" className="w-full mt-6 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg">
        {t('save')}
      </button>
    </form>
  </div>
)}
