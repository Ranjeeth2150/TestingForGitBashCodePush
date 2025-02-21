import React, { useEffect, useState, useMemo } from "react"; 
import { PLCalc } from "../../utils/PLCalc";
import axios from "axios";

function PLComputeComponent({ legEntityList, selectedSymbol, selectedSymbolType }) {
  const [marginData, setMarginData] = useState(null);

  if (!legEntityList || legEntityList.length === 0) return null;

  const marginDataURL = "https://www.icharts.in/opt/api/getMarginData_Api.php";
  const totIVs = PLCalc.ComputetotIV(legEntityList);
  let symbol = selectedSymbol;
  let exch = selectedSymbolType.exc;
  let symbType = selectedSymbolType.opt_symbol_type;

  const posList = useMemo(() => {
    return legEntityList
      .filter((el) => totIVs !== "0.00" && el.IV !== 0)
      .map((el) => {
        let insname = el.CE_PE === "FU" ? "FUTIDX" : symbType;

        if (symbol === "BANKEX") {
          symbol = "BKXOPT";
          insname = "BKXOPT";
        }
        if (symbol === "SENSEX") {
          symbol = "BSXOPT";
          insname = "OPTIDX";
        }

        return {
          prd: "M",
          exch,
          symname: encodeURIComponent(symbol),
          instname: insname,
          exd: `${el.Expiry.substring(0, 2)}-${el.Expiry.substring(2, 5)}-20${el.Expiry.substring(5)}`,
          netqty: (el.Buy_Sell === "sell" ? -el.Position_Lot * el.lot_size : el.Position_Lot * el.lot_size).toString(),
          lotSize: el.lot_size,
          optt: el.CE_PE.toUpperCase(),
          strprc: el.Strike_Price.toString(),
        };
      });
  }, [legEntityList, totIVs, selectedSymbol, selectedSymbolType]);

  useEffect(() => {
    if (posList.length === 0) return;

    // const fetchData = async () => {
    //   try {
    //     const formData = new FormData();
    //     formData.append("optdata", JSON.stringify({ pos: posList, actid: "DUMMY" }));
    //     const response = await axios.post(marginDataURL, formData, {
    //       headers: { "Content-Type": "multipart/form-data" },
    //     });

    //     let dataReturned = response.data;
    //     let marginValue = Number.parseFloat(dataReturned.expo_trade) + Number.parseFloat(dataReturned.span_trade);
    //     setMarginData(isNaN(marginValue) ? 0 : marginValue);
    //   } catch (error) {
    //     console.error("Error fetching margin data:", error);
    //   }
    // };

    // fetchData();
  }, [posList]); // Fetch when posList changes

  const allBuyLegs = useMemo(() => {
    return legEntityList.reduce((total, p) => {
      if (p.Buy_Sell === "buy" && p.CE_PE !== "FU" && !p.exited && p.IV !== 0.00 && p.IV !== "0.00" && p.enable) {
        total += p.Entry_Price * p.Position_Lot * p.lot_size;
      }
      return total;
    }, 0);
  }, [legEntityList]);

  const fundRequired = useMemo(() => {
    return marginData !== null ? (marginData + allBuyLegs).toFixed(2) : 0;
  }, [marginData, allBuyLegs]);


  

  const maxProfit = () => 0;
  const maxLoss = () => 0;
  const maxp = maxProfit();
  const maxl = maxLoss();
  const result = fundRequired !== 0 ? (maxp / fundRequired) * 100 : NaN;

  const createDataItem = (label) => ({
    label,
    value: !isNaN(result) ? (
      <span>
        <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
      </span>
    ) : (
      "-"
    ),
  });

  const data = [
    createDataItem("Max Profit"),
    createDataItem("Max Loss"),
    createDataItem("R:R"),
    createDataItem("Breakeven (Expiry)"),
    createDataItem("Breakeven (T+0)"),
  ];

  const data2 = [
    createDataItem("Net Credit"),
    createDataItem("Margin Required"),
    createDataItem("Funds Required"),
    createDataItem("Current PL"),
    createDataItem("POP"),
  ];

  return (
    <div id="computePLList">
      {[data, data2].map((items, index) => (
        <div key={index} style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
          {items.map(({ label, value }, i) => (
            <div className="one" style={{ justifyContent: "flex-start", width: "100%" }} key={i}>
              <strong style={{ color: "#5c6270" }}>{label}</strong>
              <div>{value}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PLComputeComponent;
