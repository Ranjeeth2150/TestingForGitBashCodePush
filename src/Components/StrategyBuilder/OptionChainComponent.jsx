import React, { useEffect, useState } from "react";  
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const OptionChainComponent = ({
    selectedSymbol,
    selectedExpiry,
    instrumentKeys,
    Strikes,
    feedData,
}) => {
    const [tableData, setTableData] = useState([]);
    useEffect(() => {
        setTableData([]); // Clear table data
    }, [instrumentKeys]);

    useEffect(() => {
        if (feedData.length === 0) return;
        let currentTs = feedData[0].currentTs;
        // console.log(val.ff?.marketFF?.ltpc?.ltt;)

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
                const peOI = peFeed?.ff?.marketFF?.eFeedDetails?.oi|| 0;

                const cePoi = ceFeed?.ff?.marketFF?.eFeedDetails?.poi || 0;
                const pePoi = peFeed?.ff?.marketFF?.eFeedDetails?.poi || 0;

                const ceOIChg = ceOI - cePoi;
                const peOIChg = peOI - pePoi;


                const ceIV = ceFeed?.ff?.marketFF.optionGreeks.iv || 0;
                const peIV = peFeed?.ff?.marketFF.optionGreeks.iv || 0;


                const ceDelta = ceFeed?.ff?.marketFF.optionGreeks.delta || 0;
                const peDelta = peFeed?.ff?.marketFF.optionGreeks.delta || 0

                // const ceGamma = ceFeed?.ff?.marketFF.optionGreeks.gamma || 0;
                // const peGamma = peFeed?.ff?.marketFF.optionGreeks.gamma || 0;

                const ceTheta = ceFeed?.ff?.marketFF.optionGreeks.theta || 0;
                const peTheta = peFeed?.ff?.marketFF.optionGreeks.theta || 0;

                const existingRowIndex = updatedData.findIndex(row => row.Strike === key.replace('.0000', ''));
                // console.log(ceIV)
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
                        CallIV : ceIV !== 0 ? ceIV : 0,
                        CallOIChg: ceOIChg, 
                        CallOI: ceOI,
                        CallLTP: ceLTP,
                        PutLTP: peLTP,
                        PutOI: peOI,
                        PutOIChg: peOIChg,
                        PutIV : peIV !== 0 ? peIV : 0 ,
                        PutDelta: peDelta !== 0 ? (peDelta) : 0,
                        PutTheta: peTheta !== 0 ? peTheta : 0,
                    });
                }
            });

            return updatedData;
        });
    }, [feedData, Strikes]);

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
        { field:'PutIV', header: 'Call IV', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'PutDelta', header: 'Put Delta', style: { minWidth: '133px' }, className: "option", align: "center"  },
        { field:'PutTheta', header: 'Call Theta', style: { minWidth: '133px' }, className: "option", align: "center"  },

    ];

    return (
        <div className="option-chain-component">
            <DataTable 
                className='optionList' 
                value={tableData} // Updated state
                responsiveLayout="scroll" 
                scrollable  
                showGridlines
            >
                {columns.map((col) => (
                    <Column 
                        key={col.field} 
                        field={col.field} 
                        header={col.header} 
                        className={col.className} 
                        align={col.align} 
                        style={col.style} 
                    />
                ))}
            </DataTable>
        </div>
    );
};

export default OptionChainComponent;
