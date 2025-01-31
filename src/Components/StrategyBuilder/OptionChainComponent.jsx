import React, { useRef,useEffect, useState } from "react";   
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Utility } from '../../utils/Utility'; // Importing the named export
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';

const OptionChainComponent = ({
    selectedSymbol,
    selectedExpiry,
    instrumentKeys,
    Strikes,
    feedData,
    SpotToken,
    expiryLisetExpiryListst,
    setSelectedExpiry,
    onLTPClick={onLTPClick}
}) => {
    const [tableData, setTableData] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('');
    const [closestStrike, setClosestStrike] = useState(null);  // To store the closest strike price
    const [expiryList, setExpiryList] = useState(null);
    const tableRef = useRef(null);  // Reference for the DataTable
    const [hoveredRow, setHoveredRow] = useState(null); // State to track hovered row
   

    useEffect(() => {
        setTableData([]); // Clear table data
        
    }, [instrumentKeys]);


    

    useEffect(() => {
        let expiryList = [];   
        // console.log(expiryLisetExpiryListst.length) 
        for (let i = 0; i < expiryLisetExpiryListst.length; i++) {
            // console.log(expiryLisetExpiryListst[i]["expiry_dates"])

        let expdt = selectedExpiry.substring(0,7);
        expiryList.push(<button key={"button_" + expiryLisetExpiryListst[i]["expiry_dates"]} 
        
        className= {expdt!=expiryLisetExpiryListst[i]["expiry_dates"].substring(0,7)?'button-above-option-chain':'button-above-option-chain-orange'} 
        onClick={(e) => {
              
              expdt = e.target["innerText"];
              e.target['className']='button-above-option-chain-orange';
              setSelectedExpiry(expdt); 
            }
            
            }
            
            >{expiryLisetExpiryListst[i]["expiry_dates"]}</button>);
          }
          
          setExpiryList(expiryList);
        
    },[expiryLisetExpiryListst,selectedExpiry,setSelectedExpiry]);
    


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

    // console.log(closest);

        
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

                const existingRowIndex = updatedData.findIndex(row => row.Strike === key.replace('.0000', ''));
                // console.log(existingRowIndex)
                if (existingRowIndex !== -1) {
                    // console.log("u")
                    // Update existing row
                    updatedData[existingRowIndex] = {
                        ...updatedData[existingRowIndex],
                        id: existingRowIndex, // Set the id to the row index
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

                    // After state update, scroll to the closest strike row
                    


    
                } else {
                    // Add new row
                    updatedData.push({
                        id: index, // Use index as a unique ID
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

    useEffect(() => {
        let tableWrapper = document.querySelector('.optionList .p-datatable-wrapper');
        let tbody = document.querySelector('.optionList .p-datatable-wrapper .p-datatable-table .p-datatable-tbody');
    
        if (tbody && tableWrapper) {
            let trs = tbody.querySelectorAll('tr');
            let len = trs.length;
    
            // Scroll vertically to the closestStrike row
            if (len > 40) {
                for (let i = 0; i < len; i++) {
                    if (trs[i].innerHTML.includes(closestStrike)) {
                        trs[i - 6].scrollIntoView();
                        break;
                    }
                }
            }
    
            // Scroll horizontally to the middle column
            let ths = document.querySelectorAll('.optionList .p-datatable-table thead th');
            let middleIndex = Math.floor(ths.length / 2);
            let middleColumn = ths[middleIndex];
    
            if (middleColumn) {
                tableWrapper.scrollLeft = middleColumn.offsetLeft - tableWrapper.clientWidth / 2 + middleColumn.clientWidth / 2;
            }
        }
    
        // Reset window scroll
        window.scrollTo(0, 0);
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

                                onLTPClick(rowData, 'buy','call')
                                
                            }}
                        >
                            <span>Buy</span>
                        </button>
                        <button
                            className='smallRedButton boldText'
                            // style={{ marginTop: '1px', color: 'white' }}
                            onClick={() => {
                                onLTPClick(rowData, 'sell', 'call')
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

                                onLTPClick(rowData, 'buy','put')
                                
                            }}
                        >
                            <span>Buy</span>
                        </button>
                        <button
                            className='smallRedButton boldText'
                            // style={{ marginTop: '1px', color: 'white' }}
                            onClick={() => {
                                onLTPClick(rowData, 'sell', 'put')
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
             
            {expiryList}

  
          
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
