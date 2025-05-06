import React from "react";
import styles from "./Loader.module.css";

const Loader = () => {
  return (
      <div className={styles.bpuiPreloader}>
          <div className={styles.bpuiPreloaderOverlay}></div>
          <div className={styles.bpuiPreloaderSpinner}>
              <span>Loading</span>
              <span>...</span>
          </div>
      </div>
  );
};

export default Loader;
