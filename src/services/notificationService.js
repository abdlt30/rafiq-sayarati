import { dbService } from './dbService';

/* =========================================================
   ✅ ثوابت ومساعدات رياضية
   ========================================================= */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// ✅ يرفض NaN, Infinity, -Infinity, null, undefined
const safeNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ✅ يتحقق أن القيمة رقمية محدودة موجبة
const isPositiveFinite = (v) => {
  if (v === null || v === undefined || v === '') return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

// ✅ تاريخ فقط → عدد الأيام (مستقر عبر اليوم)
const getDaysDifference = (dateString, now = new Date()) => {
  if (!dateString) return null;

  // دعم 'YYYY-MM-DD' و 'YYYY-MM-DDTHH:MM:SS'
  const dateStr = String(dateString).includes('T') 
    ? dateString 
    : `${dateString}T00:00:00`;

  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;

  // تطبيع كلا الطرفين لمنتصف الليل المحلي
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - today) / MS_PER_DAY);
};

// ✅ ترجمة مبسطة للوصف
const localized = (lang, { ar, fr, en }) => {
  if (lang === 'ar') return ar;
  if (lang === 'fr') return fr;
  return en || ar;
};

// ✅ ترتيب severity مع fallback آمن
const SEVERITY_ORDER = { critical: 1, warning: 2, info: 3 };
const severityRank = (s) => SEVERITY_ORDER[s] ?? 99;

/* =========================================================
   ✅ الخدمة
   ========================================================= */
