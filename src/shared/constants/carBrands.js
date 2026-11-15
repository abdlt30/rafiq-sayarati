// src/shared/constants/carBrands.js
export const CAR_BRANDS = [
  { id: 'toyota', name: 'Toyota', domain: 'toyota.com' },
  { id: 'ford', name: 'Ford', domain: 'ford.com' },
  { id: 'bmw', name: 'BMW', domain: 'bmw.com' },
  { id: 'mercedes', name: 'Mercedes-Benz', domain: 'mercedes-benz.com' },
  { id: 'audi', name: 'Audi', domain: 'audi.com' },
  { id: 'hyundai', name: 'Hyundai', domain: 'hyundai.com' },
  { id: 'kia', name: 'Kia', domain: 'kia.com' },
  { id: 'nissan', name: 'Nissan', domain: 'nissan-global.com' },
  { id: 'renault', name: 'Renault', domain: 'renaultgroup.com' },
  { id: 'peugeot', name: 'Peugeot', domain: 'peugeot.com' },
  { id: 'volkswagen', name: 'Volkswagen', domain: 'volkswagen.com' },
  { id: 'honda', name: 'Honda', domain: 'honda.com' },
  { id: 'mitsubishi', name: 'Mitsubishi', domain: 'mitsubishi-motors.com' },
  { id: 'chevrolet', name: 'Chevrolet', domain: 'chevrolet.com' },
  { id: 'fiat', name: 'Fiat', domain: 'fiat.com' },
  { id: 'jeep', name: 'Jeep', domain: 'jeep.com' },
  { id: 'landrover', name: 'Land Rover', domain: 'landrover.com' },
  { id: 'porsche', name: 'Porsche', domain: 'porsche.com' },
  { id: 'tesla', name: 'Tesla', domain: 'tesla.com' },
  { id: 'volvo', name: 'Volvo', domain: 'volvocars.com' },
  // يمكنك إضافة المزيد هنا بسهولة
];

// دالة مساعدة لجلب رابط الشعار من خادم Clearbit المجاني
export const getBrandLogoUrl = (domain) => {
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}`;
};

// دالة للبحث عن ماركة بناءً على اسم السيارة المدخل
export const findBrandByName = (carName) => {
  if (!carName) return null;
  const nameLower = carName.toLowerCase();
  return CAR_BRANDS.find(brand => nameLower.includes(brand.name.toLowerCase()));
};
