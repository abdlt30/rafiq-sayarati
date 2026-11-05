import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Bell, Plus, X, Trash2, Wrench, Shield, Calendar } from 'lucide-react';

export default function Reminders() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'oil', date: '', odometer: '' });

  useEffect(() => {
    if (currentCar) setRecords(dbService.getReminders().filter(r => r.carId === currentCar.id));
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { carId: currentCar.id, type: formData.type, date: formData.date || null, odometer: Number(formData.odometer) || null };
    dbService.addReminder(data);
    setRecords(dbService.getReminders().filter(r => r.carId === currentCar.id));
    setIsModalOpen(false);
  };

  const getStatus = (record) => {
    if (record.date) {
      const daysLeft = Math.ceil((new Date(record.date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return { label: 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10' };
      if (daysLeft <= 7) return { label: 'قريب', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      return { label: `بعد ${daysLeft} يوم`, color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    if (record.odometer) {
      const kmLeft = record.odometer - currentCar.currentOdometer;
      if (kmLeft < 0) return { label: 'متأخر', color: 'text-red-500', bg: 'bg-red-500/10' };
      if (kmLeft <= 1000) return { label: 'قريب', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      return { label: `بعد ${kmLeft} كم`, color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    return { label: 'نشط', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">التذكيرات</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 p-3 rounded-full text-white shadow-lg"><Plus size={24} /></button>
      </div>

      {records.map(record => {
        const status = getStatus(record);
        return (
          <div key={record.id} className="bg-[#0e1526] border border-[#1e2a44] p-4 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}>
                {record.type === 'oil' ? <Wrench size={20} /> : record.type === 'insurance' ? <Shield size={20} /> : <Calendar size={20} />}
              </div>
              <div>
                <p className="font-bold text-white">{record.type === 'oil' ? 'تغيير زيت' : record.type === 'insurance' ? 'تأمين' : 'فحص تقني'}</p>
                <p className={`text-xs ${status.color}`}>{status.label}</p>
              </div>
            </div>
            <button onClick={() => { dbService.deleteReminder(record.id); setRecords(records.filter(r => r.id !== record.id)); }} className="text-red-500"><Trash2 size={18} /></button>
          </div>
        );
      })}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-[#0e1526] p-6 rounded-2xl border border-[#1e2a44] w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold text-white">إضافة تذكير</h2><button type="button" onClick={() => setIsModalOpen(false)}><X className="text-white"/></button></div>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFormData({...formData, type: 'oil'})} className={`p-3 rounded-xl border ${formData.type === 'oil' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e2a44] text-slate-400'}`}>زيت</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'insurance'})} className={`p-3 rounded-xl border ${formData.type === 'insurance' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e2a44] text-slate-400'}`}>تأمين</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'inspection'})} className={`p-3 rounded-xl border ${formData.type === 'inspection' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#1e2a44] text-slate-400'}`}>فحص</button>
            </div>
            {formData.type === 'oil' ? (
              <input type="number" placeholder="العداد (KM)" required value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full bg-[#070b14] border border-[#1e2a44] rounded-xl p-3 text-white" />
            ) : (
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#070b14] border border-[#1e2a44] rounded-xl p-3 text-white" />
            )}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">حفظ</button>
          </form>
        </div>
      )}
    </div>
  );
}
