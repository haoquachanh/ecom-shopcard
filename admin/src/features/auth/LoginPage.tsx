import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button, Input, Label } from '@/shared/components/ui';
import { useToast } from '@/shared/components/toast';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({ title: 'Đăng nhập thành công', tone: 'success' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Không thể đăng nhập',
        description: error instanceof Error ? error.message : 'Kiểm tra email, mật khẩu hoặc quyền admin.',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="login-screen">
      <section className="login-visual">
        <div className="brand-block brand-block--large">
          <div className="brand-mark">SC</div>
          <div>
            <strong>ShopCard Admin</strong>
            <span>Desktop operations console</span>
          </div>
        </div>
        <div className="login-copy">
          <p className="eyebrow">Admin workspace</p>
          <h1>Quản lý dữ liệu ShopCard từ một ứng dụng desktop riêng.</h1>
          <p>
            Đồng bộ design language của frontend, nhưng tối ưu cho bảng dữ liệu, trạng thái API và thao tác quản trị.
          </p>
        </div>
        <div className="security-note">
          <ShieldCheck size={18} />
          Token được lưu qua Electron main process và mã hóa bằng safeStorage khi hệ điều hành hỗ trợ.
        </div>
      </section>

      <section className="login-panel">
        <div>
          <p className="eyebrow">Đăng nhập</p>
          <h2>Admin account</h2>
          <p className="muted">Sử dụng tài khoản backend có role `admin`.</p>
        </div>

        <form className="form-stack" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="field-icon">
              <Mail size={16} />
              <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </div>
            {form.formState.errors.email ? <small className="form-error">{form.formState.errors.email.message}</small> : null}
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="field-icon">
              <LockKeyhole size={16} />
              <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
            </div>
            {form.formState.errors.password ? (
              <small className="form-error">{form.formState.errors.password.message}</small>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập admin'}
          </Button>
        </form>
      </section>
    </main>
  );
}
