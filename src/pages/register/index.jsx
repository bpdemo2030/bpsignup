import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Card from "../../components/Card/Card";
import styles from "./RegisterPage.module.css";
import PaymentForm from "../../components/PaymentForm/PaymentForm";
import { getHppSecurityToken, getProducts } from "../../data/api";
import Footer from "../../components/Footer/Footer";

const NEXT_PAYMENT_DIFF_DAYS = 30;
const paymentDate = new Date();
paymentDate.setDate(paymentDate.getDate() + NEXT_PAYMENT_DIFF_DAYS);

const getQueryParam = (name) => {
  if (
    (name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(
      window.location.search
    ))
  )
    return decodeURIComponent(name[1]);
};

const getSelectedPlan = (plans) => {
  const id = getQueryParam("planId");
  if (id && !window.isNaN(id)) {
    return plans.find((item) => Number(item.id) === Number(id));
  }
  return plans[0];
};

const RegisterPage = ({token}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [allowForm, setAllowForm] = useState(false);

  useEffect(() => {
    getProducts().then((data) => {
      setSelectedPlan(getSelectedPlan(data));
    });
  }, []);

  return (
      <div className={`w-full ${styles.pageContent}`}>
        <div className="flex justify-between">

          {/* left column */}
          <div className={`w-full ${styles.formDescription}`}>
            <div className="text-center">
              <h3 className={styles.header}>Shopping cart:</h3>
            </div>

            {/* Plan summary */}
            <div className="flex flex-col space-y-2">
              <div className="flex w-full justify-between">
                <span>{selectedPlan?.fullTitle || selectedPlan?.title}</span>
                <span>
                {selectedPlan?.currencySign} {selectedPlan?.price}
              </span>
              </div>
              <div className="flex w-full justify-between">
                <span>Tax</span>
                <span>{selectedPlan?.currencySign} 0</span>
              </div>
              <div
                  className={`flex w-full justify-between ${styles.totalBlock}`}
              >
                <span>Total</span>
                <span>
                {selectedPlan?.currencySign} {selectedPlan?.price}
              </span>
              </div>

              <span className={styles.cardLabel}>
              Your card will be charged on{" "}
                {paymentDate.toLocaleDateString("en", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                . You can cancel anytime before that.
            </span>

              <div className={styles.termsBlock}>
                <h4>Terms & Conditions</h4>
                <div className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      checked={allowForm}
                      onChange={(e) => setAllowForm(e.target.checked)}
                  />
                  <span className={styles.termsText}>
                  I have read and agree to the{" "}
                    <a
                        className={styles.termsLink}
                        href="https://billingplatform.com/terms-of-use"
                        target="_blank"
                        rel="noreferrer"
                    >
                    Terms of use
                  </a>
                </span>
                </div>
              </div>
            </div>

            <div className={styles.businesses}>
              <h3>Trusted by leading businesses</h3>
              <div className={`flex justify-between w-full ${styles.list}`}>
                <img src="/emburse-logo.png" alt="Emburse" />
                <img src="/go-cardless-logo.png" alt="Go-Cardless" />
                <img src="/jpmc-logo.png" alt="JPMC" />
                <img src="/thunes-logo.png" alt="Thunes" />
              </div>
              <div className={styles.secondaryText}>
                voluptatem accusantium doloremque laudantium, totam rem aperiam
                eaque ipsa, quae ab illo inventore veritatis et quasi architecto
                beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem,
                quia voluptas sit, aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos, qui ratione voluptatem sequi
                nesciunt, neque porro quisquam est
              </div>
            </div>
          </div>

          {/* right column: billing form */}
          <div className={`w-full ${styles.billingForm}`}>
            <Card disabled={!allowForm}>
              <PaymentForm token={token} plan={selectedPlan} />
            </Card>
          </div>
        </div>
      </div>
  );
};

export const getServerSideProps = async () => {
  const token = await getHppSecurityToken();
  return {
    props: {token: token || ""}
  }
};

export default RegisterPage;
