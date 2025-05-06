import "../styles/globals.css";
import Layout from "../components/Layout/Layout";

const MyApp = ({ Component, pageProps, auth }) => {
  return (
      <>
        <Layout>
            <Component {...pageProps} />
        </Layout>
      </>

  );
};

export default MyApp;
