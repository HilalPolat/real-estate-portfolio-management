import React from "react";
//import Layout from '../../layout'
import HomeComponent from "../components/home";
import Header from "../layout/header";
import Footer from "../layout/footer";
const Home = () => {
  return (
    <>
      <Header />
      <HomeComponent />
      <Footer />
    </>
  );
};

export default Home;
