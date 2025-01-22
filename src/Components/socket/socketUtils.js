// import React, { useEffect, useState, useRef } from "react";
// import proto from "../Components/socket/marketDataFeed.proto";
// import { Buffer } from "buffer";
// import { Dropdown } from "primereact/dropdown";
// import { Button } from "primereact/button";
// import { NavLink } from "react-router-dom";
// import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
// import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primeflex/primeflex.min.css";
// import "../Components/StrategyBuilder/StrategyBuilder.css";

// const protobuf = require("protobufjs");

// let protobufRoot = null;

// const getUrl = async (token) => {
//   const apiUrl = "https://api-v2.upstox.com/feed/market-data-feed/authorize";
//   const headers = {
//     "Content-type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
//   const response = await fetch(apiUrl, { method: "GET", headers });
//   if (!response.ok) {
//     throw new Error("Failed to get WebSocket URL");
//   }
//   const data = await response.json();
//   return data.data.authorizedRedirectUri;
// };

// const decodeProtobuf = (buffer) => {
//   if (!protobufRoot) {
//     console.warn("Protobuf not initialized!");
//     return null;
//   }
//   const FeedResponse = protobufRoot.lookupType(
//     "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
//   );
//   return FeedResponse.decode(buffer);
// };

// const initProtobuf = async () => {
//   protobufRoot = await protobuf.load(proto);
//   console.log("Protobuf initialization complete");
// };

// const StrategyBuilder = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [feedData, setFeedData] = useState([]);
//   const [token, setToken] = useState(null);
//   const [symbols, setSymbols] = useState([]);
//   const [selectedSymbol, setSelectedSymbol] = useState(null);
//   const [expiryList, setExpiryList] = useState([]); 
//   const [selectedExpiry, setSelectedExpiry] = useState(null);
//   const [instrumentKeys, setInstrumentKeys] = useState([]);

//   const wsRef = useRef(null); // WebSocket reference
  
//   useEffect(() => {
//     const fetchTokenAndSymbols = async () => {
//       try {
//         const tokenResponse = await fetch(
//           "https://dev.icharts.in/opt/api/RealTime/getUserDetails_RealTime.php"
//         );
//         if (!tokenResponse.ok) throw new Error("Unable to fetch token");
//         const tokenData = await tokenResponse.json();
//         if (!tokenData.access_token) {
//           window.location.href = "https://www.icharts.in/opt/broker_login.php";
//           return;
//         }
//         setToken(tokenData.access_token);

//         const symbolsResponse = await fetch(
//           "https://dev.icharts.in/opt/api/RealTime/getSymbolList.php"
//         );
//         if (!symbolsResponse.ok) throw new Error("Unable to fetch symbols");
//         const symbolsData = await symbolsResponse.json();
//         setSymbols(symbolsData);
//         if (symbolsData.length > 0) {
//           setSelectedSymbol(symbolsData[0].symbol);
//         }
//       } catch (error) {
//         console.error("Error fetching token and symbols:", error);
//         window.location.href = "https://www.icharts.in/opt/broker_login.php";
//       }
//     };
    
//     fetchTokenAndSymbols();
//   }, []);

//   useEffect(() => {
//     const fetchExpiryList = async () => {
//       if (!selectedSymbol) return;
//       try {
//         const response = await fetch(
//           `https://dev.icharts.in/opt/api/RealTime/getSymbolExpiryList.php?symbol=${encodeURIComponent(selectedSymbol)}`
//         );
//         if (!response.ok) throw new Error("Unable to fetch expiry list");
//         const expiryData = await response.json();
//         setExpiryList(expiryData);
//         setSelectedExpiry(expiryData[0]?.expiry_dates || null);
//       } catch (error) {
//         console.error("Error fetching expiry list:", error);
//       }
//     };

//     fetchExpiryList();
//   }, [selectedSymbol]);

//   useEffect(() => {
//     const fetchInstrumentKeys = async () => {
//       if (!selectedSymbol || !selectedExpiry) return;
//       try {
//         const response = await fetch(
//           `https://dev.icharts.in/opt/api/RealTime/getInstrumentKeys.php?optSymbol=${encodeURIComponent(selectedSymbol)}&optExpDateYmd=${encodeURIComponent(selectedExpiry)}`
//         );
//         if (!response.ok) throw new Error("Unable to fetch instrument keys");
//         const instrumentKeysResponse = await response.json();
//         setInstrumentKeys(instrumentKeysResponse.All_Tokens || []);
//       } catch (error) {
//         console.error("Error fetching instrument keys:", error);
//       }
//     };

