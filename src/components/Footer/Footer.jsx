import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {

  return (
      <div className={styles.footerContainer} >
        <div className="flex justify-center">
          <span>Privacy | Terms</span>
          {/* <span>{new Date().getFullYear()} Cloud data. All Rights Reserved.</span> */}
        </div>
      </div>
      )


};

export default Footer;
