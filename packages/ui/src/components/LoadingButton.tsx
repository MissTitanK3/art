import React from 'react';
import { Button, ButtonProps } from './button';

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ isLoading, loadingText = 'Loading…', children, ...props }) => {
  return (
    <Button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? loadingText : children}
    </Button>
  );
};