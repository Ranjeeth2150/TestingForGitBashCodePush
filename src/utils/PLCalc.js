import { round } from "mathjs"
import { OptData, OptHeader, OptLeg } from "../entity/OptData"

import bs from "black-scholes"
import { Utility } from "./Utility"
import moment from "moment"

// import { PLComputeCompoenent } from "../component/StrategyBuilder/PLComputeCompoenent"

export class PLCalc {
  // constructor(props: Props) {
  //     super(props);
  //     // console.log(props);

  //       this.state = {
  //         range:[]

  //     }
  // }

  static getSigma(expectedCost, s, k, t, r, callPut, estimate) {
    var iv = require("implied-volatility")
    return iv.getImpliedVolatility(expectedCost, s, k, t, r, callPut, estimate)
  }
  static GetEarliestExpiryDatedby(optlegs) {
    let mexpdt = ""
    let currDt = new Date()
    currDt.setHours(0, 0, 0, 0)
    // console.log('currDt',currDt)
    optlegs.forEach(optleg => {
      // console.log(mexpdt)
      if (mexpdt !== "") {
        mexpdt.setHours(0, 0, 0, 0)
      }
      if (
        mexpdt == "" ||
        new Date(Utility.parseCustomDate(optleg.Expiry)) < mexpdt
      ) {
        mexpdt = new Date(Utility.parseCustomDate(optleg.Expiry))
      }
      if (mexpdt < currDt) {
        mexpdt = new Date(Utility.parseCustomDate(optleg.expiry_date))
      }

      // console.log(mexpdt)
    })
    return mexpdt
  }

  static GetEarliestExp(optlegs) { 
    let mexpdt = null; // Use null instead of an empty string to compare dates properly

    optlegs.forEach(optleg => {
        let legDt = Utility.parseFormattedCustomDate(optleg.expdt);
        
        if (!mexpdt || legDt < Utility.parseFormattedCustomDate(mexpdt)) {
            mexpdt = optleg.expdt;
        }
    });

    return mexpdt;
}

  static GetEarliestExpiryDateDMY(optlegs) {
    let mexpdt = ""
    let legExpiry = []
    // console.log('currDt',currDt)
    optlegs.forEach(optleg => {
      legExpiry.push(optleg.expiry_date)
    })
    if (legExpiry.length > 0) mexpdt = this.findNearestDate(legExpiry)
    else mexpdt = ""

    return mexpdt
  }
  // static findNearestDate = (dates: string[]): string => {
  //         // Convert the strings to Date objects
  //         const dateObjects = dates.map(date => new Date(date));

  //         // Get the current date
  //         const currentDate = new Date();

  //         // Separate future and expired dates
  //         const futureDates = dateObjects.filter(date => date >= currentDate);
  //         const expiredDates = dateObjects.filter(date => date < currentDate);

  //         let nearestDate: Date;

  //         if (futureDates.length > 0) {
  //             // If there are future dates, find the nearest
  //             nearestDate = futureDates.reduce((prev, curr) => {
  //                 const prevDiff = Math.abs(prev.getTime() - currentDate.getTime());
  //                 const currDiff = Math.abs(curr.getTime() - currentDate.getTime());
  //                 return currDiff < prevDiff ? curr : prev;
  //             });
  //         } else {
  //             // If all dates are expired, find the nearest expired date
  //             nearestDate = expiredDates.reduce((prev, curr) => {
  //                 const prevDiff = Math.abs(prev.getTime() - currentDate.getTime());
  //                 const currDiff = Math.abs(curr.getTime() - currentDate.getTime());
  //                 return currDiff < prevDiff ? curr : prev;
  //             });
  //         }
  //         // Return the nearest date as a string
  //         return nearestDate.toISOString().split('T')[0];
  //     };

