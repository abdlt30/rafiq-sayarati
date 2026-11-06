// ... (نفس كود الترجمات السابق)

  const addNewCar = (carData) => {
    try {
      const newCar = { ...carData, id: Date.now().toString() };
      const updatedVehicles = [...vehicles, newCar];
      
      localStorage.setItem('savedCar', JSON.stringify(newCar));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
      setCurrentCar(newCar);
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error("Storage Error:", error);
      alert("مساحة التخزين ممتلئة. يرجى حذف بعض الصور أو السجلات.");
    }
  };

  const updateCar = (updatedCarData) => {
    try {
      const updatedVehicles = vehicles.map(v => v.id === updatedCarData.id ? updatedCarData : v);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
      if (currentCar?.id === updatedCarData.id) {
        localStorage.setItem('savedCar', JSON.stringify(updatedCarData));
        setCurrentCar(updatedCarData);
      }
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error("Storage Error:", error);
      alert("مساحة التخزين ممتلئة. تعذر حفظ الصورة.");
    }
  };

// ... (باقي الكود كما هو)
