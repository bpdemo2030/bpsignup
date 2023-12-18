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
import "./PaymentForm.css";

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
    let error;
    if (step === formSteps.BILLING_CONTACT) {
      if (!formData.firstName) {
        error = "First Name is required";
      } else if (!formData.lastName) {
        error = "Last Name is required";
      } else if (!formData.companyName) {
        error = "Company Name is required";
      } else if (!formData.email) {
        error = "Email is required";
      } else if (!formData.country) {
        error = "Country is required";
      } else if (!formData.state) {
        error = "State is required";
      } else if (!formData.city) {
        error = "City is required";
      } else if (!formData.addr1) {
        error = "Address is required";
      } else if (!formData.zip) {
        error = "Zip is required";
      }
    }
    if (error) {
      setFormState({
        status: "error",
        message: error,
      });
      return false;
    } else {
      setFormState({
        status: "",
        message: "",
      });
      return true;
    }
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
        <div className="billing-contact-form">
          <h2 className="form-header">Your details</h2>
          <span style={{ color: "red" }}>{formState.message}</span>
          <div
            className="form-fields"
            style={step !== formSteps.BILLING_CONTACT ? { opacity: 0.7 } : {}}
          >
            <span className="form-label form-label">Name</span>
            <div className="flex form-input name-input">
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
            <span className="form-label form-label">Company name</span>
            <input
              className="form-input"
              placeholder="Company Name"
              name="companyName"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.companyName}
              onChange={onChangeField}
            />
            <span className="form-label form-label">Email address</span>
            <input
              className="form-input"
              placeholder="Email"
              name="email"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.email}
              onChange={onChangeField}
            />
            <span className="form-label form-label">Country</span>
            <input
              className="form-input"
              placeholder="Country"
              name="country"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.country}
              onChange={onChangeField}
            />
            <span className="form-label form-label">State</span>
            <input
              className="form-input"
              placeholder="State"
              name="state"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.state}
              onChange={onChangeField}
            />
            <span className="form-label form-label">City</span>
            <input
              className="form-input"
              placeholder="City"
              name="city"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.city}
              onChange={onChangeField}
            />
            <span className="form-label form-label">Address</span>
            <input
              className="form-input"
              placeholder="Address"
              name="addr1"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.addr1}
              onChange={onChangeField}
            />
            <span className="form-label form-label">Zip</span>
            <input
              className="form-input"
              placeholder="Zip"
              name="zip"
              disabled={step === formSteps.PAYMENT_DETAILS}
              value={formData.zip}
              onChange={onChangeField}
            />
          </div>
          <button
            onClick={onFormSubmit}
            className="step-btn"
            disabled={step === formSteps.PAYMENT_DETAILS}
          >
            Next
          </button>
        </div>
      )}
      <div id="payment-form"></div>
    </div>
  );
};

export default PaymentForm;
