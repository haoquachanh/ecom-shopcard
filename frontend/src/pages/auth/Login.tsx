import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Layers3, LogIn, Mail, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { SHOP_NAME, SHOP_SHORT_NAME } from '@/lib/site';

const loginBenefits: Array<{ title: string; note: string; icon: LucideIcon }> = [
  { title: 'Lưu mẫu', note: 'Giữ lại các thiết kế bạn thích nhất.', icon: Layers3 },
  { title: 'Truy cập nhanh', note: 'Tiếp tục trải nghiệm ở mọi thiết bị.', icon: LogIn },
  { title: 'Bảo mật', note: 'Thông tin tài khoản được bảo vệ.', icon: ShieldCheck },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sc:lastEmail');
    if (saved) setForm((f) => ({ ...f, email: saved }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      if (remember) localStorage.setItem('sc:lastEmail', form.email);
      else localStorage.removeItem('sc:lastEmail');
      navigate(returnUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Đăng nhập" noindex />
      <section className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="relative hidden min-h-[540px] overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-8 shadow-[0_30px_90px_rgba(253,20,63,0.12)] lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(253,20,63,0.08)_1px,transparent_1px)] bg-[length:18px_100%] opacity-70" />
          <div className="absolute right-8 top-12 h-24 w-24 rounded-full bg-[#8b5cf6]/20 blur-xl" />
          <div className="absolute bottom-14 left-10 h-28 w-28 rounded-full bg-[#fb923c]/20 blur-2xl" />
          <div className="relative z-10">
            <Badge className="rounded-full border border-primary/15 bg-white px-4 py-2 text-primary shadow-[0_12px_28px_rgba(253,20,63,0.1)] hover:bg-white">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              {SHOP_SHORT_NAME}
            </Badge>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-normal text-[#9f1239]">
              Quay lại studio ảnh nổi.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#7f1d3a]/75">
              Đăng nhập để lưu mẫu yêu thích, xem lại bộ sưu tập và tiếp tục khám phá các hiệu ứng 3D lenticular của {SHOP_NAME}.
            </p>

            <div className="mt-10 grid gap-4">
              {loginBenefits.map(({ title, note, icon: Icon }) => (
                <div key={title} className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-[0_14px_34px_rgba(253,20,63,0.07)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-[#be123c]">{title}</p>
                    <p className="text-sm text-[#7f1d3a]/65">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-[0_30px_90px_rgba(253,20,63,0.14)] sm:p-8">
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <img src="/img/logo.jpg" alt="Lenti Lab" className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-primary/10" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-primary">{SHOP_SHORT_NAME}</p>
              <h2 className="mt-2 text-3xl font-black text-[#9f1239]">Đăng nhập</h2>
              <p className="mt-2 text-sm leading-6 text-[#7f1d3a]/70">Chào mừng trở lại. Nhập thông tin để tiếp tục.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-[#9f1239]">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@domain.com"
                    required
                    className="h-12 rounded-2xl border-primary/15 bg-[#fff7f9] pr-11 text-[#7f1d3a] focus-visible:ring-primary/30"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-[#9f1239]">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhap mat khau"
                    required
                    className="h-12 rounded-2xl border-primary/15 bg-[#fff7f9] pr-11 text-[#7f1d3a] focus-visible:ring-primary/30"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 rounded-lg p-1 text-primary/70 transition hover:bg-primary/10 hover:text-primary"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-[#7f1d3a]/75">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-primary/25 accent-primary"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Ghi nhớ email
                </label>
              </div>

              {error && <p className="rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

              <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-white shadow-[0_18px_38px_rgba(253,20,63,0.24)] hover:bg-primary/90" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#7f1d3a]/70">
              Chưa có tài khoản? <Link to="/register" className="font-black text-primary hover:underline">Tạo tài khoản</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
