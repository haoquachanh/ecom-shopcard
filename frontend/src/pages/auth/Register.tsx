import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Layers3, Mail, Phone, ShieldCheck, Sparkles, User, UserPlus } from 'lucide-react';
import { SHOP_NAME, SHOP_SHORT_NAME } from '@/lib/site';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Mật khẩu phải có ít nhất 8 ký tự');
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      return setError('Mật khẩu cần có cả chữ và số');
    }
    if (form.password !== confirm) return setError('Mật khẩu và xác nhận không khớp');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Đăng ký tài khoản" noindex />
      <section className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="relative hidden min-h-[560px] overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-8 shadow-[0_30px_90px_rgba(253,20,63,0.12)] lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(253,20,63,0.08)_1px,transparent_1px)] bg-[length:18px_100%] opacity-70" />
          <div className="absolute -right-8 top-16 h-32 w-32 rounded-full bg-[#8b5cf6]/18 blur-2xl" />
          <div className="absolute bottom-12 left-10 h-36 w-36 rounded-full bg-[#fb923c]/18 blur-3xl" />
          <div className="relative z-10">
            <Badge className="rounded-full border border-primary/15 bg-white px-4 py-2 text-primary shadow-[0_12px_28px_rgba(253,20,63,0.1)] hover:bg-white">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Gia nhập {SHOP_SHORT_NAME}
            </Badge>
            <h1 className="mt-6 text-5xl font-black leading-tight tracking-normal text-[#9f1239]">
              Tạo không gian lưu mẫu riêng.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#7f1d3a]/75">
              Tài khoản giúp bạn lưu lại các mẫu ảnh nổi yêu thích và quay lại bộ sưu tập nhanh hơn khi cần tư vấn với {SHOP_NAME}.
            </p>

            <div className="relative mt-12 h-64">
              <div className="absolute left-3 top-2 h-40 w-40 rotate-[-8deg] rounded-[2rem] bg-gradient-to-br from-primary to-[#ff6b86] shadow-[18px_20px_0_rgba(253,20,63,0.12)]" />
              <div className="absolute right-10 top-14 h-36 w-36 rotate-[12deg] rounded-full bg-[#8b5cf6]/80 shadow-[18px_20px_0_rgba(139,92,246,0.12)]" />
              <div className="absolute bottom-2 left-32 h-24 w-56 rounded-[1.5rem] bg-[#fb923c]/90 shadow-[16px_18px_0_rgba(251,146,60,0.16)]" />
              <div className="absolute left-24 top-24 rounded-2xl border border-primary/10 bg-white px-5 py-4 shadow-[0_18px_44px_rgba(253,20,63,0.14)]">
                <Layers3 className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-black text-[#be123c]">Hồ sơ nhiều lớp</p>
                <p className="text-xs text-[#7f1d3a]/65">Lưu gu thiết kế của bạn.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-[0_30px_90px_rgba(253,20,63,0.14)] sm:p-8">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <img src="/img/logo.jpg" alt="Lenti Lab" className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-primary/10" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-primary">{SHOP_SHORT_NAME}</p>
              <h2 className="mt-2 text-3xl font-black text-[#9f1239]">Tạo tài khoản</h2>
              <p className="mt-2 text-sm leading-6 text-[#7f1d3a]/70">Điền thông tin cơ bản để bắt đầu lưu mẫu yêu thích.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Họ và tên" htmlFor="fullName" icon={<User className="h-4 w-4" />}>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    className="h-12 rounded-2xl border-primary/15 bg-[#fff7f9] pr-11 text-[#7f1d3a] focus-visible:ring-primary/30"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </Field>

                <Field label="Số điện thoại" htmlFor="phone" icon={<Phone className="h-4 w-4" />}>
                  <Input
                    id="phone"
                    placeholder="0912 345 678"
                    className="h-12 rounded-2xl border-primary/15 bg-[#fff7f9] pr-11 text-[#7f1d3a] focus-visible:ring-primary/30"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Email" htmlFor="email" icon={<Mail className="h-4 w-4" />}>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@domain.com"
                  required
                  className="h-12 rounded-2xl border-primary/15 bg-[#fff7f9] pr-11 text-[#7f1d3a] focus-visible:ring-primary/30"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  id="password"
                  label="Mật khẩu"
                  placeholder="Tối thiểu 8 ký tự, có chữ và số"
                  value={form.password}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((s) => !s)}
                  onChange={(value) => setForm({ ...form, password: value })}
                />
                <PasswordField
                  id="confirm"
                  label="Xác nhận mật khẩu"
                  placeholder="Nhập lại mật khẩu"
                  value={confirm}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((s) => !s)}
                  onChange={setConfirm}
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-[#7f1d3a]/75">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <span>Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số. Không chia sẻ tài khoản với người khác.</span>
              </div>

              {error && <p className="rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

              <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-white shadow-[0_18px_38px_rgba(253,20,63,0.24)] hover:bg-primary/90" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                <UserPlus className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#7f1d3a]/70">
              Đã có tài khoản? <Link to="/login" className="font-black text-primary hover:underline">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, htmlFor, icon, children }: { label: string; htmlFor: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="font-bold text-[#9f1239]">{label}</Label>
      <div className="relative">
        {children}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70">{icon}</span>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  showPassword,
  onToggle,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  showPassword: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-bold text-[#9f1239]">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          required
          minLength={id === 'password' ? 6 : undefined}
          className="h-12 rounded-2xl border-primary/15 bg-[#fff7f9] pr-11 text-[#7f1d3a] focus-visible:ring-primary/30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 rounded-lg p-1 text-primary/70 transition hover:bg-primary/10 hover:text-primary"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
