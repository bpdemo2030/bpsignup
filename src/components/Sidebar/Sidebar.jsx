import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <nav className={styles.nav}>
      <a className={styles.a} href="#burger">
        <img src={`/burger-icon.png`} alt="burger" />
      </a>
      <a className={styles.a} href="#cloud">
        <img src={`/cloud-icon.png`} alt="cloud" />
      </a>
      <a className={styles.a} href="#settings">
        <img
          src={`/settings-icon.png`}
          alt="settings"
        />
      </a>
      <a className={styles.a} href="#chart">
        <img src={`/chart-icon.png`} alt="chart" />
      </a>
    </nav>
  );
};

export default Sidebar;
