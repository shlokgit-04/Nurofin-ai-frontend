import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
}

export default function Badge({
  variant = 'gray',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const badgeClass = `${styles.badge} ${styles[variant]} ${className}`;

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
}
