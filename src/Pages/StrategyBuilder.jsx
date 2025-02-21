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
import LegComponent from "../Components/StrategyBuilder/LegComponent";
import { PLCalc } from "../utils/PLCalc";
import {setupWebSocket} from '../services/websocketService';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Utility } from '../../src/utils/Utility'; // Importing the named export

const protobuf = require("protobufjs");

let protobufRoot = null;
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

// const blobToArrayBuffer = async (blob) => {
//   if ("arrayBuffer" in blob) return await blob.arrayBuffer();
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsArrayBuffer(blob);
//   });
// };

// const decodeProtobuf = (buffer) => {
//   if (!protobufRoot) {
//     console.warn("Protobuf part not initialized yet!");
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


const StrategyBuilder = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [token, setToken] = useState(null);
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [expiryList, setExpiryList] = useState([]);  // Store the expiry list
  const [selectedExpiry, setSelectedExpiry] = useState(null);
  const [instrumentKeys,setInstrumentKeys] = useState([]);
  const [SpotToken,setSpotToken] = useState([]);
  const [Strikes, setStrikes] = useState([]);
  const [ceTokens, setCeTokens] = useState([]);
  const [peTokens, setPeTokens] = useState([]);
  const [spotPrice , setSpotPrice] = useState([]);
  const [futuresPrice , setFuturesPrice] = useState([]);
  const [futureToken, setFutureToken] = useState([]);
  const [legEntityList, setlegEntityList] = useState([]); 
  const [payoffchartdata, setPayoffchartdata] = useState([]); 
  const [categoryOptionsList, setCategoryOptionsList] = useState([]); 
  const [selectedSymbolType,setSelectedSymbolType] = useState([]);
  const [avgIV,setAvgIV] = useState([]);
  const [dealDate, setDealDate] = useState([]);
  const [whatif, setWhatIf] = useState(null);


   const [tableData, setTableData] = useState([]);
      const [lastUpdate, setLastUpdate] = useState('');
      const [closestStrike, setClosestStrike] = useState(null);  // To store the closest strike price
      // const [expiryList, setExpiryList] = useState(null);
      const tableRef = useRef(null);  // Reference for the DataTable
      const [hoveredRow, setHoveredRow] = useState(null); // State to track hovered row
     
  const wsRef = useRef(null); // WebSocket reference
  
  const getLabels = (data) => {
    return data.map((item) => ({ label: item.symbol, value: item.symbol}));
  };

  const categorizedOptions = [
    { label: "Indices", items: getLabels(symbols.filter((s) => s.symbol_group === "Indices")) , opt_symbol_type:'OPTIDX' , exc:'NFO'},
    { label: "BSE", items: getLabels(symbols.filter((s) => s.symbol_group === "BSE")), opt_symbol_type:'BSXOPT', exc:'BFO' },
    { label: "Stocks", items: getLabels(symbols.filter((s) => s.symbol_group === "Stocks")) , opt_symbol_type:'OPTSTK', exc:'NFO'  },
    { label: "Commodities", items: getLabels(symbols.filter((s) => s.symbol_group === "Commodities")), opt_symbol_type:'OPTCOMM' , exc:'MCX'  },
  ];
  

  useEffect(() => {

if(feedData[0] !== undefined){
  if(feedData[0].feeds[SpotToken] !== undefined){
    // console.log(feedData[0])
    setSpotPrice(feedData[0].feeds[SpotToken]?.ff?.indexFF?.ltpc?.ltp.toFixed(2));
  }

  if(feedData[0].feeds[futureToken] !== undefined){
    // console.log(feedData[0].feeds[futureToken]?.ff?.marketFF?.ltpc?.ltp || 0)
    // setFutureToken(feedData[0].feeds[futureToken]?.ff?.indexFF?.ltpc?.ltp.toFixed(2));
    setFuturesPrice(feedData[0].feeds[futureToken]?.ff?.marketFF?.ltpc?.ltp || 0);
  }

  // console.log(feedData[0])
  
}
// },[SpotToken,futureToken, feedData]);
},[feedData]);



