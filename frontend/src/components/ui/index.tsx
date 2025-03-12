import React from 'react';

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button: React.FC<IButtonProps> = ({
  children,
  variant = 'default',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        disabled ? 'cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

interface ICardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<ICardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
};

interface ILabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<ILabelProps> = ({
  children,
  className = ''
}) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {children}
    </label>
  );
};

interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const Select: React.FC<ISelectProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <select
      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}; 