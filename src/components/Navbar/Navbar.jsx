import React from "react";
import Link from "next/link";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div>
      <div className="nav lg-nav">
        <div className="nav-header">
          <div className="nav-title">
            <Link href="/">
              <img src={`/Logo-text.png`} alt="logo" />
            </Link>
          </div>
        </div>

        <div className="nav-links">
          <Link href="/">Products</Link>
          <Link href="/">Pricing</Link>
          <Link href="/">Why Us</Link>
          <Link href="/">Resources</Link>
          <Link href="/">Company</Link>
          <button className="btn green">Try it now</button>
          <button className="btn black">Login</button>
        </div>
      </div>

      <div className="sm-nav">
        <header className="sm-header">
          <Link href="/" className="my-auto">
            <img
              src={`/Logo-text.png`}
              alt="logo"
              className="logo"
            />
          </Link>

          <input className="side-menu" type="checkbox" id="side-menu" />
          <label className="hamb" htmlFor="side-menu">
            <span className="hamb-line"></span>
          </label>
          <nav className="sm-menu">
            <ul className="menu">
              <li>
                <Link href="/">Products</Link>
              </li>
              <li>
                <Link href="/">Pricing</Link>
              </li>
              <li>
                <Link href="/">Why Us</Link>
              </li>
              <li>
                <Link href="/">Resources</Link>
              </li>
              <li>
                <Link href="/">Company</Link>
              </li>
              <li>
                <button className="btn green">Try it now</button>
              </li>
              <li>
                <button className="btn black">Login</button>
              </li>
            </ul>
          </nav>
        </header>
      </div>
    </div>
  );
};

export default Navbar;
