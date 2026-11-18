import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { dbService } from '../services/dbService.js';
import { useCar } from './CarContext.jsx';
import { useSettings } from './SettingsContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { computeDashboardData } from '../shared/utils/calculations.js';

export const DashboardContext = createContext();

const initialTotals = { fuel: 0, maintenance: 0, expenses: 0, total: 0, income: 0, net: 0, avgConsumption: null, avgUnit: 'L/100km', costPerKm: null, totalDistance: 0, nextOilChangeOdo: null, distanceToEmpty: null, dailyAverage: 0, nextTireChangeOdo: null };

export const DashboardProvider = ({ children }) => {
  const { currentCar, dataVersion } = useCar();
  const { lang } = useSettings();
  const { t } = useTranslation(lang);

  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState(initialTotals);
  const [recentActivity, setRecentActivity] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const refreshDashboard = useCallback(async () => {
    if (!currentCar) {
      setTotals(initialTotals);
      setRecentActivity([]); setDocuments([]); setReminders([]); setMaintenanceRecords([]); setNotifications([]);
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
      const myExpenses = filter(expenseRecords);
      const myIncomes = filter(incomeRecords);

      // استدعاء محرك الرياضيات النقي
      const computedData = computeDashboardData({
        currentCar, fetchedTotals, myFuel, myMaintenance, myDocs, myReminders, 
        expenseRecords: myExpenses, incomeRecords: myIncomes, t
      });

      setTotals(computedData.totals);
      setRecentActivity(computedData.recentActivity);
      setNotifications(computedData.notifications);
      setDocuments(myDocs);
      setReminders(myReminders);
      setMaintenanceRecords(myMaintenance);
      
    } catch (e) {
      console.error("Failed to refresh dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentCar, t]);

  useEffect(() => { refreshDashboard(); }, [refreshDashboard, dataVersion]);

  return (
    <DashboardContext.Provider value={{ isLoading, setIsLoading, totals, recentActivity, documents, reminders, maintenanceRecords, notifications, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
