# 🖥️ Frontend — Menstrual Health Companion

Single Page Application (SPA) dibangun dengan **React** dan **Vite**, menyediakan antarmuka interaktif untuk melacak siklus menstruasi, mencatat kondisi harian, dan melihat prediksi AI.

---

## 🛠️ Tech Stack

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| **React 18+**        | UI Library                    |
| **Vite 8.0**         | Build tool & dev server (HMR) |
| **TypeScript 5.9**   | Type safety                   |
| **React Router 7.x** | Client-side routing           |
| **Axios 1.x**        | HTTP client for API calls     |
| **CSS Modules**      | Component-scoped styling      |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (HMR)
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

> **Note**: Pastikan Backend API (`http://localhost:5000`) sudah berjalan sebelum menggunakan frontend.

---

## 📁 Project Structure

```
frontend/
├── package.json             # Dependencies & scripts
├── index.html               # HTML entry point
├── tsconfig.json            # TypeScript configuration
├── public/
│   ├── favicon.svg          # App icon
│   └── icons.svg            # Icon sprites
└── src/
    ├── App.jsx              # 🏠 Root component, routing, guards
    ├── main.jsx             # 🚀 React entry point
    ├── index.css            # 🎨 Global styles
    │
    ├── context/
    │   └── AuthContext.jsx  # 🔐 Authentication state (token, user)
    │
    ├── components/
    │   ├── Navbar.jsx       # 🧭 Navigation bar
    │   └── Navbar.css       # Navbar styling
    │
    ├── pages/
    │   ├── LoginPage.jsx    # 🔑 Login form
    │   ├── RegisterPage.jsx # 📝 Registration form
    │   ├── Dashboard.jsx    # 📊 Main dashboard
    │   ├── Dashboard.css    # Dashboard styling
    │   ├── CalendarPage.jsx # 📅 Calendar view
    │   ├── CalendarPage.css # Calendar styling
    │   ├── CycleForm.jsx    # 🩸 Menstrual cycle input
    │   ├── DailyLogForm.jsx # 📋 Daily health log form
    │   ├── ProfilePage.jsx  # 👤 User profile
    │   ├── ProfilePage.css  # Profile styling
    │   ├── Auth.css         # Auth pages styling
    │   └── FormPage.css     # Form pages styling
    │
    └── services/
        └── api.js           # 🌐 Axios instance & interceptors
```

---

## 🗺️ Routing

| Path         | Component      | Auth         | Description        |
| ------------ | -------------- | ------------ | ------------------ |
| `/login`     | `LoginPage`    | Public       | Halaman login      |
| `/register`  | `RegisterPage` | Public       | Halaman registrasi |
| `/`          | `Dashboard`    | 🔒 Protected | Dashboard utama    |
| `/calendar`  | `CalendarPage` | 🔒 Protected | Kalender siklus    |
| `/cycle`     | `CycleForm`    | 🔒 Protected | Form input siklus  |
| `/daily-log` | `DailyLogForm` | 🔒 Protected | Form log harian    |
| `/profile`   | `ProfilePage`  | 🔒 Protected | Profil pengguna    |

### Route Guards

- **`ProtectedRoute`** — Redirect ke `/login` jika belum login
- **`PublicRoute`** — Redirect ke `/` jika sudah login

---

## 🔐 State Management

### AuthContext

Centralized authentication state menggunakan React Context API:

```jsx
// Provides: { token, user, login, logout, loading }
<AuthProvider>
  <App />
</AuthProvider>
```

| State                | Type             | Description                              |
| -------------------- | ---------------- | ---------------------------------------- |
| `token`              | `string \| null` | JWT token dari localStorage              |
| `user`               | `object \| null` | Data user (id, name, email)              |
| `loading`            | `boolean`        | Auth state loading indicator             |
| `login(token, user)` | `function`       | Set token & user, simpan ke localStorage |
| `logout()`           | `function`       | Clear token & user, redirect ke login    |

---

## 🌐 API Integration

### API Service (`services/api.js`)

Axios instance yang dikonfigurasi untuk berkomunikasi dengan backend:

```javascript
// Base URL: http://localhost:5000/api
// Auto-attach Authorization header dari localStorage
// Response interceptor: auto-logout on 401/403
```

### API Calls per Page

| Page             | API Endpoints Called                                             |
| ---------------- | ---------------------------------------------------------------- |
| **LoginPage**    | `POST /api/auth/login`                                           |
| **RegisterPage** | `POST /api/auth/register`                                        |
| **Dashboard**    | `GET /api/cycles`, `GET /api/predictions`, `GET /api/daily-logs` |
| **CalendarPage** | `GET /api/cycles`, `GET /api/daily-logs`                         |
| **CycleForm**    | `POST /api/cycles`, `PUT /api/cycles/:id`                        |
| **DailyLogForm** | `POST /api/daily-logs`                                           |
| **ProfilePage**  | `GET /api/profile`, `PUT /api/profile`                           |

---

## 🎨 Styling

Aplikasi menggunakan **Vanilla CSS** dengan pendekatan:

- **Global styles** (`index.css`) — CSS variables, reset, typography
- **Page-level CSS** — Setiap halaman memiliki file CSS sendiri
- **Component CSS** — Component-scoped styles (e.g., `Navbar.css`)

### Design System

- Color scheme dengan CSS custom properties
- Responsive design (mobile-first)
- Smooth transitions dan micro-animations
- Loading spinners dan skeleton states

---

## 📝 Pages Overview

### 🔑 LoginPage & RegisterPage

- Form validasi client-side
- Password visibility toggle
- Error handling dengan user-friendly messages
- Auto-redirect setelah login/register berhasil

### 📊 Dashboard

- Ringkasan siklus terakhir & prediksi berikutnya
- Status panjang siklus & kepercayaan prediksi
- Quick action buttons ke fitur lain
- Statistik dan overview data kesehatan

### 📅 CalendarPage

- Kalender interaktif dengan visualisasi siklus
- Warna berbeda untuk hari menstruasi, ovulasi estimasi
- Klik tanggal untuk melihat detail log

### 🩸 CycleForm

- Input start/end date, panjang siklus, intensitas
- Validasi input dengan feedback realtime
- Support create & edit mode

### 📋 DailyLogForm

- Input mood (1-5), symptoms, kualitas tidur, stres, puasa
- Multi-select symptoms dengan checkboxes
- Auto-fill jika log sudah ada untuk tanggal tersebut

### 👤 ProfilePage

- Tampilkan & edit profil (nama, tanggal lahir, rata-rata siklus)
- Account information display
