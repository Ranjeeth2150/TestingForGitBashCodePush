import React, { useRef,useEffect, useState } from "react";
import proto from "../Components/socket/marketDataFeed.proto";
import { Buffer } from "buffer";
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import { NavLink } from "react-router-dom";
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.min.css';
import '../Main.css';
import '../Components/StrategyBuilder/StrategyBuilder.css';
import OptionChainComponent from '../Components/StrategyBuilder/OptionChainComponent';
import PLComputeCompoenent from '../Components/StrategyBuilder/PLComputeCompoenent';
import PayoffChartComponent from '../Components/StrategyBuilder/PayoffChartComponent';
import {LegEntity} from '../entity/LegEntity';

const protobuf = require("protobufjs");

let protobufRoot = null;



const getUrl = async (token) => {
  const apiUrl = "https://api-v2.upstox.com/feed/market-data-feed/authorize";
  const headers = {
    "Content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await fetch(apiUrl, { method: "GET", headers });
  if (!response.ok) {
    throw new Error("Failed to get WebSocket URL");
  }
  const data = await response.json();
  return data.data.authorizedRedirectUri;
};

const blobToArrayBuffer = async (blob) => {
  if ("arrayBuffer" in blob) return await blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

const decodeProtobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }
  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};
const initProtobuf = async () => {
  protobufRoot = await protobuf.load(proto);
  console.log("Protobuf initialization complete");
};


