import React from 'react';
import { Button } from './ui';

type State = {
  error?: Error;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="fatal-screen">
          <div>
            <p className="eyebrow">ShopCard Admin</p>
            <h1>Ứng dụng gặp lỗi</h1>
            <p>{this.state.error.message || 'Vui lòng tải lại ứng dụng hoặc kiểm tra cấu hình API.'}</p>
            <Button onClick={() => window.location.reload()}>Tải lại</Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