export const notificationService = {
  getDaysDifference,

  generateSmartAlerts: (currentCar, t, lang, options = {}) => {
    if (!currentCar) return [];

    const now = options.now instanceof Date ? options.now : new Date();
    const dedupeByRecord = options.dedupeByRecord === true;

    const alerts = [];

    // ✅ عداد آمن (يرفض NaN/Infinity)
    const currentOdo = safeNumber(currentCar.odometer);

    /* =========================================================
       1. صيانة — تنبيهات km والتاريخ
       ========================================================= */
    const maintenance = (dbService.getMaintenance() || [])
      .filter(m => String(m.carId) === String(currentCar.id));

    maintenance.forEach(m => {
      const typeLabel = t(m.type) || m.type || '—';
      let kmAlert = null;
      let dateAlert = null;

      /* ---------- تنبيه العداد ---------- */
      if (isPositiveFinite(m.nextKm)) {
        const nextKmNum = Number(m.nextKm);
        const kmLeft = nextKmNum - currentOdo;

        if (kmLeft > 500) {
          // لا تنبيه
        } else if (kmLeft > 0) {
          kmAlert = {
            id: `mnt_km_${m.id}`,
            recordId: m.id,
            nextKm: nextKmNum,
            type: 'maintenance',
            subtype: 'km',
            severity: kmLeft <= 100 ? 'critical' : 'warning',
            title: typeLabel,
            desc: localized(lang, {
              ar: `متبقي ${kmLeft} كم للصيانة القادمة`,
              fr: `${kmLeft} km restants pour l'entretien`,
              en: `${kmLeft} km left for maintenance`
            }),
            date: m.date,
            link: '/maintenance'
          };
        } else if (kmLeft === 0) {
          // ✅ BUG FIX: "مستحق الآن" بدل "متأخر بـ 0 كم"
          kmAlert = {
            id: `mnt_km_due_${m.id}`,
            recordId: m.id,
            nextKm: nextKmNum,
            type: 'maintenance',
            subtype: 'km',
            severity: 'critical',
            title: typeLabel,
            desc: localized(lang, {
              ar: 'الصيانة مستحقة الآن (وصلت للعداد المستهدف)',
              fr: 'Entretien dû maintenant (compteur atteint)',
              en: 'Maintenance due now (odometer reached)'
            }),
            date: m.date,
            link: '/maintenance'
          };
        } else {
          // kmLeft < 0
          const overdue = Math.abs(kmLeft);
          kmAlert = {
            id: `mnt_km_late_${m.id}`,
            recordId: m.id,
            nextKm: nextKmNum,
            type: 'maintenance',
            subtype: 'km',
            severity: 'critical',
            title: typeLabel,
            desc: localized(lang, {
              ar: `تجاوزت موعد الصيانة بـ ${overdue} كم`,
              fr: `En retard de ${overdue} km`,
              en: `Overdue by ${overdue} km`
            }),
            date: m.date,
            link: '/maintenance'
          };
        }
      }

      /* ---------- تنبيه التاريخ ---------- */
      if (m.nextDate) {
        const daysLeft = getDaysDifference(m.nextDate, now);

        if (daysLeft !== null && daysLeft < 0) {
          dateAlert = {
            id: `mnt_date_late_${m.id}`,
            recordId: m.id,
            type: 'maintenance',
            subtype: 'date',
            severity: 'critical',
            title: typeLabel,
            desc: localized(lang, {
              ar: `تجاوزت موعد الصيانة بـ ${Math.abs(daysLeft)} يوم`,
              fr: `En retard de ${Math.abs(daysLeft)} jours`,
              en: `Overdue by ${Math.abs(daysLeft)} days`
            }),
            date: m.nextDate,
            link: '/maintenance'
          };
        } else if (daysLeft === 0) {
          // ✅ BUG FIX: "مستحق اليوم" بدل "متأخر بـ 0 يوم"
          dateAlert = {
            id: `mnt_date_today_${m.id}`,
            recordId: m.id,
            type: 'maintenance',
            subtype: 'date',
            severity: 'critical',
            title: typeLabel,
            desc: localized(lang, {
              ar: 'الصيانة مستحقة اليوم',
              fr: 'Entretien dû aujourd\'hui',
              en: 'Maintenance due today'
            }),
            date: m.nextDate,
            link: '/maintenance'
          };
        } else if (daysLeft <= 7) {
          dateAlert = {
            id: `mnt_date_${m.id}`,
            recordId: m.id,
            type: 'maintenance',
            subtype: 'date',
            severity: 'warning',
            title: typeLabel,
            desc: localized(lang, {
              ar: `متبقي ${daysLeft} يوم للصيانة`,
              fr: `${daysLeft} jours restants pour l'entretien`,
              en: `${daysLeft} days left for maintenance`
            }),
            date: m.nextDate,
            link: '/maintenance'
          };
        }
      }

      // ✅ كلا التنبيهين أو واحد
      if (kmAlert && dateAlert && dedupeByRecord) {
        // نُبقي الأكثر إلحاحاً (critical > warning، ثم km > date)
        alerts.push(kmAlert.severity === 'critical' ? kmAlert : dateAlert);
      } else {
        if (kmAlert) alerts.push(kmAlert);
        if (dateAlert) alerts.push(dateAlert);
      }
    });

    /* =========================================================
       2. وثائق — تنتهي خلال 30 يوم
       ========================================================= */
    const documents = (dbService.getDocuments() || [])
      .filter(d => String(d.carId) === String(currentCar.id));

    documents.forEach(d => {
      if (!d.endDate) return;
      const daysLeft = getDaysDifference(d.endDate, now);
      if (daysLeft === null) return;
      if (daysLeft > 30) return;

      const typeLabel = t(d.type) || d.type || '—';
      let desc;
      let severity;

      if (daysLeft < 0) {
        severity = 'critical';
        desc = localized(lang, {
          ar: `منتهية منذ ${Math.abs(daysLeft)} يوم`,
          fr: `Expiré depuis ${Math.abs(daysLeft)} jours`,
          en: `Expired ${Math.abs(daysLeft)} days ago`
        });
      } else if (daysLeft === 0) {
        // ✅ BUG FIX: "تنتهي اليوم" بدل "تنتهي خلال 0 يوم"
        severity = 'critical';
        desc = localized(lang, {
          ar: 'تنتهي اليوم',
          fr: 'Expire aujourd\'hui',
          en: 'Expires today'
        });
      } else if (daysLeft <= 7) {
        severity = 'critical';
        desc = localized(lang, {
          ar: `تنتهي خلال ${daysLeft} يوم`,
          fr: `Expire dans ${daysLeft} jours`,
          en: `Expires in ${daysLeft} days`
        });
      } else {
        severity = 'warning';
        desc = localized(lang, {
          ar: `تنتهي خلال ${daysLeft} يوم`,
          fr: `Expire dans ${daysLeft} jours`,
          en: `Expires in ${daysLeft} days`
        });
      }

      alerts.push({
        id: `doc_${d.id}`,
        recordId: d.id,
        type: 'document',
        severity,
        title: typeLabel,
        desc,
        date: d.endDate,
        link: '/documents'
      });
    });

    /* =========================================================
       3. تذكيرات مخصصة — خلال 14 يوم
       ========================================================= */
    const reminders = (dbService.getReminders() || [])
      .filter(r => String(r.carId) === String(currentCar.id));

    reminders.forEach(r => {
      if (!r.date) return;
      const daysLeft = getDaysDifference(r.date, now);
      if (daysLeft === null) return;
      if (daysLeft > 14) return;

      const title = t(r.type) || r.title || r.type || '—';
      let desc, severity;

      if (daysLeft < 0) {
        severity = 'critical';
        desc = localized(lang, {
          ar: `متأخر بـ ${Math.abs(daysLeft)} يوم`,
          fr: `En retard de ${Math.abs(daysLeft)} jours`,
          en: `Overdue by ${Math.abs(daysLeft)} days`
        });
      } else if (daysLeft === 0) {
        severity = 'critical';
        desc = localized(lang, { ar: 'اليوم', fr: 'Aujourd\'hui', en: 'Today' });
      } else if (daysLeft <= 3) {
        severity = 'critical';
        desc = localized(lang, {
          ar: `بعد ${daysLeft} يوم`,
          fr: `Dans ${daysLeft} jours`,
          en: `In ${daysLeft} days`
        });
      } else {
        severity = 'warning';
        desc = localized(lang, {
          ar: `بعد ${daysLeft} يوم`,
          fr: `Dans ${daysLeft} jours`,
          en: `In ${daysLeft} days`
        });
      }

      alerts.push({
        id: `rem_${r.id}`,
        recordId: r.id,
        type: 'reminder',
        severity,
        title,
        desc,
        date: r.date,
        link: '/reminders'
      });
    });

    /* =========================================================
       4. تنبيه الوقود — لا تعبئة منذ 15+ يوم
       ========================================================= */
    const fuel = (dbService.getFuel() || [])
      .filter(f => String(f.carId) === String(currentCar.id));

    if (fuel.length > 0) {
      // ✅ ترتيب مستقر بـ localeCompare + نسخ لحماية المصفوفة الأصلية
      const sortedFuel = [...fuel].sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || ''))
      );
      const latestFuel = sortedFuel[0];

      if (latestFuel && latestFuel.date) {
        const daysDiff = getDaysDifference(latestFuel.date, now);

        // ✅ BUG FIX: فقط الماضي (daysDiff < 0)، لا المستقبل
        if (daysDiff !== null && daysDiff < -15) {
          const daysSince = Math.abs(daysDiff);
          alerts.push({
            id: `fuel_reminder_${latestFuel.id}`,
            recordId: latestFuel.id,
            type: 'fuel',
            severity: 'info',
            title: t('fuel') || 'الوقود',
            desc: localized(lang, {
              ar: `لم تسجل تعبئة وقود منذ ${daysSince} يوم`,
              fr: `Pas de carburant enregistré depuis ${daysSince} jours`,
              en: `No fuel logged for ${daysSince} days`
            }),
            date: latestFuel.date,
            link: '/fuel'
          });
        }
      }
    }

    /* =========================================================
       5. الترتيب النهائي (severity → date desc)
       ========================================================= */
    return alerts.sort((a, b) => {
      const rankDiff = severityRank(a.severity) - severityRank(b.severity);
      if (rankDiff !== 0) return rankDiff;
      // ترتيب ثانوي: الأحدث أولاً
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }
};
