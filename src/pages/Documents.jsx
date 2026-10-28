import React, { useEffect, useState } from 'react';
import { getVehicles, getDocumentsByVehicle, addDocument, deleteDocument } from '../services/dataService';
import { FileText, Plus, Shield, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // حالة تأكيد الحذف المخصصة
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // حالة النموذج
  const [formData, setFormData] = useState({
    type: 'تأمين',
    endDate: '',
    notes: ''
  });

  // أنواع الوثائق (أزرار تفاعلية)
  const docTypes = [
    { id: 'تأمين', label: 'تأمين السيارة', icon: Shield },
    { id: 'فحص تقني', label: 'الفحص التقني', icon: FileText },
    { id: 'رخصة', label: 'رخصة السيارة', icon: FileText },
    { id: 'أخرى', label: 'أخرى', icon: FileText },
  ];

  const loadData = async () => {
    const vehs = await getVehicles();
    if (vehs.length > 0) {
      setVehicleId(vehs[0].id);
      const docs = await getDocumentsByVehicle(vehs[0].id);
      setDocuments(docs.sort((a, b) => new Date(a.endDate) - new Date(b.endDate)));
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId) return;
    try {
      await addDocument({ vehicleId, ...formData });
      setShowForm(false);
      setFormData({ type: 'تأمين', endDate: '', notes: '' });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      await deleteDocument(deleteConfirmId);
      setDeleteConfirmId(null);
      loadData();
    }
  };

  // دالة لحساب حالة الوثيقة
  const getDocStatus = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'منتهية', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle };
    if (diffDays <= 30) return { label: `تنتهي بعد ${diffDays} يوم`, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle };
    return { label: 'صالحة', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle };
  };

  return (
    <div className="space-y-4 animate-in fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">الوثائق</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-500 text-white p-3 rounded-full hover:bg-brand-600 transition shadow-lg shadow-brand-500/30">
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-dark-800 p-6 rounded-3xl border border-dark-700 w-full max-w-md space-y-5 shadow-2xl relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 left-4 p-2 bg-dark-900 rounded-full text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-bold text-white text-xl mb-4 text-center">إضافة وثيقة جديدة</h3>
            
            {/* أزرار نوع الوثيقة بدلاً من القائمة المنسدلة */}
            <div>
              <label className="block text-sm text-slate-400 mb-3">نوع الوثيقة</label>
              <div className="grid grid-cols-2 gap-2">
                {docTypes.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: doc.id })}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                        formData.type === doc.id 
                          ? 'border-brand-500 bg-brand-500/10 text-white' 
                          : 'border-dark-700 bg-dark-900 text-slate-400'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{doc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">تاريخ الانتهاء</label>
              <input 
                required 
                name="endDate" 
                type="date" 
                value={formData.endDate} 
                onChange={handleChange} 
                className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-white outline-none focus:border-brand-500" 
              />
            </div>

            <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors">
              حفظ الوثيقة
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
              <div key={doc.id} className={`bg-dark-800 p-4 rounded-2xl border ${status.border} flex items-center justify-between transition-colors`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.bg}`}>
                    <Shield size={22} className={status.color} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{doc.type}</p>
                    <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${status.color}`}>
                      <StatusIcon size={12} />
                      <span>{status.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">ينتهي في</p>
                    <p className="font-mono text-white text-sm">{new Date(doc.endDate).toLocaleDateString('ar-MA')}</p>
                  </div>
                  <button onClick={() => setDeleteConfirmId(doc.id)} className="p-2 text-slate-500 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة تأكيد الحذف الاحترافية */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 p-6 rounded-3xl w-full max-w-sm border border-dark-700 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 mb-6">هل أنت متأكد من حذف هذه الوثيقة؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