//     fetchInstrumentKeys();
//   }, [selectedSymbol, selectedExpiry]);

//   useEffect(() => {
//     const setupWebSocket = async () => {
//       if (!token) return;

//       await initProtobuf();
//       const wsUrl = await getUrl(token);
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         setIsConnected(true);
//         console.log("WebSocket connected");
//         if (instrumentKeys.length > 0) {
//           subscribeToInstruments(ws, instrumentKeys);
//         }
//       };

//       ws.onmessage = async (event) => {
//         const arrayBuffer = await event.data.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const response = decodeProtobuf(buffer);
//         setFeedData((currentData) => [...currentData, JSON.stringify(response)]);
//       };

//       ws.onclose = () => {
//         setIsConnected(false);
//         console.log("WebSocket disconnected");
//       };

//       ws.onerror = (error) => {
//         console.error("WebSocket error:", error);
//         setIsConnected(false);
//       };

//       return () => ws.close();
//     };

//     setupWebSocket();
    
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, [token]);

//   // Send subscription request whenever instrumentKeys updates
//   useEffect(() => {
//     if (isConnected && instrumentKeys.length > 0 && wsRef.current) {
//       subscribeToInstruments(wsRef.current, instrumentKeys);
//     }
//   }, [isConnected, instrumentKeys]);

//   const subscribeToInstruments = (ws, instrumentKeys) => {
//     const message = {
//       guid: "someguid",
//       method: "sub",
//       data: { mode: "full", instrumentKeys: instrumentKeys },
//     };
//     ws.send(Buffer.from(JSON.stringify(message)));
//   };

//   return (
//     <div>
//       <Dropdown
//         value={selectedSymbol}
//         options={symbols.map((s) => ({ label: s.symbol, value: s.symbol }))}
//         onChange={(e) => {
//           setSelectedSymbol(e.value);
//           setSelectedExpiry(null);
//         }}
//         placeholder="Select a Symbol"
//       />
//       <div>
//         <Button onClick={() => console.log(feedData)}>Show Feed Data</Button>
//       </div>
//     </div>
//   );
// };

// export default StrategyBuilder;
// import React, { useEffect, useState, useRef } from "react";
// import proto from "../Components/socket/marketDataFeed.proto";
// import { Buffer } from "buffer";
// import { Dropdown } from "primereact/dropdown";
// import { Button } from "primereact/button";
// import { NavLink } from "react-router-dom";
// import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
// import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primeflex/primeflex.min.css";
// import "../Components/StrategyBuilder/StrategyBuilder.css";

// const protobuf = require("protobufjs");

// let protobufRoot = null;

// const getUrl = async (token) => {
//   const apiUrl = "https://api-v2.upstox.com/feed/market-data-feed/authorize";
//   const headers = {
//     "Content-type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
//   const response = await fetch(apiUrl, { method: "GET", headers });
//   if (!response.ok) {
//     throw new Error("Failed to get WebSocket URL");
//   }
//   const data = await response.json();
//   return data.data.authorizedRedirectUri;
// };

// const decodeProtobuf = (buffer) => {
//   if (!protobufRoot) {
//     console.warn("Protobuf not initialized!");
//     return null;
//   }
//   const FeedResponse = protobufRoot.lookupType(
//     "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
//   );
//   return FeedResponse.decode(buffer);
// };

// const initProtobuf = async () => {
//   protobufRoot = await protobuf.load(proto);
//   console.log("Protobuf initialization complete");
// };

// const StrategyBuilder = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [feedData, setFeedData] = useState([]);
//   const [token, setToken] = useState(null);
//   const [symbols, setSymbols] = useState([]);
//   const [selectedSymbol, setSelectedSymbol] = useState(null);
//   const [expiryList, setExpiryList] = useState([]); 
//   const [selectedExpiry, setSelectedExpiry] = useState(null);
//   const [instrumentKeys, setInstrumentKeys] = useState([]);

//   const wsRef = useRef(null); // WebSocket reference
  
//   useEffect(() => {
//     const fetchTokenAndSymbols = async () => {
//       try {
//         const tokenResponse = await fetch(
//           "https://dev.icharts.in/opt/api/RealTime/getUserDetails_RealTime.php"
//         );
//         if (!tokenResponse.ok) throw new Error("Unable to fetch token");
//         const tokenData = await tokenResponse.json();
//         if (!tokenData.access_token) {
//           window.location.href = "https://www.icharts.in/opt/broker_login.php";
//           return;
//         }
//         setToken(tokenData.access_token);

