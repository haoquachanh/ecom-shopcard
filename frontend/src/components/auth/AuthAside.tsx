import React from 'react';
import { Link } from 'react-router-dom';
import { SHOP_NAME } from '@/lib/site';

type Props = {
  mode: 'login' | 'register';
};

export default function AuthAside({ mode }: Props) {
  const isLogin = mode === 'login';
  return (
    <div className="hidden md:flex flex-col justify-center bg-linear-to-br from-primary to-rose-500 shadow-lg p-8 rounded-2xl text-white">
      <img src="/img/logo.svg" alt="logo" className="mb-6 h-14" />
      <h2 className="mb-2 font-bold text-3xl">{isLogin ? `Chào mừng trở lại` : `Chào mừng bạn`}</h2>
      <p className="opacity-90 mb-4">{isLogin ? `${SHOP_NAME} đã sẵn sàng giúp bạn.` : `Tạo tài khoản để tận hưởng trải nghiệm cá nhân hóa.`}</p>

      <ul className="space-y-2 opacity-90 mb-6 text-sm">
        <li>• In chất lượng cao, giao toàn quốc</li>
        <li>• Lưu mẫu yêu thích để tham khảo lại nhanh</li>
        <li>• Ưu đãi dành riêng cho thành viên</li>
      </ul>

      <div className="flex gap-2 mb-6">
        <button className={`px-3 py-1 rounded-full text-sm ${isLogin ? 'bg-white text-primary' : 'bg-white/30 text-white/90'}`}>Đăng nhập</button>
        <Link to="/register" className={`px-3 py-1 rounded-full text-sm ${!isLogin ? 'bg-white text-primary' : 'bg-white/30 text-white/90'}`}>Đăng ký</Link>
      </div>

      <div className="opacity-90 mt-auto pt-6 text-sm">
        <p>Hỗ trợ: <a href="tel:0937617695" className="underline">093 761 7695</a></p>
        <p className="mt-1">Zalo/Hotline: <a href="https://zalo.me/0937617695" className="underline">Chat ngay</a></p>
      </div>
    </div>
  );
}
