import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Key } from 'lucide-react';
// AuthAside intentionally not used here — register uses single centered card like Login

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
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
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
      <div className="w-full max-w-md">
        <div className="bg-linear-to-br from-primary/10 to-rose-50 p-1 rounded-3xl">
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-white p-6">
                <div className="mb-4 text-center">
                  <img src="/img/logo.svg" alt="logo" className="mx-auto mb-2 h-10" />
                  <h1 className="font-semibold text-xl">Tạo tài khoản</h1>
                  <p className="mt-1 text-muted-foreground text-sm">Nhanh chóng và an toàn — bắt đầu trải nghiệm</p>
                </div>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-sm">Họ và tên</Label>
                      <Input id="fullName" placeholder="Nguyễn Văn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Input id="email" type="email" placeholder="you@domain.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <Mail className="top-3 right-3 absolute w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm">Số điện thoại</Label>
                      <Input id="phone" placeholder="0912 345 678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Tối thiểu 6 ký tự" required minLength={6}
                          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <Key className="top-3 right-3 absolute w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="confirm" className="text-sm">Xác nhận mật khẩu</Label>
                      <div className="relative">
                        <Input id="confirm" type={showPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword((s) => !s)} className="top-2 right-2 absolute p-1 text-muted-foreground text-sm">
                          {showPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <Button type="submit" className="py-3 border-0 w-full gradient-brand" disabled={loading}>
                      {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                    </Button>

                    <p className="mt-3 text-muted-foreground text-sm text-center">Hoặc</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1">Google</Button>
                      <Button variant="ghost" className="flex-1">Facebook</Button>
                    </div>
                  </form>

                  <p className="mt-4 text-muted-foreground text-sm text-center">
                    Đã có tài khoản? <Link to="/login" className="font-medium text-primary hover:underline">Đăng nhập</Link>
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
    </>
  );
}
