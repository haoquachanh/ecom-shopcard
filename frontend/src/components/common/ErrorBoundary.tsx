import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Đã có lỗi xảy ra</h2>
          <p className="text-muted-foreground text-sm mb-4">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false })}>Thử lại</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
