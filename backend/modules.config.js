// تعریف ۱۲ ماژول AralOne و فیلدهای هرکدام — منبع اصلی برای بک‌اند
// هر رکورد به‌صورت JSON در جدول records ذخیره می‌شود و اعتبارسنجی بر اساس همین فیلدها انجام می‌شود.

const MODULES = {
  production: {
    title: "AralProduction",
    label: "مدیریت تولید",
    desc: "مدیریت خط تولید، ثبت راندمان، توقفات، ظرفیت مصرفی، تیراژ، تحلیل روزانه و ساعتی.",
    fields: [
      { key: "line_name", label: "نام خط تولید", type: "text", required: true },
      { key: "date", label: "تاریخ", type: "date", required: true },
      { key: "shift", label: "شیفت", type: "select", options: ["صبح", "عصر", "شب"], required: true },
      { key: "output_qty", label: "تیراژ تولید (عدد)", type: "number", required: true },
      { key: "downtime_min", label: "توقفات (دقیقه)", type: "number", required: false },
      { key: "capacity_used", label: "ظرفیت مصرفی (%)", type: "number", required: false }
    ]
  },
  quality: {
    title: "AralQuality",
    label: "کیفیت",
    desc: "ثبت آزمون‌های کیفی، تحلیل خطا، ردیابی قطعات معیوب، گزارشات لحظه‌ای و دوره‌ای.",
    fields: [
      { key: "batch_no", label: "شماره بچ", type: "text", required: true },
      { key: "test_date", label: "تاریخ آزمون", type: "date", required: true },
      { key: "defect_type", label: "نوع خطا", type: "text", required: false },
      { key: "defect_count", label: "تعداد قطعات معیوب", type: "number", required: false },
      { key: "result", label: "نتیجه", type: "select", options: ["قبول", "رد"], required: true },
      { key: "inspector", label: "بازرس", type: "text", required: false }
    ]
  },
  predict: {
    title: "AralPredict",
    label: "پیش‌بینی خرابی",
    desc: "پیش‌بینی خرابی دستگاه با داده‌های دما، صدا، لرزش، عکس؛ کاهش توقفات اضطراری.",
    fields: [
      { key: "machine_name", label: "نام دستگاه", type: "text", required: true },
      { key: "temperature", label: "دما (°C)", type: "number", required: false },
      { key: "vibration", label: "لرزش (mm/s)", type: "number", required: false },
      { key: "sound_level", label: "سطح صدا (dB)", type: "number", required: false },
      { key: "risk_score", label: "امتیاز ریسک (۰ تا ۱۰۰)", type: "number", required: true },
      { key: "recorded_at", label: "تاریخ ثبت", type: "date", required: true }
    ]
  },
  economy: {
    title: "AralEconomy",
    label: "اقتصاد و مالی",
    desc: "پیش‌بینی قیمت ارز، مواد اولیه، محاسبه قیمت تمام‌شده، تحلیل سود پروژه‌ها و قطعات با هوش مصنوعی.",
    fields: [
      { key: "item_name", label: "نام قطعه/پروژه", type: "text", required: true },
      { key: "raw_material_cost", label: "هزینه مواد اولیه", type: "number", required: false },
      { key: "final_cost", label: "قیمت تمام‌شده", type: "number", required: true },
      { key: "sale_price", label: "قیمت فروش", type: "number", required: false },
      { key: "profit_margin", label: "حاشیه سود (%)", type: "number", required: false },
      { key: "date", label: "تاریخ", type: "date", required: true }
    ]
  },
  supply: {
    title: "AralSupply",
    label: "زنجیره تأمین",
    desc: "تحلیل موجودی انبار، هشدار کمبود، پیش‌بینی سفارش هوشمند، پیشنهاد تأمین‌کننده.",
    fields: [
      { key: "material_name", label: "نام کالا/ماده", type: "text", required: true },
      { key: "stock_qty", label: "موجودی فعلی", type: "number", required: true },
      { key: "reorder_point", label: "نقطه سفارش مجدد", type: "number", required: false },
      { key: "supplier", label: "تأمین‌کننده پیشنهادی", type: "text", required: false },
      { key: "status", label: "وضعیت", type: "select", options: ["کافی", "نزدیک به اتمام", "بحرانی"], required: true }
    ]
  },
  service: {
    title: "AralService",
    label: "خدمات پس از فروش",
    desc: "مدیریت تماس‌های خدمات پس از فروش، تحلیل خرابی‌های رایج، پیشنهاد بهبود طراحی، مدیریت گارانتی.",
    fields: [
      { key: "customer_name", label: "نام مشتری", type: "text", required: true },
      { key: "product", label: "محصول", type: "text", required: true },
      { key: "issue", label: "شرح ایراد", type: "textarea", required: true },
      { key: "warranty_status", label: "وضعیت گارانتی", type: "select", options: ["در گارانتی", "خارج از گارانتی"], required: true },
      { key: "status", label: "وضعیت پیگیری", type: "select", options: ["باز", "در حال بررسی", "بسته‌شده"], required: true },
      { key: "date", label: "تاریخ تماس", type: "date", required: true }
    ]
  },
  ai: {
    title: "AralAI",
    label: "تحلیل هوشمند",
    desc: "ترکیب داده‌های تولید، کیفیت، مالی، لجستیک و ارائه تحلیل کل‌نگر مدیریتی با هوش مصنوعی.",
    fields: [
      { key: "report_title", label: "عنوان تحلیل", type: "text", required: true },
      { key: "category", label: "حوزه", type: "select", options: ["تولید", "کیفیت", "مالی", "تأمین", "کلی"], required: true },
      { key: "summary", label: "خلاصه تحلیل", type: "textarea", required: true },
      { key: "generated_at", label: "تاریخ تولید گزارش", type: "date", required: true }
    ]
  },
  develop: {
    title: "AralDevelop",
    label: "توسعه زیرساخت",
    desc: "تحلیل ظرفیت، بودجه و سود؛ پیشنهاد توسعه زیرساخت (سوله، خط تولید، خرید ماشین‌آلات).",
    fields: [
      { key: "project_name", label: "نام طرح توسعه", type: "text", required: true },
      { key: "budget", label: "بودجه موردنیاز", type: "number", required: true },
      { key: "expected_profit", label: "سود پیش‌بینی‌شده", type: "number", required: false },
      { key: "capacity_needed", label: "ظرفیت موردنیاز", type: "text", required: false },
      { key: "status", label: "وضعیت طرح", type: "select", options: ["پیشنهادی", "در بررسی", "تصویب‌شده", "رد‌شده"], required: true }
    ]
  },
  future: {
    title: "AralFuture",
    label: "چشم‌انداز آینده",
    desc: "پیشنهاد ورود به بازارهای جدید، تحلیل مواد پررونق (مثل فولاد)، ارزیابی تبدیل شرکت به هلدینگ.",
    fields: [
      { key: "market_name", label: "نام بازار/فرصت", type: "text", required: true },
      { key: "analysis", label: "تحلیل", type: "textarea", required: true },
      { key: "potential_score", label: "امتیاز پتانسیل (۰ تا ۱۰۰)", type: "number", required: true },
      { key: "date", label: "تاریخ ارزیابی", type: "date", required: true }
    ]
  },
  import: {
    title: "AralImport",
    label: "واردات",
    desc: "پیشنهاد واردات قطعات یا مواد خاص با سود بالا؛ مقایسه هزینه تولید در برابر واردات.",
    fields: [
      { key: "item_name", label: "نام قطعه/کالا", type: "text", required: true },
      { key: "import_cost", label: "هزینه واردات", type: "number", required: true },
      { key: "local_cost", label: "هزینه تولید داخلی", type: "number", required: true },
      { key: "recommendation", label: "پیشنهاد", type: "select", options: ["واردات", "تولید داخلی", "نیاز به بررسی بیشتر"], required: true }
    ]
  },
  manage: {
    title: "AralManage",
    label: "داشبورد مدیریتی",
    desc: "داشبورد مدیریتی برای مدیران کلان؛ نمایش KPI، تولید، کیفیت، مالی، زنجیره تأمین.",
    dashboard: true,
    fields: []
  },
  edu: {
    title: "AralEdu",
    label: "آموزش کارکنان",
    desc: "آموزش کارکنان با محتوای متنی و تصویری؛ شامل آموزش تولید، نگهداری، کیفیت و ایمنی.",
    fields: [
      { key: "title", label: "عنوان آموزش", type: "text", required: true },
      { key: "category", label: "دسته‌بندی", type: "select", options: ["تولید", "نگهداری", "کیفیت", "ایمنی"], required: true },
      { key: "content_type", label: "نوع محتوا", type: "select", options: ["متنی", "تصویری", "ویدیویی"], required: true },
      { key: "description", label: "توضیحات", type: "textarea", required: false }
    ]
  }
};

module.exports = { MODULES };
