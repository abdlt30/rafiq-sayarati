import { dbService } from './dbService';

export const notificationService = {
  // دالة لحساب عدد الأيام بين تاريخين
  getDaysDifference: (dateString) => {
    if (!dateString) return null;
    const now = new Date();
    const target = new Date(dateString);
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // الدالة الرئيسية لتوليد التنبيهات بناءً على السيارة الحالية
  generateSmartAlerts: (currentCar, t, lang) => {
    if (!currentCar) return [];
    
    const alerts = [];
    // ✅ إصلاح 1: استخدام odometer بدلاً من currentOdometer
    const currentOdo = Number(currentCar.odometer) || 0;

    // 1. فحص تنبيهات الصيانة (بناءً على العداد أو التاريخ)
    const maintenance = dbService.getMaintenance().filter(m => m.carId === currentCar.id);
    maintenance.forEach(m => {
      // تنبيه العداد (مثلاً تبقى 500 كم أو أقل)
      if (m.nextKm && Number(m.nextKm) > currentOdo) {
        const kmLeft = Number(m.nextKm) - currentOdo;
        if (kmLeft <= 500 && kmLeft > 0) {
          alerts.push({
            id: `mnt_km_${m.id}`, // معرف فريد للتنبيه
            recordId: m.id,       // ✅ إصلاح 2: معرف السجل الأصلي
            nextKm: m.nextKm,     // ✅ إصلاح 2: تمرير العداد المستهدف
            type: 'maintenance',
            severity: kmLeft <= 100 ? 'critical' : 'warning',
            title: t(m.type) || m.type,
            desc: lang === 'ar' ? `متبقي ${kmLeft} كم للصيانة القادمة` : lang === 'fr' ? `${kmLeft} km restants pour l'entretien` : `${kmLeft} km left for maintenance`,
            date: m.date,
            link: '/maintenance'
          });
        }
      } else if (m.nextKm && Number(m.nextKm) <= currentOdo) {
         // متأخر عن العداد
         alerts.push({
            id: `mnt_km_late_${m.id}`,
            recordId: m.id,       // ✅
            nextKm: m.nextKm,     // ✅
            type: 'maintenance',
            severity: 'critical',
            title: t(m.type) || m.type,
            desc: lang === 'ar' ? `تجاوزت موعد الصيانة بـ ${currentOdo - Number(m.nextKm)} كم` : lang === 'fr' ? `En retard de ${currentOdo - Number(m.nextKm)} km` : `Overdue by ${currentOdo - Number(m.nextKm)} km`,
            date: m.date,
            link: '/maintenance'
          });
      }

      // تنبيه التاريخ (مثلاً تبقى أسبوع أو أقل)
      if (m.nextDate) {
        const daysLeft = notificationService.getDaysDifference(m.nextDate);
        if (daysLeft <= 7 && daysLeft > 0) {
           alerts.push({
            id: `mnt_date_${m.id}`,
            recordId: m.id, // ✅
            type: 'maintenance',
            severity: 'warning',
            title: t(m.type) || m.type,
            desc: lang === 'ar' ? `متبقي ${daysLeft} يوم للصيانة` : lang === 'fr' ? `${daysLeft} jours restants` : `${daysLeft} days left`,
            date: m.nextDate,
            link: '/maintenance'
          });
        } else if (daysLeft <= 0) {
           alerts.push({
            id: `mnt_date_late_${m.id}`,
            recordId: m.id, // ✅
            type: 'maintenance',
            severity: 'critical',
            title: t(m.type) || m.type,
            desc: lang === 'ar' ? `تجاوزت موعد الصيانة بـ ${Math.abs(daysLeft)} يوم` : lang === 'fr' ? `En retard de ${Math.abs(daysLeft)} jours` : `Overdue by ${Math.abs(daysLeft)} days`,
            date: m.nextDate,
            link: '/maintenance'
          });
        }
      }
    });

    // 2. فحص تنبيهات الوثائق (تنتهي خلال 30 يوم)
    const documents = dbService.getDocuments().filter(d => d.carId === currentCar.id);
    documents.forEach(d => {
      const daysLeft = notificationService.getDaysDifference(d.endDate);
      if (daysLeft !== null && daysLeft <= 30) {
        alerts.push({
          id: `doc_${d.id}`,
          type: 'document',
          severity: daysLeft <= 7 ? 'critical' : 'warning',
          title: t(d.type) || d.type,
          desc: daysLeft < 0 
            ? (lang === 'ar' ? `منتهية منذ ${Math.abs(daysLeft)} يوم` : lang === 'fr' ? `Expiré depuis ${Math.abs(daysLeft)} jours` : `Expired ${Math.abs(daysLeft)} days ago`)
            : (lang === 'ar' ? `تنتهي خلال ${daysLeft} يوم` : lang === 'fr' ? `Expire dans ${daysLeft} jours` : `Expires in ${daysLeft} days`),
          date: d.endDate,
          link: '/documents'
        });
      }
    });

    // 3. فحص تنبيهات التذكيرات المخصصة
    const reminders = dbService.getReminders().filter(r => r.carId === currentCar.id);
    reminders.forEach(r => {
      const daysLeft = notificationService.getDaysDifference(r.date);
      if (daysLeft !== null && daysLeft <= 14) {
        alerts.push({
          id: `rem_${r.id}`,
          type: 'reminder',
          severity: daysLeft <= 3 ? 'critical' : 'warning',
          title: t(r.type) || r.title || r.type,
          desc: daysLeft < 0 
            ? (lang === 'ar' ? `متأخر بـ ${Math.abs(daysLeft)} يوم` : lang === 'fr' ? `En retard de ${Math.abs(daysLeft)} jours` : `Overdue by ${Math.abs(daysLeft)} days`)
            : (lang === 'ar' ? `بعد ${daysLeft} يوم` : lang === 'fr' ? `Dans ${daysLeft} jours` : `In ${daysLeft} days`),
          date: r.date,
          link: '/reminders'
        });
      }
    });

    // 4. تنبيه ذكي للوقود (إذا كانت آخر تعبئة منذ أكثر من 15 يوم)
    const fuel = dbService.getFuel().filter(f => f.carId === currentCar.id);
    if (fuel.length > 0) {
      const latestFuel = fuel.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const daysSinceFuel = Math.abs(notificationService.getDaysDifference(latestFuel.date));
      if (daysSinceFuel > 15) {
         alerts.push({
            id: `fuel_reminder_${latestFuel.id}`,
            type: 'fuel',
            severity: 'info',
            title: t('fuel') || 'الوقود',
            desc: lang === 'ar' ? `لم تسجل تعبئة وقود منذ ${daysSinceFuel} يوم` : lang === 'fr' ? `Pas de carburant enregistré depuis ${daysSinceFuel} jours` : `No fuel logged for ${daysSinceFuel} days`,
            date: latestFuel.date,
            link: '/fuel'
          });
      }
    }

    // ترتيب التنبيهات: الحرجة أولاً، ثم التحذيرية، ثم المعلوماتية
    const severityOrder = { critical: 1, warning: 2, info: 3 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }
};
