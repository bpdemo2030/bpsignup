"use client";
import React, { useEffect, useState } from "react";
import { getProducts } from "../data/api";
import Loader from "../components/Loader/Loader";
import styles from "../styles/pages/index.module.css";
import Card from "../components/Card/Card";
import Link from "next/link";

const HomePage = ({ token }) => {
  const [bpProducts, setBpProducts] = useState([]);

  useEffect(() => {
    getProducts().then(products => {
      setBpProducts(products)
    });
  }, []);

  return (
      <div className={styles.contentCenter}>
        <div>
          <div className="flex justify-center">
            <h4 className={styles.header}>
              Feature-rich plans with upfront pricing
            </h4>
          </div>
          <div className="flex justify-center">
            <h6 className={styles.secondaryText}>
              Choose the best option for your company
            </h6>
          </div>

          <div>
            <div className={styles.plans}>
              {!bpProducts.length ? (
                <div className={styles.contentCenter}>
                  <Loader />
                </div>
              ) : (
                  bpProducts.map((item, index) => (
                      <Card key={item.id}>
                        <div className="flex flex-col text-center">
                          <div className={`flex justify-center ${styles.planLogo}`}>
                            <img src={`/Plan-${index + 1}.png`} alt="plan" />
                          </div>

                          <h4 className={styles.cardTitle}>{item.title}</h4>
                          <h2 className={styles.cardPrice}>
                            {item.currencySign}
                            {item.price || item.priceDescription}
                          </h2>
                          <span className={styles.priceDescription}>USD/MONTH</span>

                          {item.price ? (
                              <Link href={`/register?planId=${item.id}`}>
                                <button
                                    className={`btn ${
                                        index % 2 === 0 ? "blue" : "green"
                                    } ${styles.tryBtn}`}
                                >
                                  Try it now
                                </button>
                              </Link>
                          ) : (
                              <button
                                  className={`btn ${
                                      index % 2 === 0 ? "blue" : "green"
                                  } ${styles.tryBtn}`}
                              >
                                Contact Us
                              </button>
                          )}

                          <div
                              className={`flex flex-col justify-center m-auto ${styles.planDescription}`}
                          >
                            {item.description.map((desc) => (
                                <div
                                    key={desc}
                                    className={`flex ${styles.description}`}
                                >
                                  <img
                                      src="/Check-icon.png"
                                      className={styles.check}
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
