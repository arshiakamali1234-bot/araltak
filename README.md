# AralOne

اپلیکیشن کامل **AralOne** (آرال‌تک) — ۱۲ ماژول صنعتی، هرکدام با صفحه اختصاصی، فرم افزودن/ویرایش، جدول رکوردها و بک‌اند واقعی (Node.js + Express + SQLite).

## ساختار پروژه

```
aralone/
├── backend/
│   ├── server.js            # سرور Express + مسیرهای API + سرو فرانت‌اند
│   ├── db.js                 # اتصال و ساخت جدول SQLite
│   ├── modules.config.js     # تعریف ۱۲ ماژول و فیلدهای هرکدام (منبع اصلی)
│   ├── package.json
│   └── .gitignore
└── public/
    ├── index.html            # صفحه اصلی — لیست ماژول‌ها (از API خوانده می‌شود)
    ├── module.html + module.js   # صفحه عمومی هر ماژول (CRUD کامل، بر اساس اسلاگ در URL)
    ├── manage.html + manage.js   # داشبورد مدیریتی AralManage با KPIهای واقعی
    ├── home.js, config.js
    └── styles.css
```

هر ماژول (AralProduction, AralQuality, AralPredict, AralEconomy, AralSupply,
AralService, AralAI, AralDevelop, AralFuture, AralImport, AralEdu) یک صفحه
اختصاصی روی مسیر `module.html?m=<slug>` دارد که مستقیماً با API واقعی صحبت
می‌کند: افزودن، ویرایش، حذف و مشاهده رکوردها. **AralManage** به‌صورت داشبورد
تجمیعی از داده واقعی سایر ماژول‌ها عمل می‌کند (بدون فرم رکورد مستقیم).

## اجرای محلی

```bash
cd backend
npm install
npm start
```

سپس مرورگر را روی آدرس زیر باز کنید:

```
http://localhost:4000
```

فرانت‌اند و بک‌اند هر دو از همین سرور (پورت ۴۰۰۰) سرو می‌شوند؛ نیازی به تنظیم CORS یا آدرس جدا نیست.

داده‌ها در فایل `backend/aralone.db` (SQLite) ذخیره می‌شوند و بین اجراهای مختلف باقی می‌مانند.

## API

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/api/modules` | لیست همه ماژول‌ها و فیلدهایشان |
| GET | `/api/modules/:slug` | جزئیات یک ماژول |
| GET | `/api/:slug` | لیست رکوردهای یک ماژول |
| POST | `/api/:slug` | افزودن رکورد جدید |
| PUT | `/api/:slug/:id` | ویرایش رکورد |
| DELETE | `/api/:slug/:id` | حذف رکورد |
| GET | `/api/manage/summary` | خلاصه KPI برای داشبورد AralManage |

`slug` یکی از: `production, quality, predict, economy, supply, service, ai, develop, future, import, edu`

## دیپلوی روی گیت‌هاب و هاست

این پروژه یک اپلیکیشن Node.js با بک‌اند واقعی است، بنابراین **GitHub Pages به‌تنهایی کافی نیست** (Pages فقط فایل استاتیک سرو می‌کند و سرور Node اجرا نمی‌کند). دو گزینه:

### گزینه ۱ — دیپلوی کامل روی یک هاست Node (پیشنهادی)
1. کد را در یک مخزن گیت‌هاب push کنید.
2. یکی از سرویس‌های زیر را به مخزن گیت‌هاب متصل کنید: **Render**, **Railway**, **Fly.io** یا مشابه.
3. تنظیمات ساخت (Build):
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
4. بعد از دیپلوی، همان یک آدرس هم فرانت‌اند و هم API را سرو می‌کند.

> نکته: چون داده در فایل SQLite ذخیره می‌شود، روی هاست‌هایی که فایل‌سیستم موقت دارند (مثل بعضی پلن‌های رایگان)، بهتر است یک **Persistent Disk** برای مسیر `backend/aralone.db` فعال کنید تا داده‌ها با هر دیپلوی جدید پاک نشوند.

### گزینه ۲ — جدا کردن فرانت و بک‌اند
- پوشه `public/` را روی GitHub Pages یا Netlify/Vercel به‌عنوان استاتیک دیپلوی کنید.
- پوشه `backend/` را روی Render/Railway دیپلوی کنید.
- در `public/config.js`، مقدار `API_BASE` را به آدرس بک‌اند دیپلوی‌شده تغییر دهید، مثلاً:
  ```js
  const API_BASE = "https://aralone-backend.onrender.com/api";
  ```
- پکیج `cors` از قبل نصب و فعال است؛ در صورت نیاز محدودسازی دامنه، در `backend/server.js` مقدار `cors({ origin: "..." })` را تنظیم کنید.

## افزودن یا ویرایش یک ماژول

تمام تعریف ماژول‌ها (عنوان، توضیح، فیلدها، نوع هر فیلد، الزامی بودن) در یک فایل قرار دارد:

```
backend/modules.config.js
```

برای افزودن فیلد جدید یا ماژول جدید، فقط همین فایل را ویرایش کنید؛ هم فرم افزودن/ویرایش و هم جدول نمایش در فرانت‌اند به‌صورت خودکار بر اساس همین تعریف ساخته می‌شوند — نیازی به تغییر HTML نیست.

## اعتبارسنجی

اعتبارسنجی فیلدهای الزامی، نوع عددی و مقادیر مجاز select در سمت سرور (`backend/server.js`) انجام می‌شود؛ در صورت نامعتبر بودن داده، خطاهای مشخص به فرانت‌اند بازگردانده و در فرم نمایش داده می‌شوند.
