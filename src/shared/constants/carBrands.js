// src/shared/constants/carBrands.js

// قائمة شاملة بأشهر العلامات التجارية للسيارات ودوميناتها الرسمية
export const CAR_BRANDS = [
  // 1. الماركات الأكثر انتشاراً في العالم العربي
  { id: 'toyota', name: 'Toyota', domain: 'toyota.com' },
  { id: 'nissan', name: 'Nissan', domain: 'nissan-global.com' },
  { id: 'hyundai', name: 'Hyundai', domain: 'hyundai.com' },
  { id: 'kia', name: 'Kia', domain: 'kia.com' },
  { id: 'ford', name: 'Ford', domain: 'ford.com' },
  { id: 'chevrolet', name: 'Chevrolet', domain: 'chevrolet.com' },
  { id: 'mitsubishi', name: 'Mitsubishi', domain: 'mitsubishi-motors.com' },
  { id: 'mazda', name: 'Mazda', domain: 'mazda.com' },
  { id: 'honda', name: 'Honda', domain: 'honda.com' },
  { id: 'suzuki', name: 'Suzuki', domain: 'suzuki.co.jp' },
  { id: 'renault', name: 'Renault', domain: 'renaultgroup.com' },
  { id: 'peugeot', name: 'Peugeot', domain: 'peugeot.com' },
  { id: 'dacia', name: 'Dacia', domain: 'dacia.com' },
  { id: 'citroen', name: 'Citroen', domain: 'citroen.com' },
  { id: 'fiat', name: 'Fiat', domain: 'fiat.com' },
  { id: 'jeep', name: 'Jeep', domain: 'jeep.com' },
  { id: 'gmc', name: 'GMC', domain: 'gmc.com' },
  { id: 'dodge', name: 'Dodge', domain: 'dodge.com' },
  { id: 'ram', name: 'RAM', domain: 'ramtrucks.com' },
  { id: 'isuzu', name: 'Isuzu', domain: 'isuzu.com' },

  // 2. الماركات الصينية (الأكثر نمواً في الشرق الأوسط وشمال أفريقيا)
  { id: 'changan', name: 'Changan', domain: 'globalchangan.com' },
  { id: 'geely', name: 'Geely', domain: 'geely.com' },
  { id: 'chery', name: 'Chery', domain: 'cheryinternational.com' },
  { id: 'mg', name: 'MG', domain: 'mgmotor.com' },
  { id: 'byd', name: 'BYD', domain: 'byd.com' },
  { id: 'haval', name: 'Haval', domain: 'haval-global.com' },
  { id: 'greatwall', name: 'Great Wall', domain: 'gwm-global.com' },
  { id: 'jetour', name: 'Jetour', domain: 'jetourglobal.com' },
  { id: 'omoda', name: 'Omoda', domain: 'omoda.com' },
  { id: 'jaecoo', name: 'Jaecoo', domain: 'jaecoo.com' },
  { id: 'exeed', name: 'Exeed', domain: 'exeedcars.com' },
  { id: 'hongqi', name: 'Hongqi', domain: 'hongqi-auto.com' },
  { id: 'baic', name: 'BAIC', domain: 'baicmotor.com' },
  { id: 'jac', name: 'JAC', domain: 'jac.com.cn' },
  { id: 'dongfeng', name: 'Dongfeng', domain: 'dongfeng-global.com' },
  { id: 'faw', name: 'FAW', domain: 'faw.com' },

  // 3. الماركات الفاخرة والرياضية
  { id: 'bmw', name: 'BMW', domain: 'bmw.com' },
  { id: 'mercedes', name: 'Mercedes-Benz', domain: 'mercedes-benz.com' },
  { id: 'audi', name: 'Audi', domain: 'audi.com' },
  { id: 'lexus', name: 'Lexus', domain: 'lexus.com' },
  { id: 'infiniti', name: 'Infiniti', domain: 'infiniti.com' },
  { id: 'acura', name: 'Acura', domain: 'acura.com' },
  { id: 'cadillac', name: 'Cadillac', domain: 'cadillac.com' },
  { id: 'lincoln', name: 'Lincoln', domain: 'lincoln.com' },
  { id: 'buick', name: 'Buick', domain: 'buick.com' },
  { id: 'genesis', name: 'Genesis', domain: 'genesis.com' },
  { id: 'landrover', name: 'Land Rover', domain: 'landrover.com' },
  { id: 'jaguar', name: 'Jaguar', domain: 'jaguar.com' },
  { id: 'porsche', name: 'Porsche', domain: 'porsche.com' },
  { id: 'maserati', name: 'Maserati', domain: 'maserati.com' },
  { id: 'bentley', name: 'Bentley', domain: 'bentleymotors.com' },
  { id: 'ferrari', name: 'Ferrari', domain: 'ferrari.com' },
  { id: 'lamborghini', name: 'Lamborghini', domain: 'lamborghini.com' },
  { id: 'astonmartin', name: 'Aston Martin', domain: 'astonmartin.com' },
  { id: 'rollsroyce', name: 'Rolls-Royce', domain: 'rolls-roycemotorcars.com' },
  { id: 'bugatti', name: 'Bugatti', domain: 'bugatti.com' },
  { id: 'mclaren', name: 'McLaren', domain: 'mclaren.com' },
  { id: 'lotus', name: 'Lotus', domain: 'lotuscars.com' },
  { id: 'alfaromeo', name: 'Alfa Romeo', domain: 'alfaromeo.com' },
  { id: 'abarth', name: 'Abarth', domain: 'abarth.com' },
  { id: 'lancia', name: 'Lancia', domain: 'lancia.com' },
  { id: 'alpine', name: 'Alpine', domain: 'alpinecars.com' },
  { id: 'ds', name: 'DS Automobiles', domain: 'dsautomobiles.com' },

  // 4. الماركات الكهربائية والحديثة (EVs)
  { id: 'tesla', name: 'Tesla', domain: 'tesla.com' },
  { id: 'polestar', name: 'Polestar', domain: 'polestar.com' },
  { id: 'lucid', name: 'Lucid', domain: 'lucidmotors.com' },
  { id: 'rivian', name: 'Rivian', domain: 'rivian.com' },
  { id: 'nio', name: 'NIO', domain: 'nio.com' },
  { id: 'xpeng', name: 'XPeng', domain: 'heyxpeng.com' },
  { id: 'fisker', name: 'Fisker', domain: 'fiskerinc.com' },
  { id: 'smart', name: 'Smart', domain: 'smart.com' },

  // 5. ماركات أوروبية وأخرى
  { id: 'volkswagen', name: 'Volkswagen', domain: 'volkswagen.com' },
  { id: 'volvo', name: 'Volvo', domain: 'volvocars.com' },
  { id: 'skoda', name: 'Skoda', domain: 'skoda-auto.com' },
  { id: 'seat', name: 'Seat', domain: 'seat.com' },
  { id: 'cupra', name: 'Cupra', domain: 'cupraofficial.com' },
  { id: 'opel', name: 'Opel', domain: 'opel.com' },
  { id: 'mini', name: 'Mini', domain: 'minicountryman.com' },
  { id: 'subaru', name: 'Subaru', domain: 'subaru.com' },
  { id: 'daihatsu', name: 'Daihatsu', domain: 'daihatsu.com' },
  { id: 'chrysler', name: 'Chrysler', domain: 'chrysler.com' },
  { id: 'ssangyong', name: 'SsangYong', domain: 'kg-mobility.com' },
  { id: 'tata', name: 'Tata', domain: 'tatamotors.com' },
  { id: 'mahindra', name: 'Mahindra', domain: 'mahindra.com' },
  { id: 'proton', name: 'Proton', domain: 'proton.com' },
  { id: 'saab', name: 'Saab', domain: 'saab.com' },
  { id: 'vauxhall', name: 'Vauxhall', domain: 'vauxhall.co.uk' },
  { id: 'shelby', name: 'Shelby', domain: 'shelby.com' }
];

/**
 * دالة مساعدة لجلب رابط الشعار من خادم Clearbit المجاني.
 * نطلب حجم 128 بكسل لتسريع التحميل وتوفير بيانات المستخدم.
 */
export const getBrandLogoUrl = (domain) => {
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}?size=128`;
};

/**
 * دالة ذكية للبحث عن ماركة بناءً على اسم السيارة.
 * مثال: إذا كتب "Ford Trinsed" سيبحث عن "ford".
 * السر هنا: نقوم بترتيب الماركات حسب طول الاسم (من الأطول للأقصر) 
 * لضمان عدم حدوث تداخل، فمثلاً "Land Rover" يجب أن تلتقط قبل "Rover".
 */
export const findBrandByName = (carName) => {
  if (!carName) return null;
  
  const nameLower = carName.toLowerCase();
  
  // الترتيب الديناميكي (رياضياً) لضمان الدقة
  const sortedBrands = [...CAR_BRANDS].sort((a, b) => b.name.length - a.name.length);
  
  return sortedBrands.find(brand => nameLower.includes(brand.name.toLowerCase())) || null;
};