  static findNearestDate = dates => {
    // Convert the strings to Date objects
    const dateObjects = dates.map(date => new Date(date))

    // Get the current date
    const currentDate = new Date()

    // Set the current date to midnight (00:00:00)
    currentDate.setHours(0, 0, 0, 0)

    // Separate future and expired dates
    const futureDates = dateObjects.filter(date => date >= currentDate)
    const expiredDates = dateObjects.filter(date => date < currentDate)

    let nearestDate

    if (futureDates.length > 0) {
      // If there are future dates, find the nearest
      nearestDate = futureDates.reduce((prev, curr) => {
        // Set both prev and curr to midnight for comparison
        prev.setHours(0, 0, 0, 0)
        curr.setHours(0, 0, 0, 0)

        const prevDiff = Math.abs(prev.getTime() - currentDate.getTime())
        const currDiff = Math.abs(curr.getTime() - currentDate.getTime())
        return currDiff < prevDiff ? curr : prev
      })
    } else {
      // If all dates are expired, find the nearest expired date
      nearestDate = expiredDates.reduce((prev, curr) => {
        // Set both prev and curr to midnight for comparison
        prev.setHours(0, 0, 0, 0)
        curr.setHours(0, 0, 0, 0)

        const prevDiff = Math.abs(prev.getTime() - currentDate.getTime())
        const currDiff = Math.abs(curr.getTime() - currentDate.getTime())
        return currDiff < prevDiff ? curr : prev
      })
    }

    // console.log("nearestDate", nearestDate);

    // return nearestDate.toISOString().split('T')[0];
    // Set the nearestDate hours to midnight and return as a string
    nearestDate.setHours(0, 0, 0, 0)

    // Get full date in yyyy-mm-dd format
    const year = nearestDate.getFullYear()
    const month = String(nearestDate.getMonth() + 1).padStart(2, "0") // Month is 0-based
    const day = String(nearestDate.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  static GetNearestFairPrice(optlegs, mexpdt, whatif) {
    let nearestFairPrice = ""
    optlegs.forEach(optleg => {
      if (nearestFairPrice == "" || optleg.expdt == mexpdt) {
        // console.log(optleg)
        let price = optleg.fairPrice
        if (whatif !== null && whatif.price != 0) {
          let newVal = +price + (price * whatif.price) / 100
          nearestFairPrice = newVal.toFixed(2)
        } else {
          nearestFairPrice = price
        }
      }
    })
    return nearestFairPrice
  }

  static GetFarFairPrice(optlegs, mexpdt, whatif) {
    let farFairPrice = ""
    optlegs.forEach(optleg => {
      if (farFairPrice == "" || optleg.expdt != mexpdt) {
        let price = optleg.fairPrice
        if (whatif !== null && whatif.price != 0) {
          let newVal = +price + (price * whatif.price) / 100
          farFairPrice = newVal.toFixed(2)
        } else {
          farFairPrice = price
        }
      }
    })
    return farFairPrice
  }

  static GetEarliestExps(optlegs) {
    let mexpdt = ""
    optlegs.forEach(optleg => {
      // console.log(optleg.expdt);
      if (mexpdt == "" || optleg.Expiry < mexpdt) {
        mexpdt = optleg.Expiry
      }
    })
    return mexpdt
  }

  static getMinMaxStrikes(optlegs) {
    let minstrike = Infinity
    let maxstrike = 0.0

    for (var optleg of optlegs) {
      if (optleg.pcflag == "F") {
        if (optleg.entryPrice < minstrike) minstrike = optleg.entryPrice

        if (optleg.entryPrice > minstrike) maxstrike = optleg.entryPrice
      } else {
        if (optleg.strikePrice < minstrike) minstrike = optleg.strikePrice

        if (optleg.strikePrice > maxstrike) maxstrike = optleg.strikePrice
      }
    }
    return { minstrike: minstrike, maxstrike: maxstrike }
  }

  static isCurSymbol(symb) {
    let cursymbols = [
      "USDINR",
      "EURINR",
      "GBPINR",
      "JPYINR",
      "EURUSD",
      "GBPUSD",
      "USDJPY"
    ]

    return cursymbols.indexOf(symb) > -1
  }

  static symbType(SymbolList, selectedSymbol) {
    let idxFound = -1;
    let symbTypeFound = "";
    // console.log(SymbolList.length)   
    for (let i = 0; i < SymbolList.length; i++) {
      const items = SymbolList[i].items;
      // console.log(items)
      for (let j = 0; j < items.length; j++) {
        if (items[j].label === selectedSymbol) {
          idxFound = i

          symbTypeFound = SymbolList[i].label
      
          break
        }
      }
      if (idxFound !== -1) {
        break
      }
    }
    return symbTypeFound
  }


  static symbType_v2(SymbolList, selectedSymbol) {
    let idxFound = -1;
    let symbTypeFound = [];
    // console.log(SymbolList.length)   
    for (let i = 0; i < SymbolList.length; i++) {
      const items = SymbolList[i].items;
      // console.log(items)
      for (let j = 0; j < items.length; j++) {
        if (items[j].label === selectedSymbol) {
          idxFound = i

          symbTypeFound['opt_symbol_type'] = SymbolList[i].opt_symbol_type;
          symbTypeFound['exc'] = SymbolList[i].exc;
      
          break
        }
      }
      if (idxFound !== -1) {
        break
      }
    }
    // console.log(symbTypeFound)
    return symbTypeFound
  }

  static getCurLotsize(symb) {
    let lotsizemap = {
      USDINR: 1000,
      EURINR: 1000,
      GBPINR: 1000,
      JPYINR: 100000,
      EURUSD: 1000,
      GBPUSD: 1000,
      USDJPY: 100000
    }
    return lotsizemap[symb]
  }

  static range(start, stop, step) {
    // console.log('range');
    step = step || 1
    let arr = []
    for (let i = start; i < stop; i += step) {
      arr.push(i)
    }

    // console.log(arr)
    return arr
  }

  static calcMean = xAxisData => {
    let sum = 0
    xAxisData.forEach(element => {
      sum = sum + element
    })
    if (sum != 0) return Math.round(sum / xAxisData.length)
    return null
  }

  static calculateIV = (baseIV, adjustment) => {
    let newVal = +baseIV + (baseIV * adjustment) / 100
    return newVal / 100
  }

  //  static ComputeDataForLeg(optheader, optleg, mexpdt, S, S2, whatif, xstart, xend) {

  //     let isCur = this.isCurSymbol(optheader['symbol']);
  //     let MarketCloseTime = 17;
  //     let pdiff = 0.0025
  //     let cdt;

  //     if (!isCur) {
  //         MarketCloseTime = 15.5;
  //         pdiff = Math.ceil(S * 0.00015)
  //     }

  //     let dateFormat = "MM/DD/YYYY, h:mm:ss a";

  //     let expirydt;
  //     if ( optleg.expdt != mexpdt) {
  //         expirydt = optleg.expdt;
  //     } else {
  //         expirydt = mexpdt;
  //     }

  //     // Near expiry datetime

  //     if ( whatif !== null && whatif?.days ) {
  //         let days = whatif.days;
  //         cdt = moment(days, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate().getTime();
  //     } else {
  //         cdt = moment(optheader.dealDate, dateFormat).toDate().getTime();
  //     }

  //   //  let expdt = Date.parse(mexpdt);
  //     let expdt :any= Utility.parseFormattedCustomDate(mexpdt);

  //     let tsecs = (expdt - cdt) / 1000 + MarketCloseTime * 60 * 60;
  //     if (tsecs == 0.0)
  //         tsecs = 60.0
  //     let T = tsecs / (365.0 * 24.0 * 60.0 * 60.0);
  //     if (T < 0)
  //     T = 0;
  //     // Far expiry datetime
  //     let expdt2;
  //     let T2;
  //     let v1;
  //     let v2;
  //     let cdt2;

  //     if ( optleg.expdt != mexpdt) {

  //         if ( whatif !== null && whatif?.days ) {
  //             let days = whatif.days;
  //             cdt2 = moment(days, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate().getTime();
  //         } else {
  //             cdt2 = moment(optheader.dealDate, dateFormat).toDate().getTime();
  //         }
  //           //  expdt2 = Date.parse(optleg.expdt);

  //             expdt2 = Utility.parseFormattedCustomDate(optleg.expdt);

  //         let tsecs2 = (expdt2 - cdt2) / 1000 + MarketCloseTime * 60 * 60;
  //         if (tsecs2 == 0.0)
  //             tsecs2 = 60.0

  //            T2 = tsecs2 / (365.0 * 24.0 * 60.0 * 60.0);

  //             //  far iv computation

  //             if (whatif !== null) {
  //                 let IV2 = optleg.iv;
  //                 // if (whatif.price !== 0) {
  //                 //     v2 = IV2 / 100;
  //                 // } else if (whatif.IV !== 0) {
  //                 if (whatif.IV !== 0) {
  //                     v2 = PLCalc.calculateIV(IV2, whatif.IV);
  //                 } else if (whatif.allowLegAdjustment && optleg.ivAdjustment !== undefined) {
  //                     v2 = PLCalc.calculateIV(IV2, optleg.ivAdjustment);
  //                 } else {
  //                     v2 = IV2 / 100;
  //                 }
  //             } else {
  //                 if (optleg.pcflag == 'C') {
  //                     v2 = this.getSigma(optleg.optionPrice, S2, optleg.strikePrice, T2, 0, 'call', 0.1);
  //                 }
  //                 else if (optleg.pcflag == 'P') {
  //                     v2 = this.getSigma(optleg.optionPrice, S2, optleg.strikePrice, T2, 0, 'put', 0.1);
  //                 }
  //             }
  //     } else {
  //         // near
  //         if (whatif !== null) {
  //             let IV = optleg.iv;
  //             // if (whatif.price !== 0) {
  //             //     v1 = IV / 100;
  //             // } else if (whatif.IV !== 0) {
  //             if (whatif.IV !== 0) {
  //                 v1 = PLCalc.calculateIV(IV, whatif.IV);
  //             } else if (whatif.allowLegAdjustment && optleg.ivAdjustment !== undefined) {
  //                 v1 = PLCalc.calculateIV(IV, optleg.ivAdjustment);
  //             } else {
  //                 v1 = IV / 100;
  //             }
  //         } else {
  //             if (optleg.pcflag == 'C') {
  //                 v1 = this.getSigma(optleg.optionPrice, S, optleg.strikePrice, T, 0, 'call', 0.1);
  //              }
  //             else if (optleg.pcflag == 'P') {
  //                 v1 = this.getSigma(optleg.optionPrice, S, optleg.strikePrice, T, 0, 'put', 0.1);
  //              }
  //         }
  //     }

  //     let tsecs3 = (expdt2 - expdt) / 1000 + MarketCloseTime * 60 * 60;
  //     if (tsecs3 == 0.0)
  //         tsecs3 = 60.0
  //     let T3 = tsecs3 / (365.0 * 24.0 * 60.0 * 60.0)

  //     let PutCallFlag = optleg.pcflag;
  //     let X = optleg.strikePrice;
  //     let entryprice =  optleg.entryPrice;
  //     let tradetype = optleg.tradeType;
  //     let qty = optleg.qty;
  //     let r = 0.0;
  //     let xdata = this.range(xstart, xend, 1);

  //     // let xdata = optheader.xaxis;
  //     let curdata = []
  //     let expdata = []
  //     let p;

  //     if (PutCallFlag == 'C') {

  //         for (var stkprice of xdata) { //
  //             let strike = stkprice;
  //             if ( optleg.expdt != mexpdt) {
  //                 p = bs.blackScholes(stkprice+(S2 - S), X, T2, v2, r, "call" )
  //             } else {
  //                 p = bs.blackScholes(stkprice, X, T, v1, r, "call" )
  //             }

  //             //T+0
  //             if (tradetype == 'B') {
  //                 curdata.push((p - entryprice) * qty)
  //             } else {
  //                 curdata.push((entryprice - p) * qty)
  //             }

  //             //  Expiry Data
  //             if (optleg["expdt"] === mexpdt) {
  //                 if (parseFloat(stkprice) <= parseFloat(X)) {
  //                     if (tradetype == 'B')
  //                         expdata.push(-(entryprice * qty));
  //                     else {
  //                         expdata.push(entryprice * qty);
  //                     }

  //                 } else {
  //                     if (tradetype == 'B') {
  //                         expdata.push(((stkprice - X) - entryprice) * qty);
  //                     }
  //                     else {
  //                         expdata.push((entryprice - (stkprice - X)) * qty);
  //                     }
  //                 }
  //             } else {
  //                 p = bs.blackScholes(stkprice+(S2 - S), X, T3, v2, r, "call" )
  //                  if (tradetype == 'B') {
  //                     expdata.push((p - entryprice) * qty);
  //                 } else {
  //                     expdata.push((entryprice - p) * qty);
  //                 }
  //             }
  //         }
  //     } else if (PutCallFlag == 'P') {
  //         for (var stkprice of xdata) {
  //             if ( optleg.expdt != mexpdt) {
  //                 p = bs.blackScholes(stkprice+(S2 - S), X, T2, v2, r, "put" )
  //             } else {
  //                 p = bs.blackScholes(stkprice, X, T, v1, r, "put" )
  //             }

  //             if (tradetype == 'B') {
  //                 curdata.push((p - entryprice) * qty)
  //             }
  //             else {
  //                 curdata.push((entryprice - p) * qty)
  //             }

  //             if (optleg["expdt"] == mexpdt) {
  //                 if (stkprice >= X) {
  //                     if (tradetype == 'B')
  //                         expdata.push(-(entryprice * qty))
  //                     else {
  //                         expdata.push(entryprice * qty)
  //                     }
  //                 } else {
  //                     if (tradetype == 'B') {
  //                         expdata.push(((X - stkprice) - entryprice) * qty)
  //                     }
  //                     else {
  //                         expdata.push((entryprice - (X - stkprice)) * qty);
  //                     }

  //                 }
  //             } else {
  //                 p = bs.blackScholes(stkprice+(S2 - S), X, T3, v2, r, "put" )
  //                 if (tradetype == 'B')
  //                     expdata.push((p - entryprice) * qty);
  //                 else
  //                     expdata.push((entryprice - p) * qty);
  //             }
  //         }
  //     }
  //     else {
  //         let price_diff = optleg.futuresPrice - optleg.fairPrice ;
  //         for (var stkprice of xdata) {
  //             let futprices = stkprice + price_diff;
  //             if (tradetype == 'B') {
  //                 curdata.push((futprices - entryprice) * qty)
  //                 expdata.push((futprices - entryprice) * qty)
  //             } else {
  //                 curdata.push((entryprice - futprices) * qty)
  //                 expdata.push((entryprice - futprices) * qty)
  //             }
  //         }
  //     }
  //     return [xdata, curdata, expdata, S2, whatif];
  // }

  static ComputeDataForLeg(
    optheader,
    optleg,
    mexpdt,
    S,
    S2,
    whatif,
    xstart,
    xend
  ) {
    const isCur = this.isCurSymbol(optheader["symbol"])
    const MarketCloseTime = isCur ? 17 : 15.5
    const pdiff = isCur ? 0.0025 : Math.ceil(S * 0.00015)
    const dateFormat = "MM/DD/YYYY, h:mm:ss a"

    let expirydt = optleg.expdt !== mexpdt ? optleg.expdt : mexpdt
    let cdt =
      whatif && whatif.days
        ? moment(whatif.days, "YYYY-MM-DDTHH:mm:ss.SSSZ")
            .toDate()
            .getTime()
        : moment(optheader.dealDate, dateFormat)
            .toDate()
            .getTime()
    let expdt = Utility.parseFormattedCustomDate(mexpdt)

    // console.log(cdt,expdt)
    let tsecs = (expdt - cdt) / 1000 + MarketCloseTime * 60 * 60
    tsecs = tsecs === 0 ? 60 : tsecs
    let T = tsecs / (365 * 24 * 60 * 60)
    T = T < 0 ? 0 : T

    let expdt2, T2, v1, v2, cdt2
// console.log(optleg.expdt, mexpdt, optleg.expdt !== mexpdt)

    if (optleg.expdt !== mexpdt) {
    //   cdt2 =
    //     whatif && whatif.days
    //       ? moment(whatif.days, "YYYY-MM-DDTHH:mm:ss.SSSZ")
    //           .toDate()
    //           .getTime()
    //       : moment(optheader.dealDate, dateFormat)
    //           .toDate()
    //           .getTime()
    //   expdt2 = Utility.parseFormattedCustomDate(optleg.expdt)
    //   let tsecs2 = (expdt2 - cdt2) / 1000 + MarketCloseTime * 60 * 60
    //   tsecs2 = tsecs2 === 0 ? 60 : tsecs2
    //   T2 = tsecs2 / (365 * 24 * 60 * 60)

    //   if (whatif) {
    //     let IV2 = optleg.iv
    //     v2 =
    //       whatif.IV !== 0
    //         ? PLCalc.calculateIV(IV2, whatif.IV)
    //         : whatif.allowLegAdjustment && optleg.ivAdjustment !== undefined
    //         ? PLCalc.calculateIV(IV2, optleg.ivAdjustment)
    //         : IV2 / 100
    //   } else {
    //     v2 =
    //       optleg.pcflag === "C"
    //         ? this.getSigma(
    //             optleg.optionPrice,
    //             S2,
    //             optleg.strikePrice,
    //             T2,
    //             0,
    //             "call",
    //             0.1
    //           )
    //         : this.getSigma(
    //             optleg.optionPrice,
    //             S2,
    //             optleg.strikePrice,
    //             T2,
    //             0,
    //             "put",
    //             0.1
    //           )
    //   }
    } else {
      
      if (whatif) {
        let IV = optleg.iv
        v1 =
          whatif.IV !== 0
            ? PLCalc.calculateIV(IV, whatif.IV)
            : whatif.allowLegAdjustment && optleg.ivAdjustment !== undefined
            ? PLCalc.calculateIV(IV, optleg.ivAdjustment)
            : IV / 100
      } else {
        v1 =
          optleg.pcflag === "C"
            ? this.getSigma(
                optleg.optionPrice,
                S,
                optleg.strikePrice,
                T,
                0,
                "call",
                0.1
              )
            : this.getSigma(
                optleg.optionPrice,
                S,
                optleg.strikePrice,
                T,
                0,
                "put",
                0.1
              );

              
      }
    }

    let tsecs3 = (expdt2 - expdt) / 1000 + MarketCloseTime * 60 * 60
    tsecs3 = tsecs3 === 0 ? 60 : tsecs3
    let T3 = tsecs3 / (365 * 24 * 60 * 60)

    const PutCallFlag = optleg.pcflag
    const X = optleg.strikePrice
    const entryprice = optleg.entryPrice
    const tradetype = optleg.tradeType
    const qty = optleg.qty
    const r = 0.0
    const xdata = this.range(xstart, xend, 1)
    const curdata = []
    const expdata = []
    // console.log(PutCallFlag,X,entryprice, tradetype)

    if (PutCallFlag === "C") {
      for (const stkprice of xdata) {
        let p = optleg.expdt !== mexpdt? bs.blackScholes(stkprice + (S2 - S), X, T2, v2, r, "call"): bs.blackScholes(stkprice, X, T, v1, r, "call")

        if (tradetype === "B") {
          curdata.push((p - entryprice) * qty)
        } else {
          curdata.push((entryprice - p) * qty)
        }

        if (optleg.expdt === mexpdt) {
          if (stkprice <= X) {
            if (tradetype === "B") {
              expdata.push(-(entryprice * qty))
            } else {
              expdata.push(entryprice * qty)
            }
          } else {
            if (tradetype === "B") {
              expdata.push((stkprice - X - entryprice) * qty)
            } else {
              expdata.push((entryprice - (stkprice - X)) * qty)
            }
          }
        } else {
          p = bs.blackScholes(stkprice + (S2 - S), X, T3, v2, r, "call")
          if (tradetype === "B") {
            expdata.push((p - entryprice) * qty)
          } else {
            expdata.push((entryprice - p) * qty)
          }
        }
      }
    } else if (PutCallFlag === "P") {
    //   for (const stkprice of xdata) {
    //     let p =
    //       optleg.expdt !== mexpdt
    //         ? bs.blackScholes(stkprice + (S2 - S), X, T2, v2, r, "put")
    //         : bs.blackScholes(stkprice, X, T, v1, r, "put")

    //     if (tradetype === "B") {
    //       curdata.push((p - entryprice) * qty)
    //     } else {
    //       curdata.push((entryprice - p) * qty)
    //     }

    //     if (optleg.expdt === mexpdt) {
    //       if (stkprice >= X) {
    //         if (tradetype === "B") {
    //           expdata.push(-(entryprice * qty))
    //         } else {
    //           expdata.push(entryprice * qty)
    //         }
    //       } else {
    //         if (tradetype === "B") {
    //           expdata.push((X - stkprice - entryprice) * qty)
    //         } else {
    //           expdata.push((entryprice - (X - stkprice)) * qty)
    //         }
    //       }
    //     } else {
    //       p = bs.blackScholes(stkprice + (S2 - S), X, T3, v2, r, "put")
    //       if (tradetype === "B") {
    //         expdata.push((p - entryprice) * qty)
    //       } else {
    //         expdata.push((entryprice - p) * qty)
    //       }
    //     }
    //   }
    } else {
    //   //    const price_diff = optleg.futuresPrice - optleg.fairPrice;
    //   const price_diff = optleg.futuresPrice - S
    //   // const price_diff = optleg.futuresPrice - S;

    //   for (const stkprice of xdata) {
    //     //  const futprices = stkprice + price_diff;
    //     //  if (tradetype === 'B') {
    //     //     curdata.push((futprices - entryprice) * qty);
    //     //     expdata.push((futprices - entryprice) * qty);
    //     //  } else {
    //     //     curdata.push((entryprice - futprices) * qty);
    //     //     expdata.push((entryprice - futprices) * qty);
    //     //  }
    //     const futprices = stkprice + price_diff
    //     if (tradetype === "B") {
    //       curdata.push((futprices - entryprice) * qty)
    //       expdata.push((futprices - entryprice) * qty)
    //     } else {
    //       curdata.push((entryprice - futprices) * qty)
    //       expdata.push((entryprice - futprices) * qty)
    //     }
    //   }
    }

    return [xdata, curdata, expdata, S2, whatif]
  }

  static ComputePayoffData(optdata, exitedLegList) {
    let { optheader, optlegs } = optdata;
    let xdata = [], expdata = [], curdata = [];
    let isCur = PLCalc.isCurSymbol(optheader.symbol);
    let mstart, mend, farprice;
    let MarketCloseTime = isCur ? 17 : 15.5;
    let DivFactor = isCur ? 0.0025 : 5.0;
    let pdiff = isCur ? 0.25 : Math.ceil(optheader.fairPrice * 0.00015);
    
    if (isCur) {
        let lotsize = PLCalc.getCurLotsize(optheader.symbol);
        optlegs.forEach(leg => leg.qty *= lotsize);
    }
   

    let legsize = optlegs.length;
    // console.log(optlegs)
    let mexpdt = legsize > 0 ? PLCalc.GetEarliestExp(optlegs) : optheader.payoffdate;
    // let S = legsize > 0 ? PLCalc.GetNearestFairPrice(optlegs, mexpdt, optdata.whatif) : optheader.fairPrice;
    let S = optheader.fairPrice;
    S = parseFloat(S); // Ensure S has 2 decimal places

    let S2 = PLCalc.GetFarFairPrice(optlegs, mexpdt, optdata.whatif);
    S2 = parseFloat(S2); // Ensure S has 2 decimal places

    
    let mstrikes = PLCalc.getMinMaxStrikes(optlegs);
    let avgiv = parseFloat(optheader.avgiv.toString().replace(/,/g, "")) / 100;
    let expdtt = Utility.parseFormattedCustomDate(mexpdt);
    let dealdt = moment(optheader.dealDate, "MM/DD/YYYY, h:mm:ss a").toDate().getTime();
    let tsecs = (expdtt - dealdt) / 1000 + MarketCloseTime * 60 * 60;
    tsecs = Math.max(tsecs, 0);
    let tdays = tsecs / (24 * 60 * 60);
    let sd = round(S * avgiv * Math.sqrt(tdays / 365), 4);
    let parsedDate = Utility.parseCustomDate(mexpdt);
    let formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getFullYear()} 15:30:00`;
    let dealDate = optheader.marketDate;
    let diffDays = moment(formattedDate, 'DD-MM-YYYY HH:mm:ss').diff(moment(dealDate, 'DD-MM-YYYY HH:mm:ss'), 'days', true);
    diffDays = Math.max(diffDays, 0);
    let sd2 = S * avgiv * Math.sqrt(diffDays / 365);
    let p2sd = S + 3 * sd2;
    let m2sd = S - 3 * sd2;


    
    mstart = Math.min(mstrikes.minstrike, m2sd);
    mend = Math.max(mstrikes.maxstrike, p2sd);
    let xstart = Math.floor(mstart * 0.98);
    let xend = Math.ceil(mend * 1.02);


    // console.log(mstart,mend,xstart,xend)

    if (legsize === 0) {
        xdata = PLCalc.range(xstart, xend, pdiff);
        curdata = Array(xdata.length).fill(exitedLegList);
        expdata = Array(xdata.length).fill(exitedLegList);
    } else {
        let whatif = optdata.whatif;
        let firstleg = true;
        optlegs.forEach(optleg => {
            let tdata = PLCalc.ComputeDataForLeg(optheader, optleg, mexpdt, S, S2, whatif, xstart, xend);
            // console.log('tdata',tdata)
            farprice = tdata[3];
            if (firstleg) xdata.push(...tdata[0]);
            tdata[1].forEach((val, l) => {
                curdata[l] = firstleg ? parseFloat(val) : curdata[l] + parseFloat(val);
            });
            tdata[2].forEach((val, k) => {
                expdata[k] = firstleg ? parseFloat(val) : expdata[k] + parseFloat(val);
            });
            firstleg = false;
        });
    }

    xdata = xdata.map(p => round(p, isCur ? 4 : 2));
    curdata = curdata.map(p => round(p, 2));
    expdata = expdata.map(p => round(p, 2));
    
    // let breakevenExpiry = PLCalc.breakevenExpiry(xdata, expdata);
    // let nearestFairPriceBreakEvenExpiry = breakevenExpiry.length > 1 ? this.findNearestValues(S, breakevenExpiry) : breakevenExpiry;
    // let T = Math.max((Utility.parseFormattedCustomDate(mexpdt) - moment(optheader.dealDate, "MM/DD/YYYY, h:mm:ss a").toDate().getTime()) / (365 * 24 * 60 * 60 * 1000), 0);
    // let avgIVVal = optheader.avgiv / 100;
    // let POP = breakevenExpiry.length > 1 ?
    //     Math.abs(PLCalc.computePOP(S, nearestFairPriceBreakEvenExpiry[0], 0, T, avgIVVal) - PLCalc.computePOP(S, nearestFairPriceBreakEvenExpiry[1], 0, T, avgIVVal)) :
    //     1 - PLCalc.computePOP(S, breakevenExpiry[0], 0, T, avgIVVal);
    // console.log(xdata)
    return [xdata, curdata, expdata, { sd }, { fairprice: S }, { farprice: S2 }, { whatif: optdata.whatif }];
}


  static chartData(data) {
    if(data.length === 0) return;
    if(data.legEntityList.length === 0) return;
    // console.log(data)

    let optdata = new OptData()
    // // // assigning header
    let optheader = new OptHeader()
    let legList = data.legEntityList.filter(p => !p.exited && p.enable == true)
    // console.log(legList)
    let exitedLegList = data.legEntityList.filter(
      p => p.exited && p.enable == true
    )
    let expiry = data.selectedExpiry;
    optheader.avgiv = data.avgIV;
    optheader.symbol = data.selectedSymbol;
    const dateString = data.dealDate;
    optheader.fairPrice = data.spotPrice;

    // console.log(dateString)
    optheader.marketDate = moment(dateString, 'DD-MMM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss');
    optheader.dealDate = moment();
    optheader.payoffdate = legList.length > 0 ? PLCalc.GetEarliestExps(legList) : data.selectedExpiry;
    let totPL = PLCalc.ComputePL(legList);
    let totPLExitedLegList = parseFloat(PLCalc.ComputeExitedPL(exitedLegList))+parseFloat(totPL);
    optheader.bookedPNL = totPLExitedLegList;
    
    optdata.optheader = optheader;
    optdata.whatif = data.whatif;
    
    let optlegs = new Array();
    let totIVs = PLCalc.ComputetotIV(legList);
    for (let opt of legList) 
    {
      if(totIVs != '0.00')
      {
        if(opt.IV  != 0)
        {
          let optleg = new OptLeg();
          optleg.optionPrice = Number.parseFloat((opt.Option_Price).toString().replace(',', ''));
          optleg.entryPrice = opt.Entry_Price == null ? optleg.optionPrice : Number.parseFloat((opt.Entry_Price).toString().replace(',', ''));
          if (opt.CE_PE == 'ce') {
              optleg.pcflag = 'C';
          } else if (opt.CE_PE == 'pe') {
              optleg.pcflag = 'P';
          } else {
              optleg.pcflag = 'F';
          }

          optleg.expdt = opt.Expiry;
          optleg.qty = opt.Position_Lot * opt.lot_size;
          optleg.strikePrice = opt.Strike_Price;
          optleg.tradeType = opt.Buy_Sell;
          optleg.fairPrice = opt.fairPrice;
          optleg.FuturesPrice = opt.FuturesPrice;
          optleg.iv = opt.iv_adjustment ? opt.IV * (1 + opt.iv_adjustment / 100) : opt.IV;
          optleg.ivAdjustment = opt.iv_adjustment;
          optleg.exited = opt.exited;
          optlegs.push(optleg);
          // console.log(optleg)

        }
      }
      else{
          let optleg = new OptLeg();
          optleg.optionPrice = Number.parseFloat((opt.Option_Price).toString().replace(',', ''));
          optleg.entryPrice = opt.Entry_Price == null ? optleg.optionPrice : Number.parseFloat((opt.Entry_Price).toString().replace(',', ''));
          if (opt.CE_PE == 'ce') {
              optleg.pcflag = 'C';
          } else if (opt.CE_PE == 'pe') {
              optleg.pcflag = 'P';
          } else {
              optleg.pcflag = 'F';
          }

          optleg.expdt = opt.Expiry;
          optleg.qty = opt.Position_Lot * opt.lot_size;
          optleg.strikePrice = opt.Strike_Price;
          optleg.tradeType = opt.Buy_Sell;
          optleg.fairPrice = opt.fairPrice;
          optleg.FuturesPrice = opt.FuturesPrice;
          optleg.iv = opt.iv_adjustment ? opt.IV * (1 + opt.iv_adjustment / 100) : opt.IV;
          optleg.ivAdjustment = opt.iv_adjustment;
          optleg.exited = opt.exited;
          optlegs.push(optleg);
      }
    }
    optdata.optlegs = optlegs;
    let result = PLCalc.ComputePayoffData(optdata,totPLExitedLegList);
    console.log(optdata)
    return result;

    
  }

  static ComputetotIV(optlegs) {
    let totaIV = 0
    optlegs.forEach(position => {
      // console.log(position)
      totaIV += parseFloat(position.IV)
    });
    // console.log()
    return totaIV.toFixed(2)
  }

  static ComputePL(optlegs) {
    let totaPL = 0
    optlegs.forEach(position => {
      if (position.IV == 0) {
        totaPL += parseFloat(position.Current_PL)
      }
    })

    return totaPL.toFixed(2)
  }
  static ComputeExitedPL(optlegs) {
    let totaPL = 0
    optlegs.forEach(position => {
      totaPL += parseFloat(position.Current_PL)
    })

    return totaPL.toFixed(2)
  }

  static ComputePLForExitedLeg(optlegs) {
    let totalPL = []
    optlegs.forEach(position => {
      totalPL = position.Current_PL
    })
    return totalPL
  }

  static findClosest(arrayData, fairPrice) {
    if (!Array.isArray(arrayData) || arrayData.length === 0) {
      return 0
    }
    return arrayData.reduce((closest, current) => {
      const closestDiff = Math.abs(closest - fairPrice)
      const currentDiff = Math.abs(current - fairPrice)
      return currentDiff < closestDiff ? current : closest
    })
  }

  static breakevenExpiry = (xdata, expdata) => {
    let dataX = xdata
    let dataY = expdata

    // Use the logic to calculate breakeven points
    const pos_res = dataY.reduce(
      (pos, dataY_value, idx) => {
        dataY_value >= 0 ? pos[pos.length - 1].push(dataX[idx]) : pos.push([])
        return pos
      },
      [[]]
    )

    const neg_res = dataY.reduce(
      (neg, dataY_value, idx) => {
        dataY_value < 0 ? neg[neg.length - 1].push(dataX[idx]) : neg.push([])
        return neg
      },
      [[]]
    )

    // Filter results to remove empty arrays
    const pos_result = pos_res.filter(e => e.length)
    const neg_result = neg_res.filter(e => e.length)

    // Return '-' if we cannot determine breakeven
    if (
      (pos_result.length === 1 && neg_result.length === 0) ||
      (pos_result.length === 0 && neg_result.length === 1)
    ) {
      return "-"
    }

    let break_even_values_arr = []
    const difference = pos_result.length - neg_result.length

    if (pos_result.length > 0 && neg_result.length > 0) {
      for (let i = 0; i < pos_result.length; i++) {
        if (pos_result[i].length > 0) {
          let index = pos_result[i].length

          if (difference === 0) {
            // Get the first and last values of the positive and negative arrays
            let pos_arr_first_and_last = PLComputeCompoenent.FirstandLastElementArray(
              pos_result[i]
            )
            let neg_arr_first_and_last = PLComputeCompoenent.FirstandLastElementArray(
              neg_result[i]
            )

            let pos_arr_first_value = pos_arr_first_and_last[0]
            let pos_arr_last_value = pos_arr_first_and_last[1]
            let neg_arr_first_value = neg_arr_first_and_last[0]
            let neg_arr_last_value = neg_arr_first_and_last[1]

            let diff_1 = pos_arr_first_value - neg_arr_first_value
            let diff_2 = pos_arr_last_value - neg_arr_first_value

            // Determine closest to zero
            let items = [diff_1, diff_2]
            let closest_value = Number(PLComputeCompoenent.closestToZero(items))

            if (diff_1 === closest_value) {
              break_even_values_arr.push(pos_arr_first_value)
            } else if (diff_2 === closest_value) {
              break_even_values_arr.push(pos_arr_last_value)
            }
          } else {
            // Handle case where difference is not zero
            let breakeven_firstvalue = dataX[0]
            let breakeven_lastvalue = dataX[dataX.length - 1]

            if (typeof pos_result[i] !== "undefined") {
              let pos_arr_first_and_last = PLComputeCompoenent.FirstandLastElementArray(
                pos_result[i]
              )
              let pos_arr_first_value = pos_arr_first_and_last[0]
              let pos_arr_last_value = pos_arr_first_and_last[1]

              if (breakeven_firstvalue === pos_arr_first_value) {
                pos_arr_first_value = 0
              }

              if (breakeven_lastvalue === pos_arr_last_value) {
                pos_arr_last_value = 0
              }

              break_even_values_arr.push(
                pos_arr_first_value,
                pos_arr_last_value
              )
            }
          }
        }
      }
    }

    // Filter out empty values
    break_even_values_arr = break_even_values_arr.filter(el => el)

    // console.log('break_even_Expiry_val',break_even_values_arr)

    if (break_even_values_arr.length === 0) {
      return "-"
    }

    return break_even_values_arr
  }
  static computePOP = (S, K, r, T, v) => {
    // Calculate d1
    const d1 =
      (Math.log(S / K) + (r + Math.pow(v, 2) / 2) * T) / (v * Math.sqrt(T))
    // Calculate d2
    const d2 = d1 - v * Math.sqrt(T)

    // Use the normalCDF function to get the value for d2
    const nd2 = PLCalc.normalCDF(d2)

    return nd2
  }
  static normalCDF = x => {
    // Constants for the approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989422804014337 * Math.exp((-x * x) / 2)
    const p =
      d *
      t *
      (0.31938153 +
        t *
          (-0.356563782 +
            t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))

    // Return the CDF for x (positive or negative)
    return x >= 0 ? 1 - p : p
  }

  static findNearestValues(fairPrice, breakevens) {
    let left = -Infinity
    let right = Infinity

    // Loop through the array to find the nearest left and right values
    for (let i = 0; i < breakevens.length; i++) {
      const price = breakevens[i]

      if (price < fairPrice && price > left) {
        left = price // Nearest value to the left of fairPrice
      } else if (price > fairPrice && price < right) {
        right = price // Nearest value to the right of fairPrice
      }
    }
    // If left or right is still Infinity, set them to 0
    if (left === -Infinity) left = 0
    if (right === Infinity) right = 0

    return [left, right] // Return right first (greater), then left (smaller)
  }

  static formatNumberLC(value) {
    let formatedvalues

    if (value >= 100000 && value < 10000000) {
      formatedvalues = value / 100000
      return formatedvalues.toFixed(2) + " L "
    } else if (value >= 10000000) {
      formatedvalues = value / 10000000
      return formatedvalues.toFixed(2) + " Cr "
    } else if (value <= -100000 && value > -10000000) {
      formatedvalues = value / 100000
      return formatedvalues.toFixed(2) + " L "
    } else if (value <= -10000000) {
      formatedvalues = value / 10000000
      return formatedvalues.toFixed(2) + " Cr "
    } else {
      return PLCalc.formatIndNumbers(value)
    }
  }

  static formatIndNumbers(value) {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
}
