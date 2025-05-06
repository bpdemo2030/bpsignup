import { plans } from "../data/api-mock";

var sessionId;

export const login = async () => {
  try {
    const { loginResponse } = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      {
        method: "POST",
        body: JSON.stringify({
          username: process.env.NEXT_PUBLIC_USER_LOGIN,
          password: process.env.NEXT_PUBLIC_USER_PASS,
        }),
      }
    ).then((resp) => resp.json());
    if (loginResponse && loginResponse.length && loginResponse[0].SessionID) {
      sessionId = loginResponse[0].SessionID;
    }
  } catch (e) {
    console.error("An error occurred: ", e);
    return null;
  }
};

export const getAccountType = async () => {
  try {
    const accountTypeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/query?sql=SELECT Id FROM ACCOUNT_TYPE WHERE AccountType = 'ACCOUNT'`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return accountTypeResponse?.queryResponse?.[0]?.Id;
  } catch (e) {
    console.error("An error occurred: ", e);
    return null;
  }
};

export const createAccount = async (name) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ACCOUNT`, {
      method: "POST",
      body: JSON.stringify({
        brmObjects: [
          {
            Name: name,
            Status: "ACTIVE",
            AccountTypeId: await getAccountType(),
          },
        ],
      }),
      headers: { sessionId },
    }).then((resp) => resp.json());
    return await getAccountByName(name);
  } catch (e) {
    console.error("An error occurred: ", e);
    return null;
  }
};

export const createBillingProfile = async (AccountId, formData) => {
  try {
    const bpResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/BILLING_PROFILE`,
      {
        method: "POST",
        body: JSON.stringify({
          brmObjects: [
            {
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
              AccountId,
            },
          ],
        }),
        headers: { sessionId },
      }
    ).then((resp) => resp.json());
    const savedBP = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/query?sql=SELECT a.Id, bp.HostedPaymentPageExternalId, bp.CurrencyCode FROM Billing_Profile bp LEFT JOIN Account a ON a.Id = bp.AccountId WHERE bp.Id = ${bpResponse?.createResponse?.[0].Id}`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return savedBP?.queryResponse[0];
  } catch (e) {
    console.error("An error occurred: ", e);
    return null;
  }
};

export const createAccountProduct = async (AccountId, ProductId) => {
  try {
    const StartDate = new Date().toISOString().split("T")[0];
    const EndDate = new Date();
    const END_DATE_PLUS_DAYS = 30;
    EndDate.setDate(EndDate.getDate() + END_DATE_PLUS_DAYS);
    const bpResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/ACCOUNT_PRODUCT`,
      {
        method: "POST",
        body: JSON.stringify({
          brmObjects: [
            {
              Quantity: 1,
              Status: "ACTIVE",
              StartDate,
              EndDate: EndDate.toISOString().split("T")[0],
              ProductId,
              AccountId,
            },
          ],
        }),
        headers: { sessionId },
      }
    ).then((resp) => resp.json());
    const savedBP = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/query?sql=SELECT bp.HostedPaymentPageExternalId FROM Billing_Profile bp WHERE bp.Id = ${bpResponse?.createResponse?.[0].Id}`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return savedBP?.queryResponse[0].HostedPaymentPageExternalId;
  } catch (e) {
    console.error("An error occurred: ", e);
    return null;
  }
};

export const getAccountByName = async (name) => {
  try {
    // if (!sessionId) {
    //   await login();
    // }
    const accountResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/query?sql=SELECT a.Id, bp.HostedPaymentPageExternalId, bp.CurrencyCode FROM Account a LEFT JOIN Billing_Profile bp ON bp.AccountId = a.Id WHERE a.Name = '${name}'`,
      { headers: { sessionId } }
    ).then((resp) => resp.json());
    return accountResponse?.queryResponse?.[0];
  } catch (e) {
    console.error("An error occurred: ", e);
    return null;
  }
};

export async function getProducts() {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error(res.statusText);
  const products = await res.json();

  const standard = products.find(p => p.Name.includes('Standard'));
  const premium  = products.find(p => p.Name.includes('Premium'));

  const parsed = plans.map(plan => {
    if (plan.title === 'Standard') return { ...plan, fullTitle: standard?.Name, id: standard?.Id };
    if (plan.title === 'Premium')  return { ...plan, fullTitle: premium?.Name,   id: premium?.Id   };
    return plan;
  });

  localStorage.setItem('products', JSON.stringify(parsed));
  return parsed;
}

// export const getProducts = async () => {
//   try {
//     if (!sessionId) {
//       await login();
//     }
//     //debugger;
//     //const cachedProducts = localStorage.getItem("products");
//     // if (cachedProducts) {
//     //   return JSON.parse(cachedProducts);
//     // }
//     const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}
//     /query?sql=SELECT * FROM Product WHERE Name IN ('Cloud Data Standard Trial','Cloud Data Premium Trial')`, )
//         .then((resp) => resp.json());
//     console.log("RESPONSE:", cachedProducts)
//     const products = productResponse?.queryResponse;
//     const standard = products.find(
//       (item) => item.Name.indexOf("Standard") !== -1
//     );
//     const premium = products.find(
//       (item) => item.Name.indexOf("Premium") !== -1
//     );
//
//     const parsedPlans = plans.map((item) => {
//       if (item.title === "Standard") {
//         return {
//           ...item,
//           fullTitle: standard?.Name,
//           id: standard?.Id,
//         };
//       } else if (item.title === "Premium") {
//
//         return {
//           ...item,
//           fullTitle: premium?.Name,
//           id: premium?.ProductId,
//         };
//       }
//       return item;
//     });
//     localStorage.setItem("products", JSON.stringify(parsedPlans));
//     console.log(parsedPlans);
//     return parsedPlans;
//   } catch (e) {
//     console.error("An error occurred: ", e);
//     return null;
//   }
// };

export const getHppSecurityToken = async (HPP_API_URL) => {
  // const requestUrl = `${HPP_API_URL}/authenticate`;
  const requestUrl = `https://my.billingplatform.com/standard_demo/hostedPayments/1.0/authenticate`;

  return fetch(requestUrl, {
    headers: {
      environmentId: process.env.NEXT_PUBLIC_BP_ENV_ID,
      "Content-Type": "application/json"
     },
    method: 'POST',
    body: JSON.stringify({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      secret: "1EDvm3kv80$9V5a@bh2K_Vz5ePPMHJ3FMbT"//process.env.NEXT_PUBLIC_SECRET
    }),
  })
    .then(response => response.json())
    .then(response => {
      return response?.accessToken?.content
    })
    .catch((e) => {
      console.error("An error occurred: ", e);
    });
};

const findDefaultInvoiceTemplateId = async () => {
  const { queryResponse } = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/query?sql=SELECT Id FROM Invoice_Template WHERE Name = 'Default Invoice Template'`,
    {
      headers: {
        sessionId,
      },
    }
  ).then((resp) => resp.json());
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
      if (
        errors &&
        errors.length &&
        errors[0].error_code === "INVALID_SESSION_ID"
      ) {
        await login();
      }
      args[1].headers.sessionId = sessionId;
      return originalFetch.apply(self, args);
    }
    return data;
  });
};
