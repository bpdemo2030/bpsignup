// components/PaymentForm/PaymentForm.jsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAccountByName,
  createAccount,
  createBillingProfile,
  createAccountProduct,
} from "../../data/api";
import Loader from "../Loader/Loader";
import styles from "./PaymentForm.module.css";

const defaultFormData = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  country: "",
  state: "",
  city: "",
  addr1: "",
  zip: "",
};

const formSteps = { BILLING_CONTACT: 0, PAYMENT_DETAILS: 1 };

export default function PaymentForm({ plan, token }) {
  const [data, setData] = useState(defaultFormData);
  const [state, setState] = useState({ status: "", message: "" });
  const [step, setStep] = useState(formSteps.BILLING_CONTACT);
  const router = useRouter();

  // Great use of a `billingFields` array to DRY up repeated input definitions — this centralizes field metadata and simplifies rendering with `map`
  const billingFields = [
    { key: "companyName", label: "Company name", placeholder: "Company Name" },
    { key: "email",       label: "Email address", placeholder: "Email" },
    { key: "country",     label: "Country",       placeholder: "Country" },
    { key: "state",       label: "State",         placeholder: "State" },
    { key: "city",        label: "City",          placeholder: "City" },
    { key: "addr1",       label: "Address",       placeholder: "Address" },
    { key: "zip",         label: "Zip",           placeholder: "Zip code" },
  ];

  const handleChange = e => setData(d => ({ ...d, [e.target.name]: e.target.value }));
  const handleBlur   = e => setData(d => ({ ...d, [e.target.name]: d[e.target.name].trim() }));

  const validate = () => {
    if (step !== formSteps.BILLING_CONTACT) return true;
    const missing = [
      { key: "firstName", label: "First Name" },
      { key: "lastName",  label: "Last Name"  },
      ...billingFields
    ].find(f => !data[f.key]);
    if (missing) {
      setState({ status: "error", message: `${missing.label} is required` });
      return false;
    }
    setState({ status: "", message: "" });
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setState({ status: "loading", message: "" });
    try {
      let acct = await getAccountByName(data.companyName) ||
          await createAccount(data.companyName);
      if (!acct.HostedPaymentPageExternalId) {
        acct = await createBillingProfile(acct.Id, data);
      }
      setState({ status: "", message: "" });
      setStep(formSteps.PAYMENT_DETAILS);

      const script = document.createElement("script");
      script.src = "https://cdn.aws.billingplatform.com/hosted-payments-ui@release/lib.js";
      document.body.append(script);
      script.onload = () => {
        window.HostedPayments.renderPaymentForm({
          targetSelector: "#payment-form",
          securityToken: token,
          walletMode: true,
          apiUrl: "https://my.billingplatform.com/standard_demo/hostedPayments/1.0",
          paymentGateways: {
            creditCard: { gateway: "StaxPayments_CC" },
            directDebit: { gateway: "StaxPayments_DD" },
          },
          environmentId: "379d372b-8406-4599-8f74-bc283342c5a5",
          billingProfileId: acct.HostedPaymentPageExternalId,
          fullName: `${data.firstName} ${data.lastName}`,
          currencyCode: acct.CurrencyCode,
          state: data.state,
          city: data.city,
          address: data.addr1,
          zip: data.zip,
          email: data.email,
        }, {
          successCapture: () => router.push("/portal"),
          addPaymentMethod: () => {
            createAccountProduct(acct.Id, plan.id);
            router.push("/portal");
          }
        });
      };
    } catch {
      setState({ status: "error", message: "API error" });
    }
  };

  const loading = state.status === "loading";
  const contactStep = step === formSteps.BILLING_CONTACT;

  return (
      <div>
        {loading && <Loader />}
        {step !== formSteps.PAYMENT_DETAILS && (
            <div className={styles.container}>
              <h2 className={styles.header}>Your details</h2>
              {state.message && <p className={styles.error}>{state.message}</p>}

              <div className={`${styles.fields} ${!contactStep ? styles.disabled : ""}`}>
                <div className={styles.field}>
                  <label>Name</label>
                  <div className={styles.inline}>
                    <input name="firstName" placeholder="First Name"
                           value={data.firstName}
                           disabled={!contactStep}
                           onChange={handleChange}
                           onBlur={handleBlur} />
                    <input name="lastName"  placeholder="Last Name"
                           value={data.lastName}
                           disabled={!contactStep}
                           onChange={handleChange} />
                  </div>
                </div>

                {billingFields.map(({ key, label, placeholder }) => (
                    <div className={styles.field} key={key}>
                      <label htmlFor={key}>{label}</label>
                      <input id={key}
                             name={key}
                             placeholder={placeholder}
                             value={data[key]}
                             disabled={!contactStep}
                             onChange={handleChange} />
                    </div>
                ))}
              </div>

              <button onClick={submit}
                      className={styles.button}
                      disabled={!contactStep}>
                Next
              </button>
            </div>
        )}
        <div id="payment-form" />
      </div>
  );
}