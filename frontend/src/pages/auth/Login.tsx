import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff, Mail } from 'lucide-react';

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
      <div className="w-full max-w-md">
        <div className="bg-linear-to-br from-primary/10 to-rose-50 p-1 rounded-3xl">
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-white p-6">
                <div className="mb-4 text-center">
                  <img src="/img/logo.svg" alt="logo" className="mx-auto mb-2 h-10" />
                  <h1 className="font-semibold text-xl">Đăng nhập</h1>
                  <p className="mt-1 text-muted-foreground text-sm">Chào mừng trở lại — đăng nhập để tiếp tục</p>
                </div>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Input id="email" type="email" placeholder="you@domain.com" required
                          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <Mail className="top-3 right-3 absolute w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required
                          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword((s) => !s)} className="top-2 right-2 absolute p-1 text-muted-foreground text-sm">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                        Ghi nhớ
                      </label>
                      <Link to="/auth/forgot" className="text-muted-foreground hover:underline">Quên mật khẩu?</Link>
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <Button type="submit" className="py-3 border-0 w-full gradient-brand" disabled={loading}>
                      {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-border h-px" />
                      <div className="text-muted-foreground text-sm">Hoặc</div>
                      <div className="flex-1 bg-border h-px" />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1">Google</Button>
                      <Button variant="ghost" className="flex-1">Facebook</Button>
                    </div>
                  </form>

                  <p className="mt-4 text-muted-foreground text-sm text-center">
                    Chưa có tài khoản? <Link to="/register" className="font-medium text-primary hover:underline">Tạo tài khoản</Link>
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
    </>
  );
}
