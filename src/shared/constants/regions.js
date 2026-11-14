// ✅ خريطة ربط العملة بالبلد وكلمات البحث المناسبة
// يمكنك إضافة المزيد من الدول بسهولة هنا
export const REGIONS = {
  MAD: { // المغرب
    country: 'MA',
    keywords: {
      repair: 'garage mécanique',
      parts: 'pièces auto',
      towing: 'remorquage dépannage dberg',
      fuel: 'station essence'
    }
  },
  SAR: { // السعودية
    country: 'SA',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'سطحة سحب سيارات',
      fuel: 'محطة وقود'
    }
  },
  AED: { // الإمارات
    country: 'AE',
    keywords: {
      repair: 'auto repair shop',
      parts: 'auto parts',
      towing: 'towing service',
      fuel: 'gas station'
    }
  },
  EGP: { // مصر
    country: 'EG',
    keywords: {
      repair: 'ميكانيكي سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'ونش سحب سيارات',
      fuel: 'محطة بنزين'
    }
  },
  KWD: { // الكويت
    country: 'KW',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'ونش كرين سطحة',
      fuel: 'محطة وقود'
    }
  },
  QAR: { // قطر
    country: 'QA',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'سطحة ونش',
      fuel: 'محطة وقود'
    }
  },
  BHD: { // البحرين
    country: 'BH',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'سطحة ونش',
      fuel: 'محطة وقود'
    }
  },
  OMR: { // عمان
    country: 'OM',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'سطحة ونش',
      fuel: 'محطة وقود'
    }
  },
  JOD: { // الأردن
    country: 'JO',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'ونش كرين سطحة',
      fuel: 'محطة وقود'
    }
  },
  DZD: { // الجزائر
    country: 'DZ',
    keywords: {
      repair: 'mécanicien auto',
      parts: 'pièces auto',
      towing: 'dépannage remorquage',
      fuel: 'station essence'
    }
  },
  TND: { // تونس
    country: 'TN',
    keywords: {
      repair: 'mécanicien auto',
      parts: 'pièces auto',
      towing: 'dépannage remorquage',
      fuel: 'station essence'
    }
  },
  LYD: { // ليبيا
    country: 'LY',
    keywords: {
      repair: 'ورشة سيارات',
      parts: 'قطع غيار سيارات',
      towing: 'ونش سطحة',
      fuel: 'محطة وقود'
    }
  },
  // العملات العالمية (افتراضي)
  USD: { country: 'US', keywords: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' } },
  EUR: { country: 'EU', keywords: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' } }
};

// ✅ دالة مساعدة لجلب الكلمات المفتاحية بناءً على العملة واللغة
export const getSearchKeywords = (currency, lang) => {
  const region = REGIONS[currency] || REGIONS.USD; // افتراضي: USD
  const keywords = region.keywords;
  
  // إذا كانت اللغة عربية، نستخدم الكلمات العربية (إن وجدت)
  if (lang === 'ar' && keywords.repair.includes(' ')) {
    // نفترض أن الكلمات العربية تحتوي على مسافات، بينما الإنجليزية/الفرنسية قد لا تحتوي
    // هذا مجرد فحص بسيط، الأفضل تحديد الكلمات لكل لغة في الهيكل أعلاه
  }
  
  return keywords;
};
