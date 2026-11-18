import { safeNumber } from './safeNumber.js';

export const computeDashboardData = ({ 
  currentCar, fetchedTotals, myFuel, myMaintenance, myDocs, myReminders, expenseRecords, incomeRecords, t 
}) => {
  // 1. حساب المسافة الحقيقية المقطوعة
  const allOdometerReadings = [
    ...myFuel.map(f => safeNumber(f.odometer)),
    ...myMaintenance.map(m => safeNumber(m.odometer))
  ].filter(odo => odo > 0);

  let totalDistanceDriven = 0;
  if (allOdometerReadings.length >= 2) {
    totalDistanceDriven = Math.max(...allOdometerReadings) - Math.min(...allOdometerReadings);
  }

  const getFuelVolume = (record) => safeNumber(record.liters ?? record.kwh ?? record.amount ?? record.volume ?? 0);

  // 2. حساب استهلاك الوقود التراكمي
  const powertrain = currentCar.powertrain || 'ice';
  const unit = powertrain === 'ev' ? 'kWh/100km' : 'L/100km';
  
  const validFuelRecords = myFuel
    .filter(f => safeNumber(f.odometer) > 0 && getFuelVolume(f) > 0)
    .sort((a, b) => safeNumber(a.odometer) - safeNumber(b.odometer));

  let avgVal = null;
  if (validFuelRecords.length >= 2) {
    const firstOdo = safeNumber(validFuelRecords[0].odometer);
    const lastOdo = safeNumber(validFuelRecords[validFuelRecords.length - 1].odometer);
    const fuelDistance = lastOdo - firstOdo;
    let totalVolume = 0;
    for (let i = 1; i < validFuelRecords.length; i++) {
      totalVolume += getFuelVolume(validFuelRecords[i]);
    }
    if (fuelDistance > 0 && totalVolume > 0) {
      const res = (totalVolume / fuelDistance) * 100;
      if (Number.isFinite(res) && res > 0 && res < 50) {
        avgVal = Number(res.toFixed(1));
      }
    }
  }

  // 3. حساب تكلفة الكيلومتر
  const actualTotalExpenses = safeNumber(fetchedTotals?.total) || 0;
  let realCostPerKm = null;
  if (totalDistanceDriven > 0 && actualTotalExpenses > 0) {
    realCostPerKm = Number((actualTotalExpenses / totalDistanceDriven).toFixed(2));
  }

  // 4. حساب توقع المسافة المتبقية (Distance To Empty)
  let distanceToEmpty = null;
  if (avgVal > 0 && myFuel.length > 0) {
     const sortedByOdo = [...myFuel].sort((a, b) => safeNumber(b.odometer) - safeNumber(a.odometer));
     const lastFill = sortedByOdo[0];
     const lastFillVolume = getFuelVolume(lastFill);
     
     if (lastFill && lastFillVolume > 0) {
        let remainingLiters = lastFillVolume;
        const currentOdo = safeNumber(currentCar.odometer);
        
        if (currentOdo > safeNumber(lastFill.odometer)) {
           const driven = currentOdo - safeNumber(lastFill.odometer);
           const used = (driven / 100) * avgVal;
           remainingLiters = Math.max(0, remainingLiters - used);
        }
        
        if (avgVal > 0) {
           distanceToEmpty = Math.floor((remainingLiters / avgVal) * 100);
        }
     }
  }

  // 5. التنبؤ بتغيير الزيت
  let nextOilChangeOdo = null;
  const oilMaintenance = myMaintenance
    .filter(m => {
      const typeStr = String(m.type || '').toLowerCase();
      const isOil = typeStr === 'oilchange' || typeStr.includes('زيت') || typeStr.includes('oil');
      return isOil && safeNumber(m.nextOdometer) > 0;
    })
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  
  if (oilMaintenance.length > 0) nextOilChangeOdo = safeNumber(oilMaintenance[0].nextOdometer);
  
  if (!nextOilChangeOdo) {
    const oilReminder = myReminders.find(r => {
      const titleStr = String(r.title || '').toLowerCase();
      const isOil = titleStr.includes('زيت') || titleStr.includes('oil');
      return isOil && safeNumber(r.targetOdometer) > 0;
    });
    if (oilReminder) nextOilChangeOdo = safeNumber(oilReminder.targetOdometer);
  }

  // 6. التنبؤ بتغيير الإطارات
  let nextTireChangeOdo = null;
  const tireMaintenance = myMaintenance
    .filter(m => {
      const typeStr = String(m.type || '').toLowerCase();
      const isTire = typeStr === 'tires' || typeStr.includes('إطار') || typeStr.includes('tire');
      return isTire && safeNumber(m.nextOdometer) > 0;
    })
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  if (tireMaintenance.length > 0) {
    nextTireChangeOdo = safeNumber(tireMaintenance[0].nextOdometer);
  }

  // 7. حساب متوسط التكلفة اليومية
  let actualDailyAverage = 0;
  let earliestDate = new Date();
  const allRecordsForDate = [...myFuel, ...myMaintenance, ...expenseRecords, ...incomeRecords];
  allRecordsForDate.forEach(r => {
     if (r.date) {
        const d = new Date(r.date);
        if (!isNaN(d.getTime()) && d < earliestDate) earliestDate = d;
     }
  });
  
  const daysSpan = Math.max(1, Math.ceil((new Date() - earliestDate) / (1000 * 60 * 60 * 24)));
  if (actualTotalExpenses > 0) {
     actualDailyAverage = Number((actualTotalExpenses / daysSpan).toFixed(2));
  }

  // 8. بناء سجل النشاط
  const activities = [
    ...myFuel.map(f => ({ ...f, type: 'fuel' })),
    ...myMaintenance.map(m => ({ ...m, type: 'maintenance' })),
    ...expenseRecords.map(e => ({ ...e, type: 'expense' })),
    ...incomeRecords.map(i => ({ ...i, type: 'income', cost: i.amount }))
  ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 5);

  // 9. محرك الإشعارات المركزي
  const generatedNotifications = [];
  const now = new Date();
  
  myDocs.forEach(doc => {
    const expDateStr = doc.expiryDate || doc.date;
    if (expDateStr) {
       const expDate = new Date(expDateStr);
       const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
       if (diffDays <= 30) {
          generatedNotifications.push({
             id: `doc-${doc.id}`, type: 'document',
             title: `${t('documentExpiryTitle') || 'انتهاء وثيقة'} (${t(doc.type) || doc.type})`,
             message: diffDays < 0 ? (t('expired') || 'منتهية الصلاحية!') : `${t('expiresIn') || 'تنتهي بعد'} ${diffDays} ${t('days') || 'يوم'}`,
             isUrgent: diffDays < 0, date: expDateStr
          });
       }
    }
  });

  myReminders.forEach(rem => {
     if (rem.type === 'date' && rem.targetDate) {
         const targetDate = new Date(rem.targetDate);
         const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
         if (diffDays <= 30) {
            generatedNotifications.push({
               id: `rem-${rem.id}`, type: 'reminder', title: rem.title,
               message: diffDays < 0 ? (t('overdue') || 'متأخر!') : `${t('dueIn') || 'مستحق بعد'} ${diffDays} ${t('days') || 'يوم'}`,
               isUrgent: diffDays < 0, date: rem.targetDate
            });
         }
     }
  });

  if (oilMaintenance.length > 0) {
     const latestOil = oilMaintenance[0];
     const nextOdo = safeNumber(latestOil.nextOdometer);
     const currentOdo = safeNumber(currentCar.odometer);
     const diffKm = nextOdo - currentOdo;

     if (currentOdo >= nextOdo) {
         generatedNotifications.push({ id: `maint-oil-${latestOil.id}`, type: 'maintenance', title: t('oilChange') || 'تغيير الزيت', message: `${t('overdueBy') || 'متأخر بـ'} ${Math.abs(diffKm)} ${t('km') || 'كم'}`, isUrgent: true, date: latestOil.date });
     } else if (diffKm <= 500) {
         generatedNotifications.push({ id: `maint-oil-${latestOil.id}`, type: 'maintenance', title: t('oilChange') || 'تغيير الزيت', message: `${t('dueIn') || 'مستحق بعد'} ${diffKm} ${t('km') || 'كم'}`, isUrgent: false, date: latestOil.date });
     }
  }

  if (tireMaintenance.length > 0) {
     const latestTire = tireMaintenance[0];
     const nextOdo = safeNumber(latestTire.nextOdometer);
     const currentOdo = safeNumber(currentCar.odometer);
     const diffKm = nextOdo - currentOdo;

     if (currentOdo >= nextOdo) {
         generatedNotifications.push({ id: `maint-tire-${latestTire.id}`, type: 'maintenance', title: t('tires') || 'الإطارات', message: `${t('overdueBy') || 'متأخر بـ'} ${Math.abs(diffKm)} ${t('km') || 'كم'}`, isUrgent: true, date: latestTire.date });
     } else if (diffKm <= 500) {
         generatedNotifications.push({ id: `maint-tire-${latestTire.id}`, type: 'maintenance', title: t('tires') || 'الإطارات', message: `${t('dueIn') || 'مستحق بعد'} ${diffKm} ${t('km') || 'كم'}`, isUrgent: false, date: latestTire.date });
     }
  }

  return {
    totals: { 
      ...(fetchedTotals || { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 }),
      avgConsumption: avgVal, avgUnit: unit, costPerKm: realCostPerKm, totalDistance: totalDistanceDriven, nextOilChangeOdo, distanceToEmpty, dailyAverage: actualDailyAverage, nextTireChangeOdo
    },
    recentActivity: activities,
    notifications: generatedNotifications.sort((a,b) => b.isUrgent - a.isUrgent)
  };
};