const StrategyBuilder = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [token, setToken] = useState(null);
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [expiryLisetExpiryListst, setExpiryList] = useState([]);  // Store the expiry list
  const [selectedExpiry, setSelectedExpiry] = useState(null);
  const [instrumentKeys,setInstrumentKeys] = useState([]);
  const [SpotToken,setSpotToken] = useState([]);
  const [Strikes, setStrikes] = useState([]);
  const [ceTokens, setCeTokens] = useState([]);
  const [peTokens, setPeTokens] = useState([]);
  const [spotPrice , setSpotPrice] = useState([]);
  const [futureToken, setFutureToken] = useState([]);
  const [legEntityList, setlegEntityList] = useState([]); 
  const wsRef = useRef(null); // WebSocket reference
  
  const getLabels = (data) => {
    return data.map((item) => ({ label: item.symbol, value: item.symbol }));
  };

  const categorizedOptions = [
    { label: "Indices", items: getLabels(symbols.filter((s) => s.symbol_group === "Indices")) },
    { label: "BSE", items: getLabels(symbols.filter((s) => s.symbol_group === "BSE")) },
    { label: "Stocks", items: getLabels(symbols.filter((s) => s.symbol_group === "Stocks")) },
    { label: "Commodities", items: getLabels(symbols.filter((s) => s.symbol_group === "Commodities")) },
  ];

  useEffect(() => {

if(feedData[0] !== undefined){
  if(feedData[0].feeds[SpotToken] !== undefined){
    // console.log(feedData[0].feeds[SpotToken])
    setSpotPrice(feedData[0].feeds[SpotToken]?.ff?.indexFF?.ltpc?.ltp.toFixed(2));
  }

  if(feedData[0].feeds[futureToken] !== undefined){
    console.log(feedData[0].feeds[futureToken])
    setFutureToken(feedData[0].feeds[futureToken]?.ff?.indexFF?.ltpc?.ltp.toFixed(2));
  }
  
}
},[SpotToken,futureToken, feedData])

   useEffect(() => {
     const fetchTokenAndSymbols = async () => {
      
       try {
         const tokenResponse = await fetch(
           "https://dev.icharts.in/opt/api/RealTime/getUserDetails_RealTime.php"
         );
         if (!tokenResponse.ok) throw new Error("Unable to fetch token");
         const tokenData = await tokenResponse.json();
         if (!tokenData.access_token) {
           window.location.href = "https://www.icharts.in/opt/broker_login.php";
           return;
         }
         setToken(tokenData.access_token);
 
         const symbolsResponse = await fetch(
           "https://dev.icharts.in/opt/api/RealTime/getSymbolList.php"
         );
         if (!symbolsResponse.ok) throw new Error("Unable to fetch symbols");
         const symbolsData = await symbolsResponse.json();
         setSymbols(symbolsData);
         if (symbolsData.length > 0) {
           setSelectedSymbol(symbolsData[0].symbol);
         }
       } catch (error) {
         console.error("Error fetching token and symbols:", error);
         window.location.href = "https://www.icharts.in/opt/broker_login.php";
       }
     };
     
     fetchTokenAndSymbols();
   }, []);
 
   useEffect(() => {
     const fetchExpiryList = async () => {
       if (!selectedSymbol) return;
       try {
         const response = await fetch(
           `https://dev.icharts.in/opt/api/RealTime/getSymbolExpiryList.php?symbol=${encodeURIComponent(selectedSymbol)}`
         );
         if (!response.ok) throw new Error("Unable to fetch expiry list");
         const expiryData = await response.json();
         setExpiryList(expiryData);
         setSelectedExpiry(expiryData[0]?.expiry_dates || null);
       } catch (error) {
         console.error("Error fetching expiry list:", error);
       }
     };
 
     fetchExpiryList();
   }, [selectedSymbol]);
 
   useEffect(() => {
     const fetchInstrumentKeys = async () => {
       if (!selectedSymbol || !selectedExpiry) return;

       let selectedSymbolType = symbols.find((s) => s.symbol === selectedSymbol).symbol_group;
      if(selectedSymbolType === 'BSE') {
        selectedSymbolType = 'BSE';
      }else if(selectedSymbolType === 'Commodities') {
        selectedSymbolType = 'MCX';
      }
      else{
        selectedSymbolType = 'FNO';
      }
       try {
         const response = await fetch(
           `https://dev.icharts.in/opt/api/RealTime/getInstrumentKeys.php?optSymbol=${encodeURIComponent(selectedSymbol)}&optExpDateYmd=${encodeURIComponent(selectedExpiry)}&SymbType=${encodeURIComponent(selectedSymbolType)}`
         );
         if (!response.ok) throw new Error("Unable to fetch instrument keys");
         const instrumentKeysResponse = await response.json();
         
         setInstrumentKeys(instrumentKeysResponse.All_Tokens || []);
         setStrikes(instrumentKeysResponse.formattedStrikes || []); 
         setCeTokens(instrumentKeysResponse.CE_Tokens || []);
         setPeTokens(instrumentKeysResponse.PE_Tokens || []); 
         setSpotToken (instrumentKeysResponse.SpotToken_upstox || null);
         setFutureToken(instrumentKeysResponse.FutureToken||null)
        // console.log(instrumentKeysResponse)
         
         
       } catch (error) {
         console.error("Error fetching instrument keys:", error);
       }
     };
 
     fetchInstrumentKeys();
   }, [selectedSymbol, selectedExpiry]);
 
   useEffect(() => {
     const setupWebSocket = async () => {
       if (!token) return;
 
       await initProtobuf();
       const wsUrl = await getUrl(token);
       const ws = new WebSocket(wsUrl);
       wsRef.current = ws;
 
       ws.onopen = () => {
         setIsConnected(true);
         console.log("WebSocket connected");
         if (instrumentKeys.length > 0) {
           subscribeToInstruments(ws, instrumentKeys);
         }
       };
 
       ws.onmessage = async (event) => {
         const arrayBuffer = await event.data.arrayBuffer();
         const buffer = Buffer.from(arrayBuffer);
         const response = decodeProtobuf(buffer);
          // console.log(response)
         setFeedData([response]);
       
        
       };
 
       ws.onclose = () => {
         setIsConnected(false);
         console.log("WebSocket disconnected");
       };
 
       ws.onerror = (error) => {
         console.error("WebSocket error:", error);
         setIsConnected(false);
       };
 
       return () => ws.close();
     };
 
     setupWebSocket();
     
     
     return () => {
       if (wsRef.current) {
         wsRef.current.close();
       }
     };
     
   }, [token]);
 
   // Send subscription request whenever instrumentKeys updates
   useEffect(() => {
    
     if (isConnected && instrumentKeys.length > 0 && wsRef.current) {
       subscribeToInstruments(wsRef.current, instrumentKeys);
     }
   }, [isConnected, instrumentKeys]);
 
   const subscribeToInstruments = (ws, instrumentKeys) => {
     const message = {
       guid: "someguid",
       method: "sub",
       data: { mode: "full", instrumentKeys: instrumentKeys },
     };
     ws.send(Buffer.from(JSON.stringify(message)));
     
   };

   const handleLTPClick = (rowData, buysellBtn, cepeType) => {
    // Create a new instance of LegEntity
    let legEntity = new LegEntity();
  
    // Function to set common LegEntity properties
    const setLegEntityProperties = (type, price, iv, theta, delta) => {
      legEntity.Strike_Price = rowData.Strike;
      legEntity.CE_PE = type;
      legEntity.Position_Lot = 1;
      legEntity.Buy_Sell = buysellBtn;
      legEntity.Option_Price = price;
      legEntity.IV = iv;
      legEntity.exited = false;
      legEntity.Current_PL = 0;
      legEntity.Entry_Price = price;
      legEntity.Exit_Price = 0;
      legEntity.Expiry = selectedExpiry;
      legEntity.Symbol = selectedSymbol;
      legEntity.Date = new Date();
      legEntity.theta = theta;
      legEntity.delta = delta;
      legEntity.legId = null;
      legEntity.rowID = rowData.id;
    };
  

      if (cepeType === 'call') {
        setLegEntityProperties('call', rowData.CallLTP, rowData.CallIV, rowData.CallTheta, rowData.CallDelta);
      } else {
        setLegEntityProperties('put', rowData.PutLTP, rowData.PutIV, rowData.PutTheta, rowData.PutDelta);
      }
      
    // Add the new legEntity to the list
    setlegEntityList((prevLegs) => [...prevLegs, legEntity]);
  };
  

  
   
  return (
    <div className="grid p-fluid">
    <div>
      {/* {this.state.isBusy ? <CircleSpinnerOverlay loading={true} overlayColor="rgba(0,153,255,0.2)" /> : null} */}
    </div>
    {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}> */}
    <div className='shadow-r width-46'>
        <div className="Card-ui">
        <div className="flex-in-tab">
                <div className="right-side-part" style={{ justifyContent: 'left' }}>
                  <div className="side-part">
                    <div className="right-side">
                      <div className="symbol-dropdown">
                <Dropdown
                  style={{ width: '170px', padding: '4px !important' }}
                  value={selectedSymbol}
                  options={categorizedOptions}
                  optionLabel="label"
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                  filter
                  onChange={(e) => {
                    setSelectedSymbol(e.value);
                    setSelectedExpiry(null); // Reset selected expiry when symbol changes
                  }}
                
                  placeholder="Select a Symbol"
                />
              </div>
              <div className="btn-buy">
                <Button className='smallButton' onClick={() => { }}>Save</Button>
                <Button className='smallButton' onClick={() => { }}>Load</Button>
                <Button className='smallButton' onClick={() => { }}>Reset</Button>
                <NavLink to="/" target="_blank" style={{ textDecoration: 'none' }}>
                  <Button className="p-button p-component select-column portfoliotrades" title="To open in new tab">New</Button>
                </NavLink>
                <NavLink className="PortfolioTrades" to="/PortfolioTrades" target='_blank'>
                  <Button className="p-button p-component select-column portfoliotrades" title='Portfolio Trades'>
                    <AutoAwesomeMotionIcon />
                  </Button>
                </NavLink>
              </div>
            </div>
            </div>
            
          </div>
         <div className='line-ui hide-in-web'></div></div>
          {/* <div className="flex-in-tab">
          <div className='left-side-part-lower'> */}
              
          <OptionChainComponent         
          selectedSymbol={selectedSymbol}
        selectedExpiry={selectedExpiry}
        instrumentKeys={instrumentKeys}
        Strikes={Strikes}
        // ceTokens={ceTokens}
        // peTokens={peTokens}
        feedData={feedData}
        SpotToken = {SpotToken}
        expiryLisetExpiryListst ={expiryLisetExpiryListst}
        setSelectedExpiry
        onLTPClick={handleLTPClick}

/>
       

            </div>
            </div>
        {/* </div>
      </div> */}
        <div className='pad width-54'>
        
        <div className="symbol-details below-stocks">
       
        <div className="flex-item"><strong>Future Price:</strong> {spotPrice}</div>
        
        
      </div>
      <div hidden={legEntityList.length == 0}>
               <div>
               <PLComputeCompoenent legEntityList={legEntityList} />
                </div>


                <div>
               <PayoffChartComponent legEntityList={legEntityList} />
                </div>
              </div>


      </div>
    </div>
   
  );
};

export default StrategyBuilder;