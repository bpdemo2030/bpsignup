import { plans } from "../data/api-mock";

let sessionId;

export const login = async () => {
  try {
    const { loginResponse } = await fetch(
      `${process.env.REACT_APP_BP_URL}/login`,
      {
        method: "POST",
        body: JSON.stringify({
          username: process.env.REACT_APP_USER_LOGIN,
          password: process.env.REACT_APP_USER_PASS,
        }),
      }
    ).then((resp) => resp.json());
    if (loginResponse && loginResponse.length && loginResponse[0].SessionID) {
      sessionId = loginResponse[0].SessionID;
    }
  } catch (e) {
    return null;
  }
}

export const getAccountType = async () => {
  try {
    const accountTypeResponse = await fetch(
      `${process.env.REACT_APP_BP_URL}/query?sql=SELECT Id FROM ACCOUNT_TYPE WHERE AccountType = 'ACCOUNT'`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return accountTypeResponse?.queryResponse?.[0]?.Id;
  } catch (e) {
    return null;
  }
}

export const createAccount = async (name) => {
  try {
    await fetch(`${process.env.REACT_APP_BP_URL}/ACCOUNT`, {
      method: "POST",
      body: JSON.stringify({
        brmObjects: [{
          Name: name,
          Status: "ACTIVE",
          AccountTypeId: (await getAccountType())
        }]
      }),
      headers: { sessionId }
    }).then(resp => resp.json());
    return await getAccountByName(name);
  } catch (e) {
    return null;
  }
}

export const createBillingProfile = async (AccountId, formData) => {
  try {
    const bpResponse = await fetch(`${process.env.REACT_APP_BP_URL}/BILLING_PROFILE`, {
      method: "POST",
      body: JSON.stringify({
        brmObjects: [{
          Address1: formData.addr1,
          Email: formData.email,
          Country: formData.country,
          City: formData.city,
          State: formData.state,
          Zip: formData.zip,
          TimeZoneId: "0",
          CurrencyCode: "USD",
          MonthlyBillingDate: 31,
          PaymentTermDays: "0",
          // BillingMethod: "MAIL",
          BillingMethod: "Electronic Payment",
          BillingCycle: "MONTHLY",
          BillTo: `${formData.firstName} ${formData.lastName}`,
          InvoiceTemplateId: await findDefaultInvoiceTemplateId(),
          Status: "ACTIVE",
          AccountId
        }]
      }),
      headers: { sessionId }
    }).then(resp => resp.json());
    const savedBP = await fetch(
      `${process.env.REACT_APP_BP_URL}/query?sql=SELECT a.Id, bp.HostedPaymentPageExternalId, bp.CurrencyCode FROM Billing_Profile bp LEFT JOIN Account a ON a.Id = bp.AccountId WHERE bp.Id = ${bpResponse?.createResponse?.[0].Id}`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return savedBP?.queryResponse[0];
  } catch (e) {
    return null;
  }
}

export const createAccountProduct = async (AccountId, ProductId) => {
  try {
    const StartDate = new Date().toISOString().split("T")[0];
    const EndDate = new Date();
    const END_DATE_PLUS_DAYS = 30;
    EndDate.setDate(EndDate.getDate() + END_DATE_PLUS_DAYS);
    const bpResponse = await fetch(`${process.env.REACT_APP_BP_URL}/ACCOUNT_PRODUCT`, {
      method: "POST",
      body: JSON.stringify({
        brmObjects: [{
          Quantity: 1,
          Status: "ACTIVE",
          StartDate,
          EndDate: EndDate.toISOString().split("T")[0],
          ProductId,
          AccountId
        }]
      }),
      headers: { sessionId }
    }).then(resp => resp.json());
    const savedBP = await fetch(
      `${process.env.REACT_APP_BP_URL}/query?sql=SELECT bp.HostedPaymentPageExternalId FROM Billing_Profile bp WHERE bp.Id = ${bpResponse?.createResponse?.[0].Id}`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return savedBP?.queryResponse[0].HostedPaymentPageExternalId;
  } catch (e) {
    return null;
  }
}

export const getAccountByName = async (name) => {
  try {
    // if (!sessionId) {
    //   await login();
    // }
    const accountResponse = await fetch(
      `${process.env.REACT_APP_BP_URL}/query?sql=SELECT a.Id, bp.HostedPaymentPageExternalId, bp.CurrencyCode FROM Account a LEFT JOIN Billing_Profile bp ON bp.AccountId = a.Id WHERE a.Name = '${name}'`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return accountResponse?.queryResponse?.[0];
  } catch (e) {
    return null;
  }
}

export const getProducts = async () => {
  try {
    // if (!sessionId) {
    //   await login();
    // }
    const cachedProducts = localStorage.getItem("products");
    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }
    const productResponse = await fetch(
      `${process.env.REACT_APP_BP_URL}/query?sql=SELECT Name, Id FROM Product WHERE Name IN ('Cloud Data Standard Trial','Cloud Data Premium Trial')`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    const products = productResponse?.queryResponse;
    const standard = products.find(item => item.Name.indexOf("Standard") !== -1);
    const premium = products.find(item => item.Name.indexOf("Premium") !== -1);
    const parsedPlans = plans.map(item => {
      if (item.title === "Standard") {
        return {
          ...item,
          fullTitle: standard?.Name,
          id: standard?.Id
        }
      } else if (item.title === "Premium") {
        return {
          ...item,
          fullTitle: premium?.Name,
          id: premium?.Id
        }
      }
      return item;
    });
    localStorage.setItem("products", JSON.stringify(parsedPlans));
    return parsedPlans;
  } catch (e) {
    return null;
  }
};

const findDefaultInvoiceTemplateId = async () => {
  const { queryResponse } = await fetch(`${process.env.REACT_APP_BP_URL}/query?sql=SELECT Id FROM Invoice_Template WHERE Name = 'Default Invoice Template'`, {
    headers: {
      sessionId
    }
  })
    .then(resp => resp.json());
  return queryResponse?.[0].Id;

};

const originalFetch = fetch;
// eslint-disable-next-line
fetch = function () {
  let self = this;
  let args = arguments;
  return originalFetch.apply(self, args).then(async function (data) {
    if (data.status === 500) {
      const initialResponse = await data.json();
      const { errors } = initialResponse;
      if (errors && errors.length && errors[0].error_code === "INVALID_SESSION_ID") {
        await login();
      }
      args[1].headers.sessionId = sessionId;
      return originalFetch.apply(self, args);
    }
    return data;
  });
};