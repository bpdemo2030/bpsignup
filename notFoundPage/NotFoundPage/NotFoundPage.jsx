import React from "react";
import Link from "next/link";
import Navbar from "../../src/components/Navbar/Navbar";

const NotFoundPage = () => {
  
  return <div>
    <Navbar/>
    <div>
      <div>
        <h1>Not found</h1>
      </div>
      <div>
        <Link to="/public">Home</Link>
      </div>
    </div>
  </div>

};

export default NotFoundPage;