//         const symbolsResponse = await fetch(
//           "https://dev.icharts.in/opt/api/RealTime/getSymbolList.php"
//         );
//         if (!symbolsResponse.ok) throw new Error("Unable to fetch symbols");
//         const symbolsData = await symbolsResponse.json();
//         setSymbols(symbolsData);
//         if (symbolsData.length > 0) {
//           setSelectedSymbol(symbolsData[0].symbol);
//         }
//       } catch (error) {
//         console.error("Error fetching token and symbols:", error);
//         window.location.href = "https://www.icharts.in/opt/broker_login.php";
//       }
//     };
    
//     fetchTokenAndSymbols();
//   }, []);

//   useEffect(() => {
//     const fetchExpiryList = async () => {
//       if (!selectedSymbol) return;
//       try {
//         const response = await fetch(
//           `https://dev.icharts.in/opt/api/RealTime/getSymbolExpiryList.php?symbol=${encodeURIComponent(selectedSymbol)}`
//         );
//         if (!response.ok) throw new Error("Unable to fetch expiry list");
//         const expiryData = await response.json();
//         setExpiryList(expiryData);
//         setSelectedExpiry(expiryData[0]?.expiry_dates || null);
//       } catch (error) {
//         console.error("Error fetching expiry list:", error);
//       }
//     };

//     fetchExpiryList();
//   }, [selectedSymbol]);

//   useEffect(() => {
//     const fetchInstrumentKeys = async () => {
//       if (!selectedSymbol || !selectedExpiry) return;
//       try {
//         const response = await fetch(
//           `https://dev.icharts.in/opt/api/RealTime/getInstrumentKeys.php?optSymbol=${encodeURIComponent(selectedSymbol)}&optExpDateYmd=${encodeURIComponent(selectedExpiry)}`
//         );
//         if (!response.ok) throw new Error("Unable to fetch instrument keys");
//         const instrumentKeysResponse = await response.json();
//         setInstrumentKeys(instrumentKeysResponse.All_Tokens || []);
//       } catch (error) {
//         console.error("Error fetching instrument keys:", error);
//       }
//     };

//     fetchInstrumentKeys();
//   }, [selectedSymbol, selectedExpiry]);

//   useEffect(() => {
//     const setupWebSocket = async () => {
//       if (!token) return;

//       await initProtobuf();
//       const wsUrl = await getUrl(token);
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         setIsConnected(true);
//         console.log("WebSocket connected");
//         if (instrumentKeys.length > 0) {
//           subscribeToInstruments(ws, instrumentKeys);
//         }
//       };

//       ws.onmessage = async (event) => {
//         const arrayBuffer = await event.data.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const response = decodeProtobuf(buffer);
//         setFeedData((currentData) => [...currentData, JSON.stringify(response)]);
//       };

//       ws.onclose = () => {
//         setIsConnected(false);
//         console.log("WebSocket disconnected");
//       };

//       ws.onerror = (error) => {
//         console.error("WebSocket error:", error);
//         setIsConnected(false);
//       };

//       return () => ws.close();
//     };

//     setupWebSocket();
    
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, [token]);

//   // Send subscription request whenever instrumentKeys updates
//   useEffect(() => {
//     if (isConnected && instrumentKeys.length > 0 && wsRef.current) {
//       subscribeToInstruments(wsRef.current, instrumentKeys);
//     }
//   }, [isConnected, instrumentKeys]);

//   const subscribeToInstruments = (ws, instrumentKeys) => {
//     const message = {
//       guid: "someguid",
//       method: "sub",
//       data: { mode: "full", instrumentKeys: instrumentKeys },
//     };
//     ws.send(Buffer.from(JSON.stringify(message)));
//   };

//   return (
//     <div>
//       <Dropdown
//         value={selectedSymbol}
//         options={symbols.map((s) => ({ label: s.symbol, value: s.symbol }))}
//         onChange={(e) => {
//           setSelectedSymbol(e.value);
//           setSelectedExpiry(null);
//         }}
//         placeholder="Select a Symbol"
//       />
//       <div>
//         <Button onClick={() => console.log(feedData)}>Show Feed Data</Button>
//       </div>
//     </div>
//   );
// };

// export default StrategyBuilder;
