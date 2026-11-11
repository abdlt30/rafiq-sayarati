import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wrench, Gauge, Settings2, BatteryCharging, Zap } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal'; 
import OptionPicker from '../components/ui/OptionPicker'; 

export default function Maintenance() {
  const { currentCar, t, currency } = useContext(AppContext);
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ date: '', type: 'oilChange', cost: '', nextKm: '' });
  const [customTypes, setCustomTypes] = useState([]);

  // ✅ 1. تحديد نوع السيارة
  const isElectric = currentCar?.powertrain === 'ev';
  const isHybrid = currentCar?.powertrain === 'hybrid';

  // ✅ 2. قائمة صيانة السيارات التقليدية (ICE)
  const iceTypes = [
    { value: 'oilChange', label: t('oilChange') || 'تغيير زيت' },
    { value: 'tires', label: t('tires') || 'إطارات' },
    { value: 'brakes', label: t('brakes') || 'فرامل' },
    { value: 'battery', label: t('battery') || 'بطارية 12V' },
    { value: 'airFilter', label: t('airFilter') || 'فلتر هواء' },
    { value: 'fullInspection', label: t('fullInspection') || 'فحص شامل' },
    { value: 'other', label: t('otherMaintenance') || 'أخرى' }
  ];

  // ✅ 3. قائمة صيانة السيارات الكهربائية (EV)
  const evTypes = [
    { value: 'batteryCheck', label: t('batteryCheck') || 'فحص البطارية الرئيسية' },
    { value: 'softwareUpdate', label: t('softwareUpdate') || 'تحديث برمجي' },
    { value: 'tires', label: t('tires') || 'إطارات' },
    { value: 'brakes', label: t('brakes') || 'فرامل' },
    { value: 'fullInspection', label: t('fullInspection') || 'فحص شامل' },
    { value: 'other', label: t('otherMaintenance') || 'أخرى' }
  ];

  // ✅ 4. دمج القوائم بناءً على نوع السيارة (الهجينة تأخذ من الاثنين)
  const baseTypes = isElectric 
    ? evTypes 
    : (isHybrid ? [...iceTypes, ...evTypes.filter(ev => !['tires', 'brakes', 'fullInspection', 'other'].includes(ev.value))] : iceTypes);

  // دمج الأنواع المخصصة
  const allTypes = [
    ...baseTypes,
    ...customTypes.map(ct => ({ value: ct, label: ct }))
  ];

  const loadData = () => {
    if (currentCar) {
      const allMaintenance = dbService.getMaintenance() || [];
      const carMaintenance = allMaintenance.filter(r => r.carId === currentCar.id);
      setRecords(carMaintenance.sort((a, b) => new Date(b.date) - new Date(a.date)));
      
      const types = dbService.getCustomTypes() || [];
      setCustomTypes(types);
    } else {
      setRecords([]);
      setCustomTypes([]);
    }
  };

  useEffect(() => { loadData(); }, [currentCar]);

  const handleAddCustomType = () => {
    const newType = window.prompt(t('enterCustomTypeName') || 'أدخل اسم نوع الصيانة الجديد:');
    if (newType && newType.trim() !== '') {
      const updatedTypes = dbService.addCustomType(newType.trim());
      setCustomTypes(updatedTypes);
      setFormData({ ...formData, type: newType.trim() });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentCar) return;

    try {
      const data = { 
        carId: currentCar.id, 
        date: formData.date,
        type: formData.type,
        cost: Number(formData.cost), 
        nextKm: Number(formData.nextKm) || null 
      };
      
      if (editingId) {
        dbService.updateMaintenance(editingId, data);
      } else {
        dbService.addMaintenance(data);
      }
      
      loadData(); 
      closeModal();
    } catch (error) {
      console.error("خطأ في حفظ الصيانة:", error);
      alert(t('errorSaving') || 'حدث خطأ أثناء الحفظ.');
    }
  };

  const handleDelete = () => {
    if(deleteId) {
      dbService.deleteMaintenance(deleteId);
      loadData(); 
      setDeleteId(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      type: isElectric ? 'batteryCheck' : 'oilChange', // ✅ القيمة الافتراضية تتغير
      cost: '', 
      nextKm: '' 
    });
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    const typeKeyMap = { 
      'تغيير زيت': 'oilChange', 'إطارات': 'tires', 'فرامل': 'brakes', 'بطارية': 'battery', 
      'فلتر هواء': 'airFilter', 'فحص شامل': 'fullInspection', 'أخرى': 'other',
      'فحص البطارية': 'batteryCheck', 'تحديث برمجي': 'softwareUpdate'
    };
    const typeKey = typeKeyMap[record.type] || record.type;
    
    setFormData({ date: record.date, type: typeKey, cost: record.cost, nextKm: record.nextKm || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: isElectric ? 'batteryCheck' : 'oilChange', cost: '', nextKm: '' });
  };

  return (
    <div className="space-y-4 pb-24 px-4 relative min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('maintenance') || 'الصيانة'}</h1>
      </div>

      {/* قائمة السجلات */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            {isElectric ? <BatteryCharging size={48} className="opacity-40" /> : <Wrench size={48} className="opacity-40" />}
          </div>
          <p>{t('noMaintenanceRecords') || 'لا توجد سجلات صيانة.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div key={record.id} className={`bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm transition-colors ${isElectric ? 'hover:border-green-500/30' : 'hover:border-yellow-500/30'}`}>
              
              <div className="flex items-center gap-3">
                {/* ✅ تغيير لون وأيقونة الصيانة بناءً على نوع السيارة أو نوع الصيانة */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  record.type === 'batteryCheck' || record.type === 'softwareUpdate' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {record.type === 'batteryCheck' ? <BatteryCharging size={18} /> : record.type === 'softwareUpdate' ? <Zap size={18} /> : <Wrench size={18} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm">
                    {baseTypes.find(dt => dt.value === record.type)?.label || record.type}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{record.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="font-extrabold text-[var(--primary)] text-sm">
                    {Number(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                  </p>
                  {record.nextKm ? (
                    <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-1 mt-0.5">
                      <Gauge size={10} /> {Number(record.nextKm).toLocaleString()} KM
                    </p>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t('noNextMaintenance') || 'لا توجد صيانة قادمة'}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openEdit(record)} className="text-blue-500 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20 active:scale-90 transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(record.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 active:scale-90 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* الزر العائم */}
      <button 
        onClick={openAddModal} 
        className={`fixed bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ${isElectric ? 'bg-green-500 shadow-green-500/40' : 'bg-[var(--primary)] shadow-blue-500/40'}`}
      >
        <Plus size={28} />
      </button>

      {/* نافذة الحذف */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title={t('confirmDelete') || 'تأكيد الحذف'}
        message={t('confirmDeleteMsg') || 'هل أنت متأكد من حذف سجل الصيانة هذا؟'}
        variant="danger" 
        confirmText={t('confirmDeleteBtn') || 'نعم، احذف'} 
      />

      {/* نافذة الإضافة/التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] flex flex-col shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white active:scale-90 transition-all z-10">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-center mb-5 text-[var(--text)] mt-1">
              {editingId ? (t('edit') || 'تعديل الصيانة') : (t('addMaintenance') || 'إضافة صيانة')}
            </h2>
            
            <div className="space-y-3 overflow-y-auto pb-2">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[var(--text-muted)] block">{t('maintenanceType') || 'نوع الصيانة'}</label>
                  <button type="button" onClick={handleAddCustomType} className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline">
                    <Settings2 size={12} /> {t('addType') || 'إضافة نوع'}
                  </button>
                </div>
                
                {/* ✅ تمرير القائمة الديناميكية هنا */}
                <OptionPicker 
                  options={allTypes} 
                  value={formData.type} 
                  onChange={(val) => setFormData({...formData, type: val})} 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input type="number" inputMode="decimal" min="0" step="0.01" required placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-lg font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-muted)] mb-1 block">{t('nextOdometer') || 'العداد للصيانة القادمة'} (KM)</label>
                <input type="number" inputMode="numeric" min="0" placeholder={t('optional') || 'اختياري'} value={formData.nextKm} onChange={e => setFormData({...formData, nextKm: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>

            <button type="submit" className={`w-full mt-5 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all flex-shrink-0 ${isElectric ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--primary)] hover:bg-blue-600'}`}>
              {t('save') || 'حفظ البيانات'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
