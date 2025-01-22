import React, { useEffect } from "react"; 
import { HashRouter, Route, Routes, useLocation, Navigate, useNavigate } from "react-router-dom";
import  StrategyBuilder  from "../Pages/StrategyBuilder";

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        document.title = "Strategy Builder";
        // Change the URL if needed
        if (window.location.hash !== "#/") {
          navigate("/", { replace: true });
        }
        break;
      case "/PortfolioTrades":
        document.title = "Portfolio Trades";
        break;
      default:
        document.title = "Title Not Found";
    }
  }, [location.pathname, navigate]);

  const auth_token = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI4OUFXWk4iLCJqdGkiOiI2Nzg0ZDQ3NmU4NmZjZDNhZDIzNWMxNWMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaWF0IjoxNzM2NzU4MzkwLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3MzY4MDU2MDB9.2c-WOnzlCYkBusgKoT8ofYjkxUzx6UfUOctv9n31WTQ";

  return (
    <Routes>
      <Route path="/" element={<StrategyBuilder />} />
    </Routes>
  );
};

const App = () => (
  <HashRouter>
    <AppRoutes />
  </HashRouter>
);

export default App;
