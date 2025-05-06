import React from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
      <div className={styles.navContainer}>

        <div className={styles.nav}>
          <div className={styles.navHeader}>
            <div className={styles.navTitle}>
              <Link href="/">
                <img
                    src="/Logo-text.png"
                    alt="logo"
                    className={styles.logoImg}
                />
              </Link>
            </div>
          </div>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Products
            </Link>
            <Link href="/" className={styles.navLink}>
              Pricing
            </Link>
            <Link href="/" className={styles.navLink}>
              Why Us
            </Link>
            <Link href="/" className={styles.navLink}>
              Resources
            </Link>
            <Link href="/" className={styles.navLink}>
              Company
            </Link>
            <button className="btn green">Try it now</button>
            <button className="btn black">Login</button>
          </div>
        </div>

        {/* Mobile */}
        <div className={styles.smNav}>
          <header className={styles.smHeader}>
            <Link href="/public" className={styles.logoWrapper}>
              <img src="/Logo-text.png" alt="logo" className={styles.logo} />
            </Link>

            <input
                type="checkbox"
                id="side-menu"
                className={styles.sideMenu}
            />
            <label htmlFor="side-menu" className={styles.hamb}>
              <span className={styles.hambLine}></span>
            </label>

            <div className={styles.smMenu}>
              <ul className={styles.menu}>
                {['Products', 'Pricing', 'Why Us', 'Resources', 'Company'].map(
                    (text) => (
                        <li key={text} className={styles.menuItem}>
                          <Link href="/public" className={styles.menuLink}>
                            {text}
                          </Link>
                        </li>
                    )
                )}
                <li className={styles.menuItem}>
                  <button className="btn">Try it now</button>
                </li>
                <li className={styles.menuItem}>
                  <button className="btn">Login</button>
                </li>
              </ul>
            </div>
          </header>
        </div>
      </div>
  );
};

export default Navbar;