import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import CustomSelect from '../components/ui/CustomSelect';
import Input from '../components/ui/Input';
import { FileText, Plus, Shield, Trash2, X, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';

export default function Documents() {
  const { currentCar } = useContext(AppContext);
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({ type: 'تأمين', endDate: '' });

  const loadData = () => {
    if (currentCar) {
      const carDocs = dbService.getDocuments()
        .filter(d => d.carId === currentCar.id)
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
      setDocuments(carDocs);
    }
  };

  useEffect(() => { loadData(); }, [currentCar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCar) return;
    
    const data = { carId: currentCar.id, ...formData };
    
    if (editingId) {
      dbService.updateDocument(editingId, data);
    } else {
      dbService.addDocument(data);
    }
    
    closeForm();
    loadData();
  };

  const openEdit = (doc) => {
    setEditingId(doc.id);
    setFormData({ type: doc.type, endDate: doc.endDate });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ type: 'تأمين', endDate: '' });
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      dbService.deleteDocument(deleteConfirmId);
      setDeleteConfirmId(null);
      loadData();
    }
  };

  const getDocStatus = (endDate) => {
    if(!endDate) return { label: 'غير محدد', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-700', icon: FileText };
    
    const today = new Date();
    const expiry = new Date(endDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'منتهية', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle };
    if (diffDays <= 30) return { label: `تنتهي بعد ${diffDays} يوم`, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle };
    return { label: 'صالحة', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle };
  };

  return (
    <div className="space-y-4 animate-in fade-in relative pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">الوثائق</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-dark-800 p-6 rounded-3xl border border-dark-700 w-full max-w-md space-y-5 shadow-2xl relative">
            <button type="button" onClick={closeForm} className="absolute top-4 left-4 p-2 bg-dark-900 rounded-full text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-bold text-white text-xl mb-4 text-center">{editingId ? 'تعديل وثيقة' : 'إضافة وثيقة جديدة'}</h3>
            
            <CustomSelect 
              label="نوع الوثيقة"
              options={['تأمين', 'فحص تقني', 'رخصة', 'أخرى']}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
            />

            <div>
              <label className="block text-sm text-slate-400 mb-2">تاريخ الانتهاء</label>
              <input 
                required 
                type="date" 
                value={formData.endDate} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" 
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
              {editingId ? 'حفظ التعديلات' : 'حفظ الوثيقة'}
            </button>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center mt-20">
          <FileText size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">لا توجد وثائق محفوظة.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const status = getDocStatus(doc.endDate);
            const StatusIcon = status.icon;
            return (
              <div key={doc.id} className={`bg-dark-800 p-4 rounded-2xl border ${status.border} flex flex-col gap-3 transition-colors`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg}`}>
                      <Shield size={20} className={status.color} />
                    </div>
                    <div>
                      <p className="font-bold text-white">{doc.type}</p>
                      <div className={`flex items-center gap-1 text-[10px] mt-1 font-medium ${status.color}`}>
                        <StatusIcon size={12} />
                        <span>{status.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* أزرار التعديل والحذف */}
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(doc)} className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-2 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmId(doc.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 p-2 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* إصلاح تداخل النصوص */}
                <div className="bg-dark-900/50 p-2 rounded-lg flex justify-between items-center text-xs">
                  <span className="text-slate-400">ينتهي في</span>
                  <span className="font-mono text-white">{doc.endDate ? new Date(doc.endDate).toLocaleDateString('ar-MA') : '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 p-6 rounded-3xl w-full max-w-sm border border-dark-700 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 mb-6">هل أنت متأكد من حذف هذه الوثيقة؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-dark-700 text-white py-3 rounded-xl font-bold hover:bg-dark-600 transition">إلغاء</button>
              <button onClick={executeDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
