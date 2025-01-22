import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AppMenu from "./Components/AppMenus";
import AppRoutes from "./AppRoutes/AppRoutes";
import Container from 'react-bootstrap/Container';
import axios from "axios";

const App = () => {
  const [userName, setUserName] = useState(null);

  // useEffect(() => {
  //   const url = "https://dev.icharts.in/opt/api/getuserName_Api.php";
  //   axios
  //     .get(url, { withCredentials: true })
  //     .then((response) => {
  //       const data = response.data;
  //       if (data == null) {
  //         window.location.href = "/opt/login.php";
  //       } else {
  //         setUserName(data);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching username:", err);
  //     });
  // }, []);

  return (
    <div className={`app-container`}>
      <div style={{ zIndex: 1000 }}>
        <AppMenu />
        <Container className={`app-container`}>
          <AppRoutes />
        </Container>
      </div>
    </div>
  );
};

export default App;
