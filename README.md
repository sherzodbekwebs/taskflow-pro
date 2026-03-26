# TaskFlow - Ichki Vazifa Menejeri

## 🚀 Boshlash

### 1. O'rnatish

```bash
# Papkaga kiring
cd taskflow

# Paketlarni o'rnating
npm install

# Development serverini ishga tushiring
npm run dev
```

Brauzerda `http://localhost:5173` manziliga kiring.

---

## 👤 Demo Hisoblar

| Ism | Login | Parol | Rol |
|-----|-------|-------|-----|
| Abdulloh Karimov | admin | 123 | Boshliq |
| Ali Rahimov | ali | ali123 | Ishchi |
| Jasur Toshmatov | jasur | jasur123 | Ishchi |
| Nilufar Yusupova | nilufar | nilufar123 | Ishchi |

---

## 📁 Loyiha Tuzilishi

```
src/
├── components/
│   ├── layout/         # Sidebar, Navbar, Layout
│   ├── tasks/          # TaskCard, TaskModal, KanbanBoard, TaskDetailModal
│   └── notifications/  # NotificationPanel
├── contexts/
│   └── AppContext.jsx  # Global state management
├── locales/
│   ├── uz.js           # O'zbek tili
│   └── ru.js           # Rus tili
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── TasksPage.jsx
│   ├── UsersPage.jsx
│   ├── StatisticsPage.jsx
│   ├── SettingsPage.jsx
│   └── ProfilePage.jsx
└── services/           # Data layer (Firebase/Supabase uchun tayyor)
    ├── storageService.js
    ├── taskService.js
    ├── userService.js
    └── notificationService.js
```

---

## 🔥 Firebase ga o'tish

`src/services/storageService.js` ni almashtiring:

```js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const StorageService = {
  get: async (key) => {
    const snap = await getDoc(doc(db, 'taskflow', key));
    return snap.exists() ? snap.data().value : null;
  },
  set: async (key, value) => {
    await setDoc(doc(db, 'taskflow', key), { value });
    return true;
  },
  // ...
};
```

---

## 🌊 Supabase ga o'tish

```js
import { supabase } from '../supabase/client';

const StorageService = {
  get: async (key) => {
    const { data } = await supabase.from('taskflow').select('value').eq('key', key).single();
    return data?.value ?? null;
  },
  set: async (key, value) => {
    await supabase.from('taskflow').upsert({ key, value });
    return true;
  },
};
```

---

## 🌍 Vercel ga Deploy

```bash
# Build
npm run build

# Vercel CLI bilan
npm i -g vercel
vercel
```

Yoki GitHub ga push qilib, Vercel.com da import qiling.

---

## ✨ Imkoniyatlar

- ✅ Kanban board (drag & drop)
- ✅ Vazifalar (qo'shish, tahrirlash, o'chirish)
- ✅ Kichik vazifalar + progress bar
- ✅ Fayllar biriktirish (PDF, Word, PPT, IMG...)
- ✅ Izohlar
- ✅ Foydalanuvchilar boshqaruvi
- ✅ Bo'limlar boshqaruvi
- ✅ Statistika (Recharts)
- ✅ Profil sahifasi (rasm yuklash)
- ✅ Bildirishnomalar
- ✅ O'zbek / Rus tili
- ✅ Qorong'i / Yorug' mavzu
- ✅ Responsive dizayn
- ✅ localStorage → Firebase/Supabase uchun tayyor arxitektura
