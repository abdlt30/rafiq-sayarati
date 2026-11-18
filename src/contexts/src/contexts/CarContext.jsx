import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { dbService } from '../services/dbService.js';

export const CarContext = createContext();

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch { /* fallback */ }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
};

export const CarProvider = ({ children }) => {
  const [currentCar, setCurrentCar] = useState(() => {
    try { const saved = localStorage.getItem('savedCar'); if (!saved || saved === 'null') return null; return JSON.parse(saved); } catch { return null; }
  });
  
  const [vehicles, setVehicles] = useState(() => {
    try { const parsedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]'); if (Array.isArray(parsedVehicles) && parsedVehicles.length > 0) return parsedVehicles; const parsedCar = JSON.parse(localStorage.getItem('savedCar') || 'null'); return parsedCar ? [parsedCar] : []; } catch { return []; }
  });

  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = useCallback(() => setDataVersion(v => v + 1), []);

  // مزامنة التخزين المحلي بأمان (تجنب Impure State Setters)
  useEffect(() => {
    try {
      localStorage.setItem('vehicles', JSON.stringify(vehicles));
      if (currentCar) localStorage.setItem('savedCar', JSON.stringify(currentCar));
      else localStorage.removeItem('savedCar');
    } catch (e) { console.error("Storage Error", e); }
  }, [vehicles, currentCar]);

  const validateOdometer = (input, { required = false } = {}) => {
    if (input === undefined || input === null || String(input).trim() === '') return required ? { valid: false } : { valid: true, value: 0 };
    const num = Number(String(input).trim());
    if (!Number.isFinite(num) || num < 0) return { valid: false };
    return { valid: true, value: Math.round(num) };
  };

  const addNewCar = useCallback((carData) => {
    if (!carData || typeof carData !== 'object') return false;
    const odoCheck = validateOdometer(carData.odometer, { required: false });
    if (!odoCheck.valid) return false;
    
    const newCar = { ...carData, odometer: odoCheck.value, id: generateId() };
    setVehicles(prev => [...prev, newCar]);
    setCurrentCar(newCar); 
    bumpDataVersion(); 
    return true;
  }, [bumpDataVersion]);

  const updateCar = useCallback((carId, updatedData) => {
    if (!carId || !updatedData) return false;
    const odoCheck = validateOdometer(updatedData.odometer, { required: true });
    if (updatedData.odometer !== undefined && !odoCheck.valid) return false;
    
    const sanitized = updatedData.odometer !== undefined ? { ...updatedData, odometer: odoCheck.value } : updatedData;
    setVehicles(prev => prev.map(v => String(v.id) === String(carId) ? { ...v, ...sanitized } : v));
    setCurrentCar(prevCar => String(prevCar?.id) === String(carId) ? { ...prevCar, ...sanitized } : prevCar);
    bumpDataVersion(); 
    return true;
  }, [bumpDataVersion]);

  const deleteCar = useCallback(async (id) => {
    if (!id) return false;
    if (dbService?.deleteCarData) await dbService.deleteCarData(id);
    
    setVehicles(prev => {
      const updated = prev.filter(v => String(v.id) !== String(id));
      setCurrentCar(prevCar => {
        if (String(prevCar?.id) === String(id)) return updated.length > 0 ? updated[0] : null;
        return prevCar;
      });
      return updated;
    });
    bumpDataVersion(); 
    return true;
  }, [bumpDataVersion]);

  const selectCar = useCallback((car) => {
    if (!car || typeof car !== 'object') return false;
    setCurrentCar(car); 
    bumpDataVersion(); 
    return true;
  }, [bumpDataVersion]);

  return (
    <CarContext.Provider value={{ currentCar, vehicles, addNewCar, updateCar, deleteCar, selectCar, dataVersion, bumpDataVersion }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => useContext(CarContext);
