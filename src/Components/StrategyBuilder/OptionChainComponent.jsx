import React, { useEffect, useState } from "react";   
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Utility } from '../../utils/Utility'; // Importing the named export
import { Button } from 'primereact/button';

const OptionChainComponent = ({
    selectedSymbol,
    selectedExpiry,
    instrumentKeys,
    Strikes,
    feedData,
    SpotToken,
    expiryLisetExpiryListst
}) => {
    const [tableData, setTableData] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('');
    const [closestStrike, setClosestStrike] = useState(null);  // To store the closest strike price
    const [expiryList, setExpiryList] = useState(null);
    useEffect(() => {
        setTableData([]); // Clear table data
    }, [instrumentKeys]);

    useEffect(() => {
        let expiryList = [];   
        // console.log(expiryLisetExpiryListst.length) 
        for (let i = 0; i < expiryLisetExpiryListst.length; i++) {
            console.log(expiryLisetExpiryListst[i]["expiry_dates"])

        let expdt = selectedExpiry.substring(0,7);
        expiryList.push(<button key={"button_" + expiryLisetExpiryListst[i]["expiry_dates"]} 
        
        className= {expdt!=expiryLisetExpiryListst[i]["expiry_dates"].substring(0,7)?'button-above-option-chain':'button-above-option-chain-orange'} 
        // onClick={(e) => {
              
        //       expdt = e.target["innerText"];
        //       e.target['className']='button-above-option-chain-orange';
        //       this.props.callbackExpiryChange(expdt);
        //     }
            
        //     }
            
            >{expiryLisetExpiryListst[i]["expiry_dates"]}
            
            </button>);
          }
          setExpiryList(expiryList);
    },[expiryLisetExpiryListst])

    useEffect(() => {
        const util = new Utility();  

        if (feedData.length === 0) return;
        
        let spotPrice = feedData[0].feeds[SpotToken]?.ff?.indexFF?.ltpc?.ltp.toFixed(2);
        let spotTime = feedData[0].feeds[SpotToken]?.ff?.indexFF?.ltpc?.ltt;
        
        if (spotTime !== undefined) {
            setLastUpdate(util.formatTimestamp(spotTime));   
        }
        // if (spotPrice !== undefined) {
        //     // console.log(spotPrice);
        // }

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
    if(closest !== null)
    {
        setClosestStrike(closest);
   }
    // // Only update closestStrike if it has changed
    // if (closestStrike !== ) {
    //     setClosestStrike(closest);  // Store the closest strike price
    // }

        
        setTableData(prevData => {
            let updatedData = [...prevData]; // Preserve previous data

            Object.keys(Strikes).forEach(key => {
                const ceToken = Strikes[key].ceTokens;
                const peToken = Strikes[key].peTokens;

                const ceFeed = feedData[0].feeds[ceToken];
                const peFeed = feedData[0].feeds[peToken];

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

                const existingRowIndex = updatedData.findIndex(row => row.Strike === key.replace('.0000', ''));
                if (existingRowIndex !== -1) {
                    // Update existing row
                    updatedData[existingRowIndex] = {
                        ...updatedData[existingRowIndex],
                        CallTheta: ceTheta !== 0 ? ceTheta : updatedData[existingRowIndex].CallTheta,
                        CallDelta: ceDelta !== 0 ? ceDelta : updatedData[existingRowIndex].CallDelta,  
                        CallIV: ceIV !== 0 ? ((ceIV*100).toFixed(2)) : updatedData[existingRowIndex].CallIV,  
                        CallOIChg: ceOIChg !== 0 ? ceOIChg : updatedData[existingRowIndex].CallOIChg,    
                        CallOI: ceOI !== 0 ? ceOI : updatedData[existingRowIndex].CallOI,   
                        CallLTP: ceLTP !== 0 ? ceLTP : updatedData[existingRowIndex].CallLTP,
                        PutLTP: peLTP !== 0 ? peLTP : updatedData[existingRowIndex].PutLTP,  
                        PutOI: peOI !== 0 ? peOI : updatedData[existingRowIndex].PutOI,
                        PutOIChg: peOIChg !== 0 ? peOIChg : updatedData[existingRowIndex].PutOIChg,  
                        PutIV: peIV !== 0 ? ((peIV*100).toFixed(2)) : updatedData[existingRowIndex].PutIV,  
                        PutDelta: peDelta !== 0 ? peDelta : updatedData[existingRowIndex].PutDelta,  
                        PutTheta: peTheta !== 0 ? peTheta : updatedData[existingRowIndex].PutTheta,
                    };
                } else {
                    // Add new row
                    updatedData.push({
                        Strike: key.replace('.0000', ''),
                        CallTheta: ceTheta !== 0 ? ceTheta : 0,
                        CallDelta: ceDelta !== 0 ? (ceDelta) : 0,
                        CallIV : ceIV !== 0 ? ((ceIV*100).toFixed(2)) : 0,
                        CallOIChg: ceOIChg, 
                        CallOI: ceOI,
                        CallLTP: ceLTP,
                        PutLTP: peLTP,
                        PutOI: peOI,
                        PutOIChg: peOIChg,
                        PutIV : peIV !== 0 ? ((peIV*100).toFixed(2)) : 0 ,
                        PutDelta: peDelta !== 0 ? (peDelta) : 0,
                        PutTheta: peTheta !== 0 ? peTheta : 0,
                    });
                }
            });

            return updatedData;
        });
    }, [feedData, Strikes, SpotToken]);

    const columns = [ 
        { field:'CallTheta', header: 'Call Theta', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'CallDelta', header: 'Call Delta', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'CallIV', header: 'Call IV', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'CallOIChg', header: 'Call OI Chg', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'CallOI', header: 'Call OI', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'CallLTP', header: 'Call LTP', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field: 'Strike', header: 'Strike', className: "option", align: "center", },   
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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {rowData[column.field]}
            </div>
        );
    };
    

    return (
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
          <button className="scroll-left" ><svg width="38" height="32" viewBox="0 0 38 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="27" height="27" rx="13.5" transform="matrix(-1 0 0 1 27 2.5)" fill="#EBF5FA"/>
<path d="M34 16L10 16" stroke="#454A54" strokeWidth="2" strokeLinecap="round"/>
<path d="M18 24L10 16L18 8" stroke="#454A54" strokeWidth="2" strokeLinecap="round"/>
</svg>

</button>      
            {expiryList}

            <button className="scroll-right"><svg width="38" height="32" viewBox="0 0 38 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="11" y="2.5" width="27" height="27" rx="13.5" fill="#EBF5FA"/>
<path d="M4 16L28 16" stroke="#454A54" strokeWidth="2" strokeLinecap="round"/>
<path d="M20 24L28 16L20 8" stroke="#454A54" strokeWidth="2" strokeLinecap="round"/>
</svg>
</button>  
          
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
            
    );
};

export default OptionChainComponent;
