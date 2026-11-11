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
  const dateStr = String(dateString).includes('T')
    ? dateString
    : `${dateString}T00:00:00`;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
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

// ✅ استخراج عنوان آمن (لا يُرجع المفتاح الخام إن وُجد عنوان بديل)
const getAlertTitle = (t, type, explicitTitle) => {
  if (!type && !explicitTitle) return '—';
  const translated = type ? t(type) : null;
  if (translated && translated !== type) return translated;
  if (explicitTitle) return explicitTitle;
  return type || '—';
};

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
    const isEV = currentCar.powertrain === 'ev';

    /* =========================================================
       1. صيانة — تنبيهات km والتاريخ
       ========================================================= */
    const maintenance = (dbService.getMaintenance() || [])
      .filter(m => String(m.carId) === String(currentCar.id));

    maintenance.forEach(m => {
      const typeLabel = getAlertTitle(t, m.type, null);
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
            sourceTable: 'maintenance',
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
          kmAlert = {
            id: `mnt_km_due_${m.id}`,
            recordId: m.id,
            sourceTable: 'maintenance',
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
          const overdue = Math.abs(kmLeft);
          kmAlert = {
            id: `mnt_km_late_${m.id}`,
            recordId: m.id,
            sourceTable: 'maintenance',
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
            sourceTable: 'maintenance',
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
          dateAlert = {
            id: `mnt_date_today_${m.id}`,
            recordId: m.id,
            sourceTable: 'maintenance',
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
            sourceTable: 'maintenance',
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

      if (kmAlert && dateAlert && dedupeByRecord) {
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

      const typeLabel = getAlertTitle(t, d.type, null);
      let desc, severity;

      if (daysLeft < 0) {
        severity = 'critical';
        desc = localized(lang, {
          ar: `منتهية منذ ${Math.abs(daysLeft)} يوم`,
          fr: `Expiré depuis ${Math.abs(daysLeft)} jours`,
          en: `Expired ${Math.abs(daysLeft)} days ago`
        });
      } else if (daysLeft === 0) {
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
        sourceTable: 'document',
        type: 'document',
        severity,
        title: typeLabel,
        desc,
        date: d.endDate,
        link: '/documents'
      });
    });

    /* =========================================================
       3. تذكيرات مخصصة — ✅ دعم التاريخ والعداد (إصلاح حرج)
       ========================================================= */
    const reminders = (dbService.getReminders() || [])
      .filter(r => String(r.carId) === String(currentCar.id));

    reminders.forEach(r => {
      const typeLabel = getAlertTitle(t, r.type, r.title);
      let dateAlert = null;
      let kmAlert = null;

      /* ---------- تنبيه التاريخ ---------- */
      if (r.date) {
        const daysLeft = getDaysDifference(r.date, now);

        if (daysLeft !== null && daysLeft <= 14) {
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
            desc = localized(lang, {
              ar: 'مستحق اليوم',
              fr: 'Dû aujourd\'hui',
              en: 'Due today'
            });
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

          dateAlert = {
            // ✅ id متوافق مع النسخة القديمة (preserves read state)
            id: `rem_${r.id}`,
            recordId: r.id,
            sourceTable: 'reminder',
            type: 'reminder',
            subtype: 'date',
            severity,
            title: typeLabel,
            desc,
            date: r.date,
            link: '/reminders'
          };
        }
      }

      /* ---------- ✅ تنبيه العداد (كان مفقوداً تماماً!) ---------- */
      if (isPositiveFinite(r.odometer)) {
        const reminderOdo = Number(r.odometer);
        const kmLeft = reminderOdo - currentOdo;

        if (kmLeft <= 500) {
          let desc, severity;

          if (kmLeft < 0) {
            severity = 'critical';
            desc = localized(lang, {
              ar: `متأخر بـ ${Math.abs(kmLeft)} كم`,
              fr: `En retard de ${Math.abs(kmLeft)} km`,
              en: `Overdue by ${Math.abs(kmLeft)} km`
            });
          } else if (kmLeft === 0) {
            severity = 'critical';
            desc = localized(lang, {
              ar: 'مستحق الآن (وصلت للعداد)',
              fr: 'Dû maintenant (compteur atteint)',
              en: 'Due now (odometer reached)'
            });
          } else if (kmLeft <= 100) {
            severity = 'critical';
            desc = localized(lang, {
              ar: `متبقي ${kmLeft} كم`,
              fr: `${kmLeft} km restants`,
              en: `${kmLeft} km left`
            });
          } else {
            severity = 'warning';
            desc = localized(lang, {
              ar: `متبقي ${kmLeft} كم`,
              fr: `${kmLeft} km restants`,
              en: `${kmLeft} km left`
            });
          }

          kmAlert = {
            id: `rem_km_${r.id}`,
            recordId: r.id,
            sourceTable: 'reminder',
            type: 'reminder',
            subtype: 'km',
            severity,
            title: typeLabel,
            desc,
            date: r.date || null,
            link: '/reminders'
          };
        }
      }

      // ✅ كلا التنبيهين أو واحد
      if (dateAlert && kmAlert && dedupeByRecord) {
        alerts.push(kmAlert.severity === 'critical' ? kmAlert : dateAlert);
      } else {
        if (dateAlert) alerts.push(dateAlert);
        if (kmAlert) alerts.push(kmAlert);
      }
    });

    /* =========================================================
       4. تنبيه الوقود/الشحن — لا تعبئة منذ 15+ يوم
       ========================================================= */
    const fuel = (dbService.getFuel() || [])
      .filter(f => String(f.carId) === String(currentCar.id));

    if (fuel.length > 0) {
      const sortedFuel = [...fuel].sort((a, b) =>
        String(b.date || '').localeCompare(String(a.date || ''))
      );
      const latestFuel = sortedFuel[0];

      if (latestFuel && latestFuel.date) {
        const daysDiff = getDaysDifference(latestFuel.date, now);

        if (daysDiff !== null && daysDiff < -15) {
          const daysSince = Math.abs(daysDiff);
          // ✅ عنوان ووصف مختلفان للسيارات الكهربائية
          const fuelTitle = isEV
            ? (t('chargingLog') || 'الشحن')
            : (t('fuel') || 'الوقود');

          alerts.push({
            id: `fuel_reminder_${latestFuel.id}`,
            recordId: latestFuel.id,
            sourceTable: 'fuel',
            type: 'fuel',
            severity: 'info',
            title: fuelTitle,
            desc: isEV
              ? localized(lang, {
                  ar: `لم تسجل شحن منذ ${daysSince} يوم`,
                  fr: `Pas de recharge enregistrée depuis ${daysSince} jours`,
                  en: `No charging logged for ${daysSince} days`
                })
              : localized(lang, {
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
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }
};
