"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../src/components/Card/Card";
import Footer from "../src/components/Footer/Footer";
import Loader from "../src/components/Loader/Loader";
import Navbar from "../src/components/Navbar/Navbar";
import { getHppSecurityToken, getProducts } from "../src/data/api";
import "./index.css";

const HomePage = ({ token }) => {
  const [bpProducts, setBpProducts] = useState([]);

  useEffect(() => {
    getProducts().then(products => {
      setBpProducts(products)
    });
  }, []);

  return (
    <div>
      <Navbar />
      <div className="content-center">
        <div>
          <div className="flex justify-center">
            <h4 className="header">Feature-rich plans with upfront pricing</h4>
          </div>
          <div className="flex justify-center">
            <h6 className="secondary-text">
              Choose the best option for your company
            </h6>
          </div>
          <div>
            <div className="plans">
              {!bpProducts.length ? (
                <Loader />
              ) : (
                bpProducts.map((item, index) => (
                  <Card key={item.id}>
                    <div className="flex column text-center">
                      <div className="flex justify-center plan-logo">
                        <img
                          src={`/Plan-${
                            index + 1
                          }.png`}
                          alt="plan"
                        />
                      </div>
                      <h4 className="card-title">{item.title}</h4>
                      <h2 className="card-price">
                        {item.currencySign}
                        {item.price || item.priceDescription}
                      </h2>
                      <span className="price-description">USD/MONTH</span>
                      {item.price ? (
                        <Link href={`/register?planId=${item.id}`}>
                          <button
                            className={`btn ${
                              index % 2 === 0 ? "blue" : "green"
                            } try-btn`}
                          >
                            Try it now
                          </button>
                        </Link>
                      ) : (
                        <button
                          className={`btn ${
                            index % 2 === 0 ? "blue" : "green"
                          } try-btn`}
                        >
                          Contact Us
                        </button>
                      )}
                      <div className="plan-description flex column justify-center m-auto">
                        {item.description.map((desc) => (
                          <div key={desc} className="flex description">
                            <img
                              src={`/Check-icon.png`}
                              className="check"
                              alt="check"
                            />
                            <span className="text-left">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {/* <div className="home-background"></div> */}
      {/* <div className="home-cloud-data-icon"></div> */}
    </div>
  );
};

export const getServerSideProps = async ()=> {
  let token;
  // token = await getHppSecurityToken();
  return {
    props: {
      token: token || ""
    }
  }
};

export default HomePage;
