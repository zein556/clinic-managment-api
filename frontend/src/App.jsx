import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import API from './services/api';

const STORAGE_KEYS = {
  token: 'clinic-token',
  user: 'clinic-user',
};

const normalizeRole = (role) => String(role || '').toLowerCase();

const wrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of ['doctors', 'patients', 'appointments', 'notifications', 'medicalRecords']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [lang, setLang] = useState('ar');

  const saveSession = (user, token) => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.token, token);
    setCurrentUser(user);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    setCurrentUser(null);
  };

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [currentUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLoginSuccess={saveSession} />} />
        <Route path="/register" element={<RegisterPage lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLoginSuccess={saveSession} />} />
        <Route path="/dashboard" element={<ProtectedRoute user={currentUser}><DashboardPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute user={currentUser}><DoctorsPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute user={currentUser}><PatientsPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute user={currentUser}><AppointmentsPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="/medical-records" element={<ProtectedRoute user={currentUser}><MedicalRecordsPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute user={currentUser}><NotificationsPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="/clinic" element={<ProtectedRoute user={currentUser}><ClinicPage currentUser={currentUser} lang={lang} onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} onLogout={clearSession} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function DashboardShell({ currentUser, lang, onToggleLang, onLogout, children }) {
  const role = normalizeRole(currentUser?.role);
  const navItems = [
    { to: '/dashboard', label: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
    { to: '/doctors', label: lang === 'ar' ? 'الأطباء' : 'Doctors', icon: Stethoscope, roles: ['admin', 'doctor'] },
    { to: '/patients', label: lang === 'ar' ? 'المرضى' : 'Patients', icon: Users, roles: ['admin', 'doctor'] },
    { to: '/appointments', label: lang === 'ar' ? 'المواعيد' : 'Appointments', icon: CalendarClock, roles: ['admin', 'doctor', 'patient'] },
    { to: '/medical-records', label: lang === 'ar' ? 'السجلات الطبية' : 'Medical Records', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
    { to: '/notifications', label: lang === 'ar' ? 'الإشعارات' : 'Notifications', icon: Bell, roles: ['admin', 'doctor', 'patient'] },
    { to: '/clinic', label: lang === 'ar' ? 'العيادة' : 'Clinic', icon: Building2, roles: ['admin', 'doctor', 'patient'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><Activity className="h-6 w-6" /></div>
            <div>
              <p className="text-lg font-bold">{lang === 'ar' ? 'مركز الرعاية الطبية' : 'Medical Care Center'}</p>
              <p className="text-xs text-cyan-300">{lang === 'ar' ? 'إدارة عيادة ذكية' : 'Smart clinic management'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onToggleLang} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-white/10">
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
            <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/25">
              <LogOut className="h-4 w-4" />
              {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700"><UserCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-slate-500">{lang === 'ar' ? 'الحساب' : 'Account'}</p>
              <p className="font-bold text-slate-900">{currentUser?.email || 'Clinic user'}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {visibleNav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function LoginPage({ lang, onToggleLang, onLoginSuccess }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', {
        email: form.email,
        password: form.password,
        role,
      });

      const token = response.data?.token;
      const user = response.data?.user;
      if (!token || !user) {
        throw new Error('No token returned by API');
      }

      onLoginSuccess(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><Stethoscope className="h-6 w-6" /></div>
            <div>
              <p className="text-lg font-bold">{lang === 'ar' ? 'مركز الرعاية الطبية' : 'Medical Care Center'}</p>
            </div>
          </div>
          <button type="button" onClick={onToggleLang} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-white/10">
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-900 p-3 text-cyan-400"><UserCheck className="h-8 w-8" /></div>
            <h2 className="text-2xl font-bold text-slate-900">{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</h2>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 text-xs font-bold">
            {['admin', 'doctor', 'patient'].map((option) => (
              <button key={option} type="button" onClick={() => setRole(option)} className={`rounded-xl py-2.5 transition ${role === option ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                {lang === 'ar' ? (option === 'admin' ? 'مدير' : option === 'doctor' ? 'طبيب' : 'مريض') : option}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white" placeholder="user@clinic.com" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {loading ? (lang === 'ar' ? 'جاري التحقق...' : 'Authenticating...') : (lang === 'ar' ? 'دخول آمن' : 'Secure login')}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            <span>{lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}</span>{' '}
            <button type="button" onClick={() => navigate('/register')} className="font-bold text-cyan-600 hover:text-cyan-700">
              {lang === 'ar' ? 'إنشاء حساب' : 'Create account'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function RegisterPage({ lang, onToggleLang, onLoginSuccess }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        role,
      });

      const loginResponse = await API.post('/auth/login', { email: form.email, password: form.password, role });
      onLoginSuccess(loginResponse.data.user, loginResponse.data.token);
      navigate('/dashboard');
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        setError(validationErrors.map(({ field, message }) => {
          if (lang !== 'ar') return message;
          if (field === 'username') return 'يرجى إدخال الاسم الكامل.';
          if (field === 'email') return 'يرجى إدخال بريد إلكتروني صالح.';
          if (field === 'password') return 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';
          if (field === 'phone') return 'يرجى إدخال رقم هاتف صالح.';
          return message;
        }).join('، '));
      } else if (err.response?.data?.error === 'Email already exists') {
        setError(lang === 'ar' ? 'هذا البريد الإلكتروني مستخدم بالفعل.' : err.response.data.error);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message
          || (lang === 'ar' ? 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.' : 'Registration failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-lg font-bold">{lang === 'ar' ? 'إنشاء حساب جديد' : 'Create new account'}</p>
            </div>
          </div>
          <button type="button" onClick={onToggleLang} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-white/10">
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold text-slate-900">{lang === 'ar' ? 'تسجيل مستخدم جديد' : 'Register user'}</h2>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 text-xs font-bold">
            {['admin', 'doctor', 'patient'].map((option) => (
              <button key={option} type="button" onClick={() => setRole(option)} className={`rounded-xl py-2.5 transition ${role === option ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                {lang === 'ar' ? (option === 'admin' ? 'مدير' : option === 'doctor' ? 'طبيب' : 'مريض') : option}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">{lang === 'ar' ? 'الاسم الكامل' : 'Full name'}</label>
              <input type="text" name="username" autoComplete="name" value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" name="email" autoComplete="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <input type="password" name="password" autoComplete="new-password" minLength={6} value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {loading ? (lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') : (lang === 'ar' ? 'إنشاء الحساب' : 'Register')}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            <button type="button" onClick={() => navigate('/login')} className="font-bold text-cyan-600 hover:text-cyan-700">{lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login'}</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardPage({ currentUser, lang, onToggleLang, onLogout }) {
  const role = normalizeRole(currentUser?.role);
  const [stats, setStats] = useState({ appointments: 0, doctors: 0, patients: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const results = await Promise.allSettled([
          API.get('/appointments'),
          API.get('/doctors'),
          API.get('/patients'),
          API.get('/notifications'),
        ]);

        if (!active) return;

        const appointments = wrapList(results[0].value?.data);
        const doctors = wrapList(results[1].value?.data);
        const patients = wrapList(results[2].value?.data);
        const notifications = wrapList(results[3].value?.data);

        setStats({
          appointments: appointments.length,
          doctors: doctors.length,
          patients: patients.length,
          notifications: notifications.length,
        });
      } catch {
        setStats({ appointments: 0, doctors: 0, patients: 0, notifications: 0 });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, [role]);

  const cards = [
    { label: lang === 'ar' ? 'المواعيد' : 'Appointments', value: stats.appointments, color: 'cyan', icon: CalendarClock },
    { label: lang === 'ar' ? 'الأطباء' : 'Doctors', value: stats.doctors, color: 'violet', icon: Stethoscope },
    { label: lang === 'ar' ? 'المرضى' : 'Patients', value: stats.patients, color: 'emerald', icon: Users },
    { label: lang === 'ar' ? 'الإشعارات' : 'Notifications', value: stats.notifications, color: 'amber', icon: Bell },
  ];

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'مرحباً' : 'Welcome'}</p>
              <h1 className="text-3xl font-extrabold text-slate-900">{currentUser?.email}</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {lang === 'ar' ? 'الحساب متصل' : 'Connected'}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`mb-4 inline-flex rounded-2xl bg-${color}-100 p-3 text-${color}-700`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{loading ? '…' : value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'الدور الحالي' : 'Current role'}</p>
                <p className="mt-1 text-lg font-bold capitalize">{role}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'حالة النظام' : 'System status'}</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">{lang === 'ar' ? 'نشط' : 'Active'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{lang === 'ar' ? 'أقرب خطوات' : 'Quick actions'}</h2>
            <div className="space-y-3">
              <NavLink to="/appointments" className="flex items-center justify-between rounded-2xl bg-cyan-50 p-3 text-cyan-700 hover:bg-cyan-100">
                <span>{lang === 'ar' ? 'إدارة المواعيد' : 'Manage appointments'}</span>
                <CalendarClock className="h-4 w-4" />
              </NavLink>
              <NavLink to="/medical-records" className="flex items-center justify-between rounded-2xl bg-violet-50 p-3 text-violet-700 hover:bg-violet-100">
                <span>{lang === 'ar' ? 'السجلات الطبية' : 'Medical records'}</span>
                <FileText className="h-4 w-4" />
              </NavLink>
              <NavLink to="/notifications" className="flex items-center justify-between rounded-2xl bg-amber-50 p-3 text-amber-700 hover:bg-amber-100">
                <span>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
                <Bell className="h-4 w-4" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function DoctorsPage({ currentUser, lang, onToggleLang, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', specialty: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const role = normalizeRole(currentUser?.role);

  const loadDoctors = async () => {
    try {
      const response = await API.get('/doctors');
      setDoctors(wrapList(response.data));
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (role !== 'admin') return;

    setSaving(true);
    try {
      await API.post('/doctors', { username: form.username, specialty: form.specialty, phone: form.phone });
      setForm({ username: '', specialty: '', phone: '' });
      await loadDoctors();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Unable to create doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'الأطباء' : 'Doctors'}</p>
              <h1 className="text-2xl font-extrabold text-slate-900">{lang === 'ar' ? 'إدارة الأطباء' : 'Doctor management'}</h1>
            </div>
          </div>
        </div>

        {role === 'admin' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{lang === 'ar' ? 'إضافة طبيب جديد' : 'Add doctor'}</h2>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <input value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} placeholder={lang === 'ar' ? 'اسم الطبيب' : 'Doctor name'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <input value={form.specialty} onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))} placeholder={lang === 'ar' ? 'التخصص' : 'Specialty'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <div className="flex gap-2">
                <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder={lang === 'ar' ? 'الهاتف' : 'Phone'} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
                <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60">{lang === 'ar' ? 'حفظ' : 'Save'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل الأطباء...' : 'Loading doctors...'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="px-3 py-3">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className="px-3 py-3">{lang === 'ar' ? 'التخصص' : 'Specialty'}</th>
                    <th className="px-3 py-3">{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-semibold text-slate-800">{doctor.username || doctor.name || '—'}</td>
                      <td className="px-3 py-3 text-slate-600">{doctor.specialty || '—'}</td>
                      <td className="px-3 py-3 text-slate-600">{doctor.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function PatientsPage({ currentUser, lang, onToggleLang, onLogout }) {
  const role = normalizeRole(currentUser?.role);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', gender: '', birth_date: '' });
  const [saving, setSaving] = useState(false);

  const loadPatients = async () => {
    try {
      const response = await API.get('/patients');
      setPatients(wrapList(response.data));
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (role !== 'admin') return;

    setSaving(true);
    try {
      await API.post('/patients', {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        birth_date: form.birth_date,
      });
      setForm({ name: '', phone: '', gender: '', birth_date: '' });
      await loadPatients();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Unable to create patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'المرضى' : 'Patients'}</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{lang === 'ar' ? 'إدارة المرضى' : 'Patient management'}</h1>
        </div>

        {role === 'admin' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{lang === 'ar' ? 'إضافة مريض جديد' : 'Add patient'}</h2>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder={lang === 'ar' ? 'اسم المريض' : 'Patient name'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder={lang === 'ar' ? 'الهاتف' : 'Phone'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <input value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))} placeholder={lang === 'ar' ? 'الجنس' : 'Gender'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <div className="flex gap-2">
                <input type="date" value={form.birth_date} onChange={(event) => setForm((prev) => ({ ...prev, birth_date: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
                <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60">{lang === 'ar' ? 'حفظ' : 'Save'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل المرضى...' : 'Loading patients...'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="px-3 py-3">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className="px-3 py-3">{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
                    <th className="px-3 py-3">{lang === 'ar' ? 'الجنس' : 'Gender'}</th>
                    <th className="px-3 py-3">{lang === 'ar' ? 'تاريخ الميلاد' : 'Birth date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-semibold text-slate-800">{patient.name || patient.username || '—'}</td>
                      <td className="px-3 py-3 text-slate-600">{patient.phone || '—'}</td>
                      <td className="px-3 py-3 text-slate-600">{patient.gender || '—'}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(patient.birth_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function AppointmentsPage({ currentUser, lang, onToggleLang, onLogout }) {
  const role = normalizeRole(currentUser?.role);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ doctor_id: '', appointment_date: '', appointment_time: '' });

  const loadData = async () => {
    const [appointmentsResult, doctorsResult] = await Promise.allSettled([
        API.get('/appointments'),
        API.get('/doctors'),
    ]);

    const errors = [];
    if (appointmentsResult.status === 'fulfilled') {
      setAppointments(wrapList(appointmentsResult.value.data));
    } else if (appointmentsResult.reason?.response?.status === 404) {
      setAppointments([]);
    } else {
      setAppointments([]);
      errors.push(lang === 'ar' ? 'تعذر تحميل المواعيد.' : 'Unable to load appointments.');
    }

    if (doctorsResult.status === 'fulfilled') {
      setDoctors(wrapList(doctorsResult.value.data));
    } else {
      setDoctors([]);
      errors.push(lang === 'ar' ? 'تعذر تحميل قائمة الأطباء.' : 'Unable to load doctors.');
    }

    setLoadError(errors.join(' '));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (role !== 'patient') return;

    try {
      await API.post('/appointments', {
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
      });
      setForm({ doctor_id: '', appointment_date: '', appointment_time: '' });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Unable to book appointment');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Unable to update appointment');
    }
  };

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'المواعيد' : 'Appointments'}</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{lang === 'ar' ? 'جدولة المواعيد' : 'Appointment scheduling'}</h1>
        </div>

        {role === 'patient' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{lang === 'ar' ? 'حجز موعد جديد' : 'Book appointment'}</h2>
            {loadError && <p role="alert" className="mb-4 text-sm font-medium text-red-600">{loadError}</p>}
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <select value={form.doctor_id} onChange={(event) => setForm((prev) => ({ ...prev, doctor_id: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500">
                <option value="">{doctors.length ? (lang === 'ar' ? 'اختر الطبيب' : 'Choose doctor') : (lang === 'ar' ? 'لا يوجد أطباء متاحون' : 'No doctors available')}</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.username || doctor.name}</option>
                ))}
              </select>
              <input type="date" value={form.appointment_date} onChange={(event) => setForm((prev) => ({ ...prev, appointment_date: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <div className="flex gap-2">
                <input type="time" value={form.appointment_time} onChange={(event) => setForm((prev) => ({ ...prev, appointment_time: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">{lang === 'ar' ? 'حجز' : 'Book'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading appointments...'}</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{lang === 'ar' ? 'موعد' : 'Appointment'} #{appointment.id}</p>
                      <p className="text-sm text-slate-500">{lang === 'ar' ? 'التاريخ' : 'Date'}: {formatDate(appointment.appointment_date)}</p>
                      <p className="text-sm text-slate-500">{lang === 'ar' ? 'الوقت' : 'Time'}: {appointment.appointment_time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-700">{appointment.status || 'pending'}</span>
                      {role !== 'patient' && (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleStatus(appointment.id, 'confirmed')} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white">Confirm</button>
                          <button type="button" onClick={() => handleStatus(appointment.id, 'completed')} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">Complete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function MedicalRecordsPage({ currentUser, lang, onToggleLang, onLogout }) {
  const role = normalizeRole(currentUser?.role);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(currentUser?.profileId || '');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ appointment_id: '', diagnosis: '', notes: '', prescriptions: '' });

  useEffect(() => {
    const loadPatients = async () => {
      if (role === 'patient') {
        setSelectedPatientId(currentUser?.profileId || '');
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/patients');
        const patientList = wrapList(response.data);
        setPatients(patientList);
        if (patientList[0]) setSelectedPatientId(String(patientList[0].id));
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [role, currentUser]);

  useEffect(() => {
    if (!selectedPatientId) return;

    const loadRecords = async () => {
      try {
        const response = await API.get(`/medicalRecords/patient/${selectedPatientId}`);
        setRecords(wrapList(response.data));
      } catch {
        setRecords([]);
      }
    };

    loadRecords();
  }, [selectedPatientId]);

  const handleRecord = async (event) => {
    event.preventDefault();
    if (role === 'patient') return;

    try {
      const prescriptions = form.prescriptions ? [{ medication_name: form.prescriptions, dosage: 'As prescribed', instructions: form.notes || 'Follow doctor instructions' }] : [];

      await API.post('/medicalRecords', {
        appointment_id: Number(form.appointment_id),
        diagnosis: form.diagnosis,
        notes: form.notes,
        prescriptions,
      });

      setForm({ appointment_id: '', diagnosis: '', notes: '', prescriptions: '' });
      if (selectedPatientId) {
        const response = await API.get(`/medicalRecords/patient/${selectedPatientId}`);
        setRecords(wrapList(response.data));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Unable to create record');
    }
  };

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'السجلات الطبية' : 'Medical records'}</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{lang === 'ar' ? 'تاريخ المرضى' : 'Patient history'}</h1>
        </div>

        {role !== 'patient' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{lang === 'ar' ? 'إضافة سجل طبي' : 'Add medical record'}</h2>
            <form onSubmit={handleRecord} className="grid gap-4 md:grid-cols-2">
              <input value={form.appointment_id} onChange={(event) => setForm((prev) => ({ ...prev, appointment_id: event.target.value }))} placeholder={lang === 'ar' ? 'معرّف الموعد' : 'Appointment ID'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <input value={form.diagnosis} onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))} placeholder={lang === 'ar' ? 'التشخيص' : 'Diagnosis'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <input value={form.prescriptions} onChange={(event) => setForm((prev) => ({ ...prev, prescriptions: event.target.value }))} placeholder={lang === 'ar' ? 'اسم الدواء' : 'Prescription name'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500" />
              <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder={lang === 'ar' ? 'ملاحظات الطبيب' : 'Doctor notes'} className="rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500 md:col-span-2" rows="3" />
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white md:col-span-2">{lang === 'ar' ? 'حفظ السجل' : 'Save record'}</button>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {role !== 'patient' && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-slate-700">{lang === 'ar' ? 'اختر المريض' : 'Select patient'}</label>
              <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-cyan-500">
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name || patient.username}</option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل السجلات...' : 'Loading records...'}</p>
          ) : records.length === 0 ? (
            <p className="text-slate-500">{lang === 'ar' ? 'لا توجد سجلات حالياً' : 'No records found yet.'}</p>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{record.diagnosis || 'Diagnosis'}</h3>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-700">{record.doctor_id || 'Doctor'}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{record.notes || 'No notes'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(record.prescriptions || []).map((item, index) => (
                      <span key={`${record.id}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {item.medication_name || item.name || 'Prescription'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function NotificationsPage({ currentUser, lang, onToggleLang, onLogout }) {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const response = await API.get('/notifications');
      setNotifications(wrapList(response.data));
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</p>
              <h1 className="text-2xl font-extrabold text-slate-900">{lang === 'ar' ? 'لوحة الإشعارات' : 'Notification center'}</h1>
            </div>
            <button type="button" onClick={markAllRead} className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white">{lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}</button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {notifications.length === 0 ? (
            <p className="text-slate-500">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications available.'}</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-bold text-slate-900">{notification.title || 'Notification'}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.message || notification.content || '—'}</p>
                  </div>
                  {!notification.is_read && (
                    <button type="button" onClick={() => markAsRead(notification.id)} className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-white">{lang === 'ar' ? 'تحديد كمقروء' : 'Mark read'}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function ClinicPage({ currentUser, lang, onToggleLang, onLogout }) {
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinic = async () => {
      try {
        const response = await API.get('/clinic');
        setClinic(response.data);
      } catch {
        setClinic(null);
      } finally {
        setLoading(false);
      }
    };

    loadClinic();
  }, []);

  return (
    <DashboardShell currentUser={currentUser} lang={lang} onToggleLang={onToggleLang} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-600">{lang === 'ar' ? 'العيادة' : 'Clinic'}</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{lang === 'ar' ? 'معلومات العيادة' : 'Clinic information'}</h1>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">{lang === 'ar' ? 'جاري تحميل معلومات العيادة...' : 'Loading clinic information...'}</div>
        ) : clinic ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">{clinic.name || 'Clinic'}</h2>
              <p className="mt-4 text-slate-600">{clinic.address || 'Address unavailable'}</p>
              {clinic.googleMapsUrl && (
                <a href={clinic.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl bg-cyan-500 px-4 py-2 font-bold text-white">{lang === 'ar' ? 'فتح الخريطة' : 'Open map'}</a>
              )}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">{lang === 'ar' ? 'الأطباء الحاليون' : 'Current doctors'}</h2>
              <div className="mt-4 space-y-3">
                {(clinic.doctors || []).map((doctor) => (
                  <div key={doctor.id} className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-bold text-slate-900">{doctor.name || doctor.username}</p>
                    <p className="text-sm text-slate-600">{doctor.specialty || 'General practice'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">{lang === 'ar' ? 'تعذر تحميل معلومات العيادة' : 'Unable to load clinic information.'}</div>
        )}
      </div>
    </DashboardShell>
  );
}

export default App;
