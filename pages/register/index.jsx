import React, { useEffect, useState } from "react";
import Navbar from "../../src/components/Navbar/Navbar";
import Card from "../../src/components/Card/Card";
import "./RegisterPage.css";
import PaymentForm from "../../src/components/PaymentForm/PaymentForm";
import { getHppSecurityToken, getProducts } from "../../src/data/api";
import Footer from "../../src/components/Footer/Footer";

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
    <div>
      <Navbar />
      <div className="w-full page-content">
        <div className="flex justify-between">
          <div className="w-full form-description">
            <div className="text-center">
              <h3 className="header">Shopping cart:</h3>
            </div>
            <div>
              <div className="flex column">
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
                <div className="flex w-full justify-between total-block">
                  <span>Total</span>
                  <span>
                    {selectedPlan?.currencySign} {selectedPlan?.price}
                  </span>
                </div>
                {/* {selectedPlan?.description?.map((item) => (
                <div className="flex" key={item}>
                  <img src="/Check-icon.png" className="my-auto" alt="check" />
                  <span>{item}</span>
                </div>
              ))} */}
                <span className="card-label">
                  Your card will be charged on{" "}
                  {paymentDate.toLocaleDateString("en", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  . You can cancel anytime before that.
                </span>

                <div className="terms-block">
                  <h4>Terms & Conditions</h4>
                  <div className="flex">
                    <input
                      type="checkbox"
                      checked={allowForm}
                      onChange={(e) => setAllowForm(e.target.checked)}
                    />
                    <span className="terms-text">
                      I have read and agree to the{" "}
                      <a
                        className="terms"
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
            </div>
            <div className="businesses">
              <h3>Trusted by leading businesses</h3>
              <div className="list flex justify-between w-full">
                <img
                  src={`/emburse-logo.png`}
                  alt="emburse-logo"
                />
                <img
                  src={`/go-cardless-logo.png`}
                  alt="go-cardless-logo"
                />
                <img
                  src={`/jpmc-logo.png`}
                  alt="jpmc-logo"
                />
                <img
                  src={`/thunes-logo.png`}
                  alt="thunes-logo"
                />
              </div>
              <div className="secondary-text">
                voluptatem accusantium doloremque laudantium, totam rem aperiam
                eaque ipsa, quae ab illo inventore veritatis et quasi architecto
                beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem,
                quia voluptas sit, aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos, qui ratione voluptatem sequi
                nesciunt, neque porro quisquam est
              </div>
            </div>
          </div>
          <div className="w-full billing-form">
            <Card disabled={!allowForm}>
              <PaymentForm token={token} plan={selectedPlan} />
            </Card>
          </div>
        </div>
        <Footer position="fixed" />
      </div>
      {/* <div className="register-background"></div> */}
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
