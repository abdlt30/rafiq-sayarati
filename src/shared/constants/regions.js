// ✅ خريطة ربط العملة بالبلد وكلمات البحث المناسبة (مُحسنة لمحركات البحث)
export const REGIONS = {
  MAD: { // المغرب
    country: 'MA',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات المغرب', parts: 'قطع غيار سيارات المغرب', towing: 'دبناج سطحة سحب المغرب', fuel: 'محطة وقود المغرب' },
      fr: { repair: 'garage mécanique maroc', parts: 'pièces auto maroc', towing: 'remorquage dépannage maroc', fuel: 'station essence maroc' },
      en: { repair: 'auto repair shop morocco', parts: 'auto parts morocco', towing: 'towing service morocco', fuel: 'gas station morocco' }
    },
    subKeywords: {
      ar: {
        repair: [{ id: 'mechanic', label: 'ميكانيكي', query: 'ميكانيكي سيارات' }, { id: 'electrician', label: 'كهربائي', query: 'كهرباء سيارات' }, { id: 'inspection', label: 'فحص تقني', query: 'مركز فحص تقني' }],
        parts: [{ id: 'new', label: 'جديد', query: 'قطع غيار جديدة' }, { id: 'used', label: 'مستعمل', query: 'قطع غيار مستعملة' }]
      },
      fr: {
        repair: [{ id: 'mechanic', label: 'Mécanicien', query: 'mécanicien auto' }, { id: 'electrician', label: 'Électricien', query: 'électricité auto' }, { id: 'inspection', label: 'Contrôle', query: 'centre contrôle technique' }],
        parts: [{ id: 'new', label: 'Neuf', query: 'pièces auto neuves' }, { id: 'used', label: 'Occasion', query: 'casse auto pièces occasion' }]
      },
      en: {
        repair: [{ id: 'mechanic', label: 'Mechanic', query: 'car mechanic' }, { id: 'electrician', label: 'Electrician', query: 'auto electrician' }],
        parts: [{ id: 'new', label: 'New', query: 'new auto parts' }, { id: 'used', label: 'Used', query: 'used auto parts' }]
      }
    }
  },
  SAR: { // السعودية
    country: 'SA',
    keywords: {
      ar: { repair: 'ورشة صيانة سيارات السعودية', parts: 'قطع غيار سيارات السعودية', towing: 'سطحة سحب سيارات السعودية', fuel: 'محطة وقود السعودية' },
      en: { repair: 'auto repair shop saudi arabia', parts: 'auto parts saudi arabia', towing: 'towing service saudi arabia', fuel: 'gas station saudi arabia' }
    }
  },
  AED: { // الإمارات
    country: 'AE',
    keywords: {
      ar: { repair: 'ورشة سيارات الإمارات', parts: 'قطع غيار سيارات الإمارات', towing: 'سطحة سحب الإمارات', fuel: 'محطة وقود الإمارات' },
      en: { repair: 'auto repair shop uae', parts: 'auto parts uae', towing: 'towing recovery uae', fuel: 'gas station uae' }
    }
  },
  EGP: { // مصر
    country: 'EG',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات مصر', parts: 'قطع غيار سيارات مصر', towing: 'ونش سحب سيارات مصر', fuel: 'محطة بنزين مصر' },
      en: { repair: 'auto repair shop egypt', parts: 'auto parts egypt', towing: 'towing service egypt', fuel: 'gas station egypt' }
    }
  },
  KWD: { // الكويت
    country: 'KW',
    keywords: {
      ar: { repair: 'ورشة سيارات الكويت', parts: 'قطع غيار سيارات الكويت', towing: 'ونش كرين سطحة الكويت', fuel: 'محطة وقود الكويت' },
      en: { repair: 'auto repair shop kuwait', parts: 'auto parts kuwait', towing: 'towing service kuwait', fuel: 'gas station kuwait' }
    }
  },
  QAR: { // قطر
    country: 'QA',
    keywords: {
      ar: { repair: 'ورشة سيارات قطر', parts: 'قطع غيار سيارات قطر', towing: 'سطحة ونش قطر', fuel: 'محطة وقود قطر' },
      en: { repair: 'auto repair shop qatar', parts: 'auto parts qatar', towing: 'towing service qatar', fuel: 'gas station qatar' }
    }
  },
  BHD: { // البحرين
    country: 'BH',
    keywords: {
      ar: { repair: 'ورشة سيارات البحرين', parts: 'قطع غيار سيارات البحرين', towing: 'سطحة ونش البحرين', fuel: 'محطة وقود البحرين' },
      en: { repair: 'auto repair shop bahrain', parts: 'auto parts bahrain', towing: 'towing service bahrain', fuel: 'gas station bahrain' }
    }
  },
  OMR: { // عمان
    country: 'OM',
    keywords: {
      ar: { repair: 'ورشة سيارات عمان', parts: 'قطع غيار سيارات عمان', towing: 'سطحة ونش عمان', fuel: 'محطة وقود عمان' },
      en: { repair: 'auto repair shop oman', parts: 'auto parts oman', towing: 'towing service oman', fuel: 'gas station oman' }
    }
  },
  JOD: { // الأردن
    country: 'JO',
    keywords: {
      ar: { repair: 'ورشة سيارات الأردن', parts: 'قطع غيار سيارات الأردن', towing: 'ونش كرين سطحة الأردن', fuel: 'محطة وقود الأردن' },
      en: { repair: 'auto repair shop jordan', parts: 'auto parts jordan', towing: 'towing service jordan', fuel: 'gas station jordan' }
    }
  },
  DZD: { // الجزائر
    country: 'DZ',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات الجزائر', parts: 'قطع غيار سيارات الجزائر', towing: 'دبناج سحب الجزائر', fuel: 'محطة وقود الجزائر' },
      fr: { repair: 'mécanicien auto algerie', parts: 'pièces auto algerie', towing: 'dépannage remorquage algerie', fuel: 'station essence algerie' }
    }
  },
  TND: { // تونس
    country: 'TN',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات تونس', parts: 'قطع غيار سيارات تونس', towing: 'دبناج سحب تونس', fuel: 'محطة وقود تونس' },
      fr: { repair: 'mécanicien auto tunisie', parts: 'pièces auto tunisie', towing: 'dépannage remorquage tunisie', fuel: 'station essence tunisie' }
    }
  },
  LYD: { // ليبيا
    country: 'LY',
    keywords: {
      ar: { repair: 'ورشة سيارات ليبيا', parts: 'قطع غيار سيارات ليبيا', towing: 'ونش سطحة ليبيا', fuel: 'محطة وقود ليبيا' },
      en: { repair: 'auto repair shop libya', parts: 'auto parts libya', towing: 'towing service libya', fuel: 'gas station libya' }
    }
  },
  USD: { 
    country: 'US', 
    keywords: { en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' } } 
  },
  EUR: { 
    country: 'EU', 
    keywords: { en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' } } 
  }
};

// ✅ دالة مساعدة لجلب الكلمات المفتاحية بناءً على العملة واللغة
export const getSearchKeywords = (currency, lang) => {
  const region = REGIONS[currency] || REGIONS.USD;
  let keywords = region.keywords[lang];
  if (!keywords) {
    keywords = region.keywords['ar'] || region.keywords['en'];
  }
  return keywords;
};

// ✅ دالة جديدة لجلب كود الدولة (مهمة جداً لتحديد موقع خرائط جوجل)
export const getCountryCode = (currency) => {
  const region = REGIONS[currency] || REGIONS['USD'];
  return region.country;
};
