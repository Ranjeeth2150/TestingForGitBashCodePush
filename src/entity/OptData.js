export class OptData{
    optheader;
    whatif;
    optlegs;
    exitedlegs;
    // xaxis
}

export class OptHeader{
    symbol;
    payoffdate;
    dealDate;
    symbolPrice;
    avgiv; 
    intrate;
    bookedPNL; 
    futuresPrice;
    fairPrice;
    marketDate;
    PL;
    xaxis;
}

export class OptLeg {
    futuresPrice;
    spotPrice;
    expdt;
    pcflag;
    strikePrice;
    entryPrice;
    optionPrice;
    tradeType;
    qty;
    iv;
    ivAdjustment;
    exited;
    exitPrice;
    atmpprice;
    fairPrice;
    Current_PL;
}

export class WhatIf{
    price;
    farprice;
    IV;
    // days: Date|Date[];
    days;
    allowLegAdjustment;

}