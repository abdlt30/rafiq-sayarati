const refreshDashboard = useCallback(async () => {
  if (!currentCar) {
    setTotals({ fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0, avgConsumption: null, avgUnit: 'L/100km', costPerKm: null, totalDistance: 0, nextOilChangeOdo: null });
    setRecentActivity([]);
    setDocuments([]);
    setReminders([]);
    setMaintenanceRecords([]);
    return;
  }
  
  setIsLoading(true);
  try {
    const fetchedTotals = await dbService.getTotals(currentCar.id);
    const fuelRecords = await dbService.getFuel() || [];
    const allMaintenance = await dbService.getMaintenance() || [];
    const expenseRecords = await dbService.getExpenses() || [];
    const incomeRecords = await dbService.getIncomes() || [];
    const allDocs = await dbService.getDocuments() || [];
    const allReminders = await dbService.getReminders() || [];

    const carIdStr = String(currentCar.id);
    const filter = (arr) => (Array.isArray(arr) ? arr : []).filter(r => String(r.carId) === carIdStr);

    const myFuel = filter(fuelRecords);
    const myMaintenance = filter(allMaintenance);
    const myDocs = filter(allDocs);
    const myReminders = filter(allReminders);

    // 1. حساب المسافة الحقيقية
    const allOdometerReadings = [
      ...myFuel.map(f => safeNumber(f.odometer)),
      ...myMaintenance.map(m => safeNumber(m.odometer))
    ].filter(odo => odo > 0);

    let totalDistanceDriven = 0;
    if (allOdometerReadings.length >= 2) {
      totalDistanceDriven = Math.max(...allOdometerReadings) - Math.min(...allOdometerReadings);
    }

    // 2. استهلاك الوقود
    const powertrain = currentCar.powertrain || 'ice';
    const unit = powertrain === 'ev' ? 'kWh/100km' : 'L/100km';
    const validFuelRecords = myFuel.filter(f => safeNumber(f.odometer) > 0 && (safeNumber(f.liters) > 0 || safeNumber(f.kwh) > 0)).sort((a, b) => safeNumber(a.odometer) - safeNumber(b.odometer));

    let avgVal = null;
    if (validFuelRecords.length >= 2) {
      const firstOdo = safeNumber(validFuelRecords[0].odometer);
      const lastOdo = safeNumber(validFuelRecords[validFuelRecords.length - 1].odometer);
      const fuelDistance = lastOdo - firstOdo;
      let totalVolume = 0;
      for (let i = 1; i < validFuelRecords.length; i++) {
        totalVolume += safeNumber(validFuelRecords[i].liters ?? validFuelRecords[i].kwh ?? 0);
      }
      if (fuelDistance > 0 && totalVolume > 0) {
        const res = (totalVolume / fuelDistance) * 100;
        if (Number.isFinite(res) && res > 0) avgVal = Number(res.toFixed(1));
      }
    }

    // 3. تكلفة الكيلومتر
    const actualTotalExpenses = safeNumber(fetchedTotals?.total) || 0;
    let realCostPerKm = null;
    if (totalDistanceDriven > 0 && actualTotalExpenses > 0) {
      realCostPerKm = Number((actualTotalExpenses / totalDistanceDriven).toFixed(2));
    }

    // 4. ✅ إصلاح التنبؤ بالزيت (يدمج التذكيرات مع الصيانة)
    let nextOilChangeOdo = null;
    
    // البحث في سجلات الصيانة
    const oilMaintenance = myMaintenance.filter(m => (m.subType?.toLowerCase().includes('زيت') || m.subType?.toLowerCase().includes('oil')) && safeNumber(m.nextOdometer) > 0).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    if (oilMaintenance.length > 0) nextOilChangeOdo = safeNumber(oilMaintenance[0].nextOdometer);

    // البحث في التذكيرات (إذا لم نجد في الصيانة)
    if (!nextOilChangeOdo) {
      const oilReminder = myReminders.find(r => (r.title?.toLowerCase().includes('زيت') || r.title?.toLowerCase().includes('oil')) && safeNumber(r.targetOdometer) > 0);
      if (oilReminder) nextOilChangeOdo = safeNumber(oilReminder.targetOdometer);
    }

    // 5. بناء النشاط
    const activities = [
      ...myFuel.map(f => ({ ...f, type: 'fuel' })),
      ...myMaintenance.map(m => ({ ...m, type: 'maintenance' })),
      ...filter(expenseRecords).map(e => ({ ...e, type: 'expense' })),
      ...filter(incomeRecords).map(i => ({ ...i, type: 'income', cost: i.amount }))
    ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 5);

    setTotals({ 
      ...(fetchedTotals || { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0 }),
      avgConsumption: avgVal,
      avgUnit: unit,
      costPerKm: realCostPerKm,
      totalDistance: totalDistanceDriven,
      nextOilChangeOdo: nextOilChangeOdo
    });
    
    setRecentActivity(activities);
    setDocuments(myDocs);
    setReminders(myReminders);
    setMaintenanceRecords(myMaintenance);
    
  } catch (e) {
    console.error("Failed to refresh dashboard:", e);
  } finally {
    setIsLoading(false);
  }
}, [currentCar]);
