// ✅ خريطة ربط العملة بالبلد وكلمات البحث المناسبة (مُحسنة لمحركات البحث)
export const REGIONS = {
  MAD: { // المغرب
    country: 'MA',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات', parts: 'قطع غيار سيارات', towing: 'دبناج سطحة سحب', fuel: 'محطة وقود' },
      fr: { repair: 'garage mécanique', parts: 'pièces auto', towing: 'remorquage dépannage', fuel: 'station essence' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
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
      ar: { repair: 'ورشة صيانة سيارات', parts: 'قطع غيار سيارات', towing: 'سطحة سحب سيارات', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    },
    subKeywords: {
      ar: {
        repair: [{ id: 'mechanic', label: 'ميكانيكي', query: 'ورشة ميكانيكا سيارات' }, { id: 'electrician', label: 'كهربائي', query: 'كهرباء سيارات' }, { id: 'bodywork', label: 'سمكرة', query: 'سمكرة وصباغة سيارات' }, { id: 'tires', label: 'بنشري', query: 'بنشري إطارات' }],
        parts: [{ id: 'new', label: 'جديد', query: 'قطع غيار جديدة' }, { id: 'used', label: 'تشليح', query: 'تشليح قطع غيار' }]
      },
      en: {
        repair: [{ id: 'mechanic', label: 'Mechanic', query: 'car mechanic' }, { id: 'bodywork', label: 'Body Shop', query: 'auto body shop' }],
        parts: [{ id: 'new', label: 'New', query: 'new auto parts' }, { id: 'used', label: 'Used', query: 'salvage yard auto parts' }]
      }
    }
  },
  AED: { // الإمارات
    country: 'AE',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'سطحة سحب', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing recovery', fuel: 'gas station' }
    },
    subKeywords: {
      en: {
        repair: [{ id: 'mechanic', label: 'Mechanic', query: 'car mechanic' }, { id: 'electrician', label: 'Electrician', query: 'auto electrician' }, { id: 'bodywork', label: 'Body Shop', query: 'auto body shop' }],
        parts: [{ id: 'new', label: 'New', query: 'new auto parts' }, { id: 'used', label: 'Used', query: 'used auto parts' }]
      }
    }
  },
  EGP: { // مصر
    country: 'EG',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات', parts: 'قطع غيار سيارات', towing: 'ونش سحب سيارات', fuel: 'محطة بنزين' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    },
    subKeywords: {
      ar: {
        repair: [{ id: 'mechanic', label: 'ميكانيكي', query: 'ميكانيكي سيارات' }, { id: 'electrician', label: 'كهربائي', query: 'كهربائي سيارات' }, { id: 'bodywork', label: 'سمكري', query: 'سمكري سيارات' }, { id: 'tires', label: 'كاوتش', query: 'إصلاح كاوتش' }],
        parts: [{ id: 'new', label: 'جديد', query: 'قطع غيار جديدة' }, { id: 'used', label: 'استيراد', query: 'قطع غيار استيراد' }]
      }
    }
  },
  KWD: { // الكويت
    country: 'KW',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'ونش كرين سطحة', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    },
    subKeywords: {
      ar: {
        repair: [{ id: 'mechanic', label: 'ميكانيكي', query: 'ميكانيكي سيارات' }, { id: 'electrician', label: 'كهربائي', query: 'كهربائي سيارات' }],
        parts: [{ id: 'new', label: 'جديد', query: 'قطع غيار جديدة' }, { id: 'used', label: 'تشليح', query: 'تشليح قطع غيار' }]
      }
    }
  },
  QAR: { // قطر
    country: 'QA',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'سطحة ونش', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    }
  },
  BHD: { // البحرين
    country: 'BH',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'سطحة ونش', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    }
  },
  OMR: { // عمان
    country: 'OM',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'سطحة ونش', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    }
  },
  JOD: { // الأردن
    country: 'JO',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'ونش كرين سطحة', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    }
  },
  DZD: { // الجزائر
    country: 'DZ',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات', parts: 'قطع غيار سيارات', towing: 'دبناج سحب', fuel: 'محطة وقود' },
      fr: { repair: 'mécanicien auto', parts: 'pièces auto', towing: 'dépannage remorquage', fuel: 'station essence' }
    }
  },
  TND: { // تونس
    country: 'TN',
    keywords: {
      ar: { repair: 'ميكانيكي سيارات', parts: 'قطع غيار سيارات', towing: 'دبناج سحب', fuel: 'محطة وقود' },
      fr: { repair: 'mécanicien auto', parts: 'pièces auto', towing: 'dépannage remorquage', fuel: 'station essence' }
    }
  },
  LYD: { // ليبيا
    country: 'LY',
    keywords: {
      ar: { repair: 'ورشة سيارات', parts: 'قطع غيار سيارات', towing: 'ونش سطحة', fuel: 'محطة وقود' },
      en: { repair: 'auto repair shop', parts: 'auto parts', towing: 'towing service', fuel: 'gas station' }
    }
  },
  // العملات العالمية (افتراضي)
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
  
  // محاولة جلب الكلمات بلغة التطبيق الحالية
  let keywords = region.keywords[lang];
  
  // إذا لم توجد الكلمات بهذه اللغة، نستخدم العربية (للدول العربية) أو الإنجليزية (كاحتياط أخير)
  if (!keywords) {
    keywords = region.keywords['ar'] || region.keywords['en'];
  }
  
  return keywords;
};
