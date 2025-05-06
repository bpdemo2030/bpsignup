import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, disabled }) => {
  return (
      <div
          className={`${styles.cardContainer} ${
              disabled ? styles.disabledCard : ''
          }`}
      >
        {children}
      </div>
  );
};

export default Card;