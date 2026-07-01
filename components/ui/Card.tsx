import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  hoverable?: boolean;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({
  title,
  description,
  hoverable = false,
  headerAction,
  footer,
  children,
  className = '',
  ...props
}: CardProps) {
  const cardClass = `${styles.card} ${hoverable ? styles.cardHover : ''} ${className}`;

  return (
    <div className={cardClass} {...props}>
      {(title || description || headerAction) && (
        <div className={styles.header}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      {children && <div className={styles.content}>{children}</div>}

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
