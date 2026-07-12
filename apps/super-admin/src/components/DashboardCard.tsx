import styles from './DashboardCard.module.css';
import type { CSSProperties, ReactNode } from 'react';

type CardVariant = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

const iconWrapperClass: Record<string, string> = {
  default: '',
  primary: styles.iconWrapperPrimary,
  info: styles.iconWrapperInfo,
  success: styles.iconWrapperSuccess,
  warning: styles.iconWrapperWarning,
  danger: styles.iconWrapperDanger,
};

export function DashboardCard({
  title,
  sub,
  children,
  style,
  iconVariant = 'default',
  titleIcon,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  style?: CSSProperties;
  iconVariant?: CardVariant;
  titleIcon?: ReactNode;
}) {
  const iconClass = iconWrapperClass[iconVariant] || '';

  return (
    <div className={styles.card} style={style}>
      {(title || titleIcon) && (
        <div className={styles.header}>
          <div className={styles.titleIcon}>
            {titleIcon && <span className={`${styles.iconWrapper} ${iconClass}`}>{titleIcon}</span>}
            {title && <h3 className={styles.title}>{title}</h3>}
          </div>
        </div>
      )}
      {sub && <p className={styles.subtitle}>{sub}</p>}
      {children}
    </div>
  );
}
