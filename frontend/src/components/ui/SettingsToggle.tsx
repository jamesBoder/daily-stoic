import React, { useId } from 'react';
import styles from './SettingsToggle.module.css';

interface Props {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingsToggle: React.FC<Props> = ({ label, description, checked, onChange, disabled }) => {
  const id = useId();

  return (
    <div className={styles.row}>
      <div className={styles.text}>
        {label && <label htmlFor={id} className={styles.label}>{label}</label>}
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`${styles.toggle} ${checked ? styles.on : styles.off}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
};