// useEffect(() => {
//   // let chartData = PLCalc.chartData(legEntityList);
//   // setPayoffchartdata(legEntityList)
// },[legEntityList]);

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
    //  console.log(categorizedOptions)
    
 
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
        selectedSymbolType = 'NFO';
      }
      let symbType = PLCalc.symbType_v2(categorizedOptions, selectedSymbol);

// console.log(symbType)
// console.log(selectedSymbol)
      
      setSelectedSymbolType(symbType);
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

     setCategoryOptionsList(categorizedOptions);

    //  console.log(categoryOptionsList)
  //  }, [selectedSymbol, selectedExpiry]);
  }, [selectedExpiry]);
 
  //  useEffect(() => {
  //    const setupWebSocket = async () => {
  //      if (!token) return;
 
  //      await initProtobuf();
  //      const wsUrl = await getUrl(token);
  //      const ws = new WebSocket(wsUrl);
  //      wsRef.current = ws;
 
  //      ws.onopen = () => {
  //        setIsConnected(true);
  //        console.log("WebSocket connected");
  //        if (instrumentKeys.length > 0) {
  //          subscribeToInstruments(ws, instrumentKeys);
  //        }
  //      };
 
  //      ws.onmessage = async (event) => {
  //        const arrayBuffer = await event.data.arrayBuffer();
  //        const buffer = Buffer.from(arrayBuffer);
  //        const response = decodeProtobuf(buffer);
  //         // console.log(response)
  //        setFeedData([response]);
       
        
  //      };
 
  //      ws.onclose = () => {
  //        setIsConnected(false);
  //        console.log("WebSocket disconnected");
  //      };
 
  //      ws.onerror = (error) => {
  //        console.error("WebSocket error:", error);
  //        setIsConnected(false);
  //      };
 
  //      return () => ws.close();
  //    };
 
  //    setupWebSocket();
     
     
  //    return () => {
  //      if (wsRef.current) {
  //        wsRef.current.close();
  //      }
  //    };
     
  //  }, [token]);



  useEffect(() => {
    if (!token) return;
    const connectWebSocket = async () => {
      wsRef.current = await setupWebSocket(token, instrumentKeys, setIsConnected, setFeedData);
    };
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [instrumentKeys]);
 
   // Send subscription request whenever instrumentKeys updates
   useEffect(() => {
    
     if (isConnected && instrumentKeys.length > 0 && wsRef.current) {
       subscribeToInstruments(wsRef.current, instrumentKeys);
     }
   }, [isConnected]);



   useEffect(() => {
  //  console.log("yes")
    const chartData = PLCalc.chartData({
      legEntityList,
      spotPrice,
      futureToken,
      ceTokens,
      peTokens,
      selectedSymbol,
      selectedExpiry,
      avgIV,
      instrumentKeys,
      dealDate,
      whatif 
    });
    // console.log(chartData)
  
    setPayoffchartdata(chartData);
  }, [legEntityList]);
  
 
   const subscribeToInstruments = (ws, instrumentKeys) => {
     const message = {
       guid: "someguid",
       method: "sub",
       data: { mode: "full", instrumentKeys: instrumentKeys },
     };
     ws.send(Buffer.from(JSON.stringify(message)));
     
   };

   const onLTPClick = (rowData, buysellBtn, cepeType) => {
    // Create a new instance of LegEntity
    let legEntity = new LegEntity();
    // Function to set common LegEntity properties
    const setLegEntityProperties = (type, price, iv, theta, delta, gamma, vega) => {
      legEntity.Strike_Price = rowData.Strike;
      legEntity.CE_PE = type;
      legEntity.enable = true;
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
      legEntity.gamma = gamma,
      legEntity.vega = vega;
      legEntity.lot_size = 75;
      legEntity.fairPrice = spotPrice;
      legEntity.FuturesPrice = futuresPrice;
      // legEntity.whatif=null;
    };

  

      if (cepeType === 'ce') {
        setLegEntityProperties('ce', rowData.CallLTP, rowData.CallIV, rowData.CallTheta, rowData.CallDelta, rowData.CallGamma, rowData.CallVega);
      } else {
        setLegEntityProperties('pe', rowData.PutLTP, rowData.PutIV, rowData.PutTheta, rowData.PutDelta, rowData.PutGamma, rowData.PutVega);
      }
      
    
     // Add the new legEntity to the list
     setlegEntityList((prevLegs) => {
      const updatedLegs = [...prevLegs, legEntity];
      
      // Once a new leg is added, compute the payoff chart data
      // const computedData = computePayoffData(updatedLegs);
      const computedData =updatedLegs;;
      // console.log(computedData)
      // setPayoffchartdata(computedData);  // Set the computed payoff data
      
      return updatedLegs;
    });
  };
  
  const onLegUpdate = (updatedLegs) => {
    // Logic to update state or perform any necessary actions with the updated legs
    if(updatedLegs.length> 0)
      {
        // console.log('Updated Legs:', updatedLegs);
        // console.log(updatedLegs)
        // let chartData = PLCalc.chartData(updatedLegs)
        setlegEntityList(updatedLegs)
  }
    
    
};






 useEffect(() => {
        if (instrumentKeys.length > 0) {
            setTableData([]); // Clear table data only if necessary

            
        }
            
    }, [instrumentKeys]);


    
    useEffect(() => {
        const util = new Utility();  
        
        if (feedData.length === 0) return;
        
        let spotPrice = feedData[0].feeds[SpotToken]?.ff?.indexFF?.ltpc?.ltp.toFixed(2);
        let spotTime = feedData[0].feeds[SpotToken]?.ff?.indexFF?.ltpc?.ltt;
        
        if (spotTime !== undefined) {
            setLastUpdate(Utility.formatTimestamp(spotTime));  
            setDealDate(Utility.formatTimestamp(spotTime));
        }
    
        // Set the closest strike price based on the spot price
        let closest = null;
        let minDiff = Infinity;
        Object.keys(Strikes).forEach(key => {
            const strikePrice = parseFloat(key.replace('.0000', ''));
            const diff = Math.abs(parseFloat(spotPrice) - strikePrice);
            if (diff <= minDiff) {
                minDiff = diff;
                closest = strikePrice;
            }
        });
    
        if (closest !== null) {
            setClosestStrike(closest);
        }
    
        setTableData(prevData => {
            let updatedData = [...prevData]; // Preserve previous data
    
            Object.keys(Strikes).forEach((key, index) => {
                const ceToken = Strikes[key].ceTokens;
                const peToken = Strikes[key].peTokens;
    
                const ceFeed = feedData[0].feeds[ceToken];
                const peFeed = feedData[0].feeds[peToken];
    
                if (!ceFeed || !peFeed) return;
    
                const ceLTP = ceFeed?.ff?.marketFF?.ltpc?.ltp || 0;
                const peLTP = peFeed?.ff?.marketFF?.ltpc?.ltp || 0;
    
                const ceOI = ceFeed?.ff?.marketFF?.eFeedDetails?.oi || 0;
                const peOI = peFeed?.ff?.marketFF?.eFeedDetails?.oi || 0;
    
                const cePoi = ceFeed?.ff?.marketFF?.eFeedDetails?.poi || 0;
                const pePoi = peFeed?.ff?.marketFF?.eFeedDetails?.poi || 0;
    
                const ceOIChg = ceOI - cePoi;
                const peOIChg = peOI - pePoi;
    
                const ceIV = ceFeed?.ff?.marketFF.optionGreeks.iv || 0;
                const peIV = peFeed?.ff?.marketFF.optionGreeks.iv || 0;
    
                const ceDelta = ceFeed?.ff?.marketFF.optionGreeks.delta || 0;
                const peDelta = peFeed?.ff?.marketFF.optionGreeks.delta || 0;
    
                const ceTheta = ceFeed?.ff?.marketFF.optionGreeks.theta || 0;
                const peTheta = peFeed?.ff?.marketFF.optionGreeks.theta || 0;
    
                const ceGamma = ceFeed?.ff?.marketFF.optionGreeks.gamma || 0;
                const peGamma = peFeed?.ff?.marketFF.optionGreeks.gamma || 0;
    
                const ceVega = ceFeed?.ff?.marketFF.optionGreeks.vega || 0;
                const peVega = peFeed?.ff?.marketFF.optionGreeks.vega || 0;

                const strikeExists = legEntityList.some(leg => leg.Strike_Price === key.replace('.0000', ''));
                // console.log(closest)
                 // Update average IV only for the closest strike
                if (closestStrike !== null && closestStrike == parseFloat(key)) {
                    let averageIV = (((ceIV + peIV) / 2) * 100).toFixed(2);
                    setAvgIV(averageIV);
                }
    
                // Ensure you're creating a new `legEntityList` to trigger re-render
                if (legEntityList.length > 0) { 
                    // console.log(strikeExists)
                    if(strikeExists){
                       
   
                         const updatedLegs = legEntityList.map(leg => {
                        // console.log("leg.Strike_Price", leg.Strike_Price === key.replace('.0000', ''),key.replace('.0000', ''),leg.Strike_Price);
                        if (leg.Strike_Price === key.replace('.0000', '') && leg.CE_PE === 'ce') {
                            // console.log("Updating:", leg.Strike_Price, "with", ceLTP);
                            return { ...leg, 
                                Option_Price: ceLTP,
                                IV:((ceIV * 100).toFixed(2)) ,
                                theta:ceTheta,
                                delta:ceDelta,
                                gamma:ceGamma,
                                vega:ceVega,
                                FuturesPrice: futuresPrice !== undefined ? futuresPrice : leg.FuturesPrice, // Retain previous value if undefined
                    fairPrice: spotPrice !== undefined ? spotPrice : leg.fairPrice // Retain previous value if undefined

                             };
                        }

                        if (leg.Strike_Price === key.replace('.0000', '') && leg.CE_PE === 'pe') {
                            // console.log("Updating:", leg.Strike_Price, "with", peLTP);
                            return { ...leg, 
                                Option_Price: peLTP,
                                IV:((peIV * 100).toFixed(2)) ,
                                theta:peTheta,
                                delta:peDelta,
                                gamma:peGamma,
                                vega:peVega,
                                FuturesPrice: futuresPrice !== undefined ? futuresPrice : leg.FuturesPrice, // Retain previous value if undefined
                    fairPrice: spotPrice !== undefined ? spotPrice : leg.fairPrice // Retain previous value if undefined
                             };
                        }
                        return leg;
                    });

                    onLegUpdate(updatedLegs);
                    // console.log("updatedLegs", updatedLegs);
                

                    }
                    // const updatedLegs = legEntityList.map(leg => {
                    //     // console.log("leg.Strike_Price", leg.Strike_Price === key.replace('.0000', ''),key.replace('.0000', ''),leg.Strike_Price);
                    //     if (leg.Strike_Price === key.replace('.0000', '') && leg.CE_PE === 'call') {
                    //         console.log("Updating:", leg.Strike_Price, "with", ceLTP);
                    //         return { ...leg, Option_Price: ceLTP };
                    //     }

                    //     if (leg.Strike_Price === key.replace('.0000', '') && leg.CE_PE === 'put') {
                    //         console.log("Updating:", leg.Strike_Price, "with", peLTP);
                    //         return { ...leg, Option_Price: peLTP };
                    //     }
                    //     return leg;
                    // });
                
                
                    // console.log("updatedLegs", updatedLegs);
                
                    // Call onLegUpdate with the updated legs
                    // onLegUpdate(updatedLegs);
                }
                
                else{
                    onLegUpdate('');
                }
    
                const existingRowIndex = updatedData.findIndex(row => row.Strike === key.replace('.0000', ''));
                if (existingRowIndex !== -1) {
                    updatedData[existingRowIndex] = {
                        ...updatedData[existingRowIndex],
                        id: existingRowIndex, // Set the id to the row index
                        CallVega: ceVega !== 0 ? ceVega : updatedData[existingRowIndex].CallVega,
                        CallGamma: ceGamma !== 0 ? ceGamma : updatedData[existingRowIndex].CallGamma,
                        CallTheta: ceTheta !== 0 ? ceTheta : updatedData[existingRowIndex].CallTheta,
                        CallDelta: ceDelta !== 0 ? ceDelta : updatedData[existingRowIndex].CallDelta,  
                        CallIV: ceIV !== 0 ? ((ceIV * 100).toFixed(2)) : updatedData[existingRowIndex].CallIV,  
                        CallOIChg: ceOIChg !== 0 ? ceOIChg : updatedData[existingRowIndex].CallOIChg,    
                        CallOI: ceOI !== 0 ? ceOI : updatedData[existingRowIndex].CallOI,   
                        CallLTP: ceLTP !== 0 ? ceLTP : updatedData[existingRowIndex].CallLTP,
                        PutLTP: peLTP !== 0 ? peLTP : updatedData[existingRowIndex].PutLTP,  
                        PutOI: peOI !== 0 ? peOI : updatedData[existingRowIndex].PutOI,
                        PutOIChg: peOIChg !== 0 ? peOIChg : updatedData[existingRowIndex].PutOIChg,  
                        PutIV: peIV !== 0 ? ((peIV * 100).toFixed(2)) : updatedData[existingRowIndex].PutIV,  
                        PutDelta: peDelta !== 0 ? peDelta : updatedData[existingRowIndex].PutDelta,  
                        PutTheta: peTheta !== 0 ? peTheta : updatedData[existingRowIndex].PutTheta,
                        PutGamma: peGamma !== 0 ? peGamma : updatedData[existingRowIndex].PutGamma,
                        PutVega: peVega !== 0 ? peVega : updatedData[existingRowIndex].PutVega,
                    };
                } else {
                    updatedData.push({
                        id: index, // Use index as a unique ID
                        Strike: key.replace('.0000', ''),
                        CallGamma: ceGamma !== 0 ? ceGamma : 0, 
                        CallTheta: ceTheta !== 0 ? ceTheta : 0,
                        CallDelta: ceDelta !== 0 ? ceDelta : 0,
                        CallIV: ceIV !== 0 ? ((ceIV * 100).toFixed(2)) : 0,
                        CallOIChg: ceOIChg, 
                        CallOI: ceOI,
                        CallLTP: ceLTP,
                        PutLTP: peLTP,
                        PutOI: peOI,
                        PutOIChg: peOIChg,
                        PutIV: peIV !== 0 ? ((peIV * 100).toFixed(2)) : 0,
                        PutDelta: peDelta !== 0 ? peDelta : 0,
                        PutTheta: peTheta !== 0 ? peTheta : 0,
                        PutGamma: peGamma !== 0 ? peGamma : 0, 
                    });
                }
            });
    
            return updatedData;
        });
    // }, [feedData, Strikes, SpotToken, legEntityList, onLegUpdate]);
  }, [feedData,  onLegUpdate]);
    
    
    
 
    useEffect(() => {
        let tableWrapper = document.querySelector('.optionList .p-datatable-wrapper');
        let tbody = document.querySelector('.optionList .p-datatable-wrapper .p-datatable-table .p-datatable-tbody');
        if(tbody === null) return;
        // console.log(tbody)
        if (tbody && tableWrapper) {
            let trs = tbody.querySelectorAll('tr');
            let len = trs.length;
            
            // Scroll vertically to the closestStrike row
            if (len > 40) {
                for (let i = 0; i < len; i++) {
                    if (trs[i].innerHTML.includes(closestStrike)) {
                        let scrollRowIndex = Math.max(i - 6, 0); // Prevent negative index
                        if (trs[scrollRowIndex]) {
                            trs[scrollRowIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        break;
                    }
                }
            }
    
            // Scroll horizontally to the middle column
            let ths = document.querySelectorAll('.optionList .p-datatable-table thead th');
            let middleIndex = Math.floor(ths.length / 2);
            let middleColumn = ths[middleIndex];
    // console.log(closestStrike)
            if (middleColumn) {
                tableWrapper.scrollLeft = middleColumn.offsetLeft - tableWrapper.clientWidth / 2 + middleColumn.clientWidth / 2;
            }
        }
    
        // Reset window scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [instrumentKeys, closestStrike]);
    


     // Custom body template for CallLTP column
     // Custom body template for CallLTP column
    const callLTPTemplate = (rowData, row) => {
        const isHovered = hoveredRow === rowData.Strike; // Check if the current row is hovered

        return (
            <div
                style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                onMouseEnter={() => setHoveredRow(rowData.Strike)} // Set hovered row on mouse enter
                onMouseLeave={() => setHoveredRow(null)} // Clear hovered row on mouse leave
            >
                {isHovered && (
                    <div style={{  position: 'absolute',  display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center'  }}>
                        <button
                            className='smallGreenButton mr-1 boldText'
                            // style={{ marginTop: '1px', color: 'white' }}
                            onClick={() => {
// console.log(rowData)
                                onLTPClick(rowData, 'buy','ce')
                                
                            }}
                        >
                            <span>Buy</span>
                        </button>
                        <button
                            className='smallRedButton boldText'
                            // style={{ marginTop: '1px', color: 'white' }}
                            onClick={() => {
                                onLTPClick(rowData, 'sell', 'ce')
                            }}
                        >
                            <span>Sell</span>
                        </button>
                    </div>
                )}
                {rowData.CallLTP}
            </div>
        );
    };





    const putLTPTemplate = (rowData, row) => {
        const isHovered = hoveredRow === rowData.Strike; // Check if the current row is hovered

        return (
            <div
                style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                onMouseEnter={() => setHoveredRow(rowData.Strike)} // Set hovered row on mouse enter
                onMouseLeave={() => setHoveredRow(null)} // Clear hovered row on mouse leave
            >
                {isHovered && (
                    <div style={{  position: 'absolute',  display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center'  }}>
                        <button
                            className='smallGreenButton mr-1 boldText'
                            // style={{ marginTop: '1px', color: 'white' }}
                            onClick={() => {

                                onLTPClick(rowData, 'buy','pe')
                                
                            }}
                        >
                            <span>Buy</span>
                        </button>
                        <button
                            className='smallRedButton boldText'
                            // style={{ marginTop: '1px', color: 'white' }}
                            onClick={() => {
                                onLTPClick(rowData, 'sell', 'pe')
                            }}
                        >
                            <span>Sell</span>
                        </button>
                    </div>
                )}
                {rowData.PutLTP}
            </div>
        );
    };


    const columns = [ 
        { field:'CallTheta', header: 'Call Theta', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'CallDelta', header: 'Call Delta', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'CallIV', header: 'Call IV', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'CallOIChg', header: 'Call OI Chg', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'CallOI', header: 'Call OI', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'CallLTP', header: 'Call LTP', style: { minWidth: '133px' }, className: "option", align: "center" },
        { field: 'Strike', header: 'Strike',style: { minWidth: '10px' }, className: "option", align: "center" },   
        { field: 'PutLTP', header: 'Put LTP', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'PutOI', header: 'Put OI', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'PutOIChg', header: 'Put OI Chg', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'PutIV', header: 'Put IV', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'PutDelta', header: 'Put Delta', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'PutTheta', header: 'Put Theta', style: { minWidth: '133px' }, className: "option", align: "center"  },
    ];

    // Add a custom class to highlight the closest strike price row
    const rowClass = (rowData) => {
        return rowData.Strike == closestStrike ? 'closest-strike' : '';
    };

    


   

    const flexColumnBodyTemplate = (rowData, column) => {
        if(column.field === 'CallLTP'){
            return callLTPTemplate(rowData, column);
        }
        else if(column.field === 'PutLTP')
        {
            return putLTPTemplate(rowData,column);
        }
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {rowData[column.field]}
            </div>
        );
    };


    scroll = () => {

        const scrollContainer = document.querySelector(".datebox");
        const scrollLeftButton = document.querySelector(".scroll-left");
        const scrollRightButton = document.querySelector(".scroll-right");
        const scrollStep = 200; // Adjust this value based on your preference
        const scrollDuration = 500; // Adjust this value for the smooth scrolling duration
    
        if ( scrollLeftButton != null ) {
          scrollLeftButton.addEventListener("click", function() {
            smoothScroll(scrollContainer, -scrollStep, scrollDuration);
          });
        }
        
        if ( scrollRightButton != null ) {
          scrollRightButton.addEventListener("click", function() {
            smoothScroll(scrollContainer, scrollStep, scrollDuration);
          });
      }
    
    
        function smoothScroll(element, amount, duration) {
    
          const start = element.scrollLeft;
          const target = start + amount;
          const startTime = performance.now();
    
          function scrollAnimation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
            element.scrollLeft = start + amount * ease;
    
            if (progress < 1) {
              requestAnimationFrame(scrollAnimation);
            }
          }
    
          requestAnimationFrame(scrollAnimation);
    
        }
    }
// 
if(expiryList.length === 0) return;

// console.log(expiryList)
  
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
              
          {/* <OptionChainComponent         
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
        legEntityList={legEntityList}
        onLegUpdate={handleLegUpdate}

/> */}
       <div>
                <div className='flex-item' style={{display:'flex'}} >
                   <div className='buy-date' style={{flex:'auto'}}><strong>Last Updated:&nbsp;</strong> {lastUpdate}</div>
                   <Button  
         onClick={() => {this.props.callbackToggleTable()}} 
         className="p-button p-component hide-show toggle-button" 
       >
       
             <i className="pi pi-eye-slash" title="Hide Option Chain Table" style={{ marginRight: '1px' }}></i>
             <div className="hide-show-text">Option Chain</div>
          
        
       </Button>
       
       </div>
       
       <div className="alignedCenter"></div> 
           <div className="datebox" style={{display:'flex',  marginBottom:'3px', marginTop:'3px' }}>
                    
                   {/* {expiryList} */}
       
         
                 
                 </div>
                   
                   
                   <div className="option-chain-component">
                       <DataTable 
                           className='optionList' 
                           value={tableData} // Updated state
                           responsiveLayout="scroll" 
                           scrollable  
                           showGridlines
                           scrollHeight= 'calc(-100px + 118vh)'
                           rowClassName={rowClass}  // Apply custom row class
                       >
                           {columns.map((col) => (
                               <Column 
                                   key={col.field} 
                                   field={col.field} 
                                   header={col.header} 
                                   className={col.className} 
                                   align={col.align} 
                                   style={col.style}
                                   body={(rowData) => flexColumnBodyTemplate(rowData, col)} // Apply custom body template
       
                               />
       
                               
                           ))}
                       </DataTable>
                   </div>
                   </div>

            </div>
            </div>
        {/* </div>
      </div> */}
        <div className='pad width-54'>
        
        <div className="symbol-details below-stocks">
       
        <div className="flex-item"><strong>Futures Price:</strong> {futuresPrice}</div>
        <div className="flex-item"><strong>Spot Price:</strong> {spotPrice}</div>
        <div className="flex-item"><strong>Avg IV:</strong> {avgIV}</div>
        
        
      </div>
      {legEntityList.length > 0 && (
  <div>
    <div>
      <PLComputeCompoenent 
      legEntityList={legEntityList} 
      selectedSymbol={selectedSymbol} 
      selectedSymbolType={selectedSymbolType} 
      selectedExpiry={selectedExpiry} />
    </div>

    <div>
      <PayoffChartComponent payoffchartdata={payoffchartdata} />
    </div>

    <div className='table-grid'>
      <LegComponent legEntityList={legEntityList} />
    </div>
  </div>
)}



      </div>
    </div>
   
  );
};

export default StrategyBuilder;