import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAccountByName,
  createAccount,
  createBillingProfile,
  createAccountProduct,
  getHppSecurityToken
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

const formSteps = {
  BILLING_CONTACT: 0,
  PAYMENT_DETAILS: 1,
};

let savedAccount;

const PaymentForm = ({ plan, token }) => {
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [formState, setFormState] = useState({ status: "", message: "" });
  const [step, setStep] = useState(formSteps.BILLING_CONTACT);

  const router = useRouter();

  const buildPaymentForm = async (hostedPaymentPageExternalId, CurrencyCode) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.aws.billingplatform.com/hosted-payments-ui@release/lib.js";
    document.body.append(script);
    const orgURL = "https://my.billingplatform.com/standard_demo";
    
    script.onload = function () {
      window.HostedPayments.renderPaymentForm(
        {
          targetSelector: "#payment-form",
          // amount: Number(plan?.price),
          securityToken: token,
          walletMode: true,
          apiUrl:
            `${orgURL}/hostedPayments/1.0`,
          paymentGateways: {
            creditCard: { gateway: "StaxPayments_CC" },
            directDebit: { gateway: "StaxPayments_DD" },
          },
          environmentId: "379d372b-8406-4599-8f74-bc283342c5a5",
          billingProfileId: hostedPaymentPageExternalId,
          fullName: `${formData.firstName} ${formData.lastName}`,
          currencyCode: CurrencyCode,
          state: formData.state,
          city: formData.city,
          address: formData.addr1,
          zip: formData.zip,
          email: formData.email,
        },
        {
          successCapture: () => router.push("/portal"),
          addPaymentMethod: () => {
            createAccountProduct(savedAccount?.Id, plan.id);
            router.push("/portal");
          },
        }
      );
    };
  };

  const validateForm = () => {
    if (step !== formSteps.BILLING_CONTACT) {
      setFormState({ status: "", message: "" });
      return true;
    }

    const requiredFields = [
      { key: "firstName",   label: "First Name"   },
      { key: "lastName",    label: "Last Name"    },
      { key: "companyName", label: "Company Name" },
      { key: "email",       label: "Email"        },
      { key: "country",     label: "Country"      },
      { key: "state",       label: "State"        },
      { key: "city",        label: "City"         },
      { key: "addr1",       label: "Address"      },
      { key: "zip",         label: "Zip"          },
    ];

    const missing = requiredFields.find(f => !formData[f.key]);

    if (missing) {
      setFormState({
        status:  "error",
        message: `${missing.label} is required`
      });

      return false;
    }

    setFormState({ status: "", message: "" });
    return true;
  };

  const onFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    savedAccount = null;

    try {
      setFormState({ status: "loading", message: "" });
      savedAccount = await getAccountByName(formData.companyName);

      if (!savedAccount) {
        savedAccount = await createAccount(formData.companyName);
      }

      if (!savedAccount.HostedPaymentPageExternalId) {
        savedAccount = await createBillingProfile(
          savedAccount.Id,
          formData
        );
      }
      // await createAccountProduct(savedAccount.Id, plan.id);
      setFormState({ status: "", message: "" });
      setStep(formSteps.PAYMENT_DETAILS);
      buildPaymentForm(savedAccount.HostedPaymentPageExternalId, savedAccount.CurrencyCode);
    } catch (e) {
      setFormState({ status: "error", message: "API error" });
    }
  };

  const onChangeField = (e) => {
    const copy = { ...formData };
    copy[e.target.name] = e.target.value;
    setFormData(copy);
  };

  const onFieldBlur = (e) => {
    const copy = { ...formData };
    copy[e.target.name] = (copy[e.target.name] || "").trim();
    setFormData(copy);
  };

  return (
      <div>
        {formState.status === "loading" && <Loader />}
        {step !== formSteps.PAYMENT_DETAILS && (
            <div className={styles.billingContactForm}>
              <h2 className={styles.formHeader}>Your details</h2>
              <span className={styles.errorMessage}>
            {formState.message}
          </span>

              <div
                  className={
                    step !== formSteps.BILLING_CONTACT
                        ? `${styles.formFields} ${styles.disabled}`
                        : styles.formFields
                  }
              >
                <span className={styles.formLabel}>Name</span>
                <div className={`${styles.formInput} ${styles.nameInput}`}>
                  <input
                      placeholder="First Name"
                      name="firstName"
                      disabled={step === formSteps.PAYMENT_DETAILS}
                      value={formData.firstName}
                      onChange={onChangeField}
                      onBlur={onFieldBlur}
                  />
                  <input
                      placeholder="Last Name"
                      name="lastName"
                      disabled={step === formSteps.PAYMENT_DETAILS}
                      value={formData.lastName}
                      onChange={onChangeField}
                  />
                </div>

                <span className={styles.formLabel}>Company name</span>
                <input
                    className={styles.formInput}
                    placeholder="Company Name"
                    name="companyName"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.companyName}
                    onChange={onChangeField}
                />

                <span className={styles.formLabel}>Email address</span>
                <input
                    className={styles.formInput}
                    placeholder="Email"
                    name="email"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.email}
                    onChange={onChangeField}
                />

                <span className={styles.formLabel}>Country</span>
                <input
                    className={styles.formInput}
                    placeholder="Country"
                    name="country"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.country}
                    onChange={onChangeField}
                />

                <span className={styles.formLabel}>State</span>
                <input
                    className={styles.formInput}
                    placeholder="State"
                    name="state"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.state}
                    onChange={onChangeField}
                />

                <span className={styles.formLabel}>City</span>
                <input
                    className={styles.formInput}
                    placeholder="City"
                    name="city"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.city}
                    onChange={onChangeField}
                />

                <span className={styles.formLabel}>Address</span>
                <input
                    className={styles.formInput}
                    placeholder="Address"
                    name="addr1"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.addr1}
                    onChange={onChangeField}
                />

                <span className={styles.formLabel}>Zip</span>
                <input
                    className={styles.formInput}
                    placeholder="Zip"
                    name="zip"
                    disabled={step === formSteps.PAYMENT_DETAILS}
                    value={formData.zip}
                    onChange={onChangeField}
                />
              </div>

              <button
                  onClick={onFormSubmit}
                  className={styles.stepBtn}
                  disabled={step === formSteps.PAYMENT_DETAILS}
              >
                Next
              </button>
            </div>
        )}

        <div id="payment-form" />
      </div>
  );
};

export default PaymentForm;
