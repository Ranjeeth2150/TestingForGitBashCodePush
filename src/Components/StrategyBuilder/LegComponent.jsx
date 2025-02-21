import React from "react"; 
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";

const LegComponent = ({ legEntityList }) => {
// 
  // console.log("legEntityList", legEntityList)
  // Function to format Date field into a readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleString(); // Adjust the format if needed
  };

  // Function to dynamically generate columns
  const renderColumnsLegs = () => {
    const columns = [
      { field: "Strike_Price", header: "Strike Price" },
      { field: "CE_PE", header: "CE/PE" },
      { field: "Position_Lot", header: "Position Lot" },
      { field: "Buy_Sell", header: "Buy/Sell" },
      { field: "IV", header: "IV" },
      { field: "Entry_Price", header: "Entry Price" },
      { field: "Option_Price", header: "Curr/Exit Price" },
      { field: "Current_PL", header: "Current P/L" },
      { field: "Expiry", header: "Expiry" },
      { field: "Symbol", header: "Symbol" },
      { field: "Date", header: "Date" },
    ];

    return columns.map((col, index) => {
      return (
        <Column
          key={index}
          field={col.field}
          header={col.header}
          body={col.field === 'Date' ? (rowData) => formatDate(rowData[col.field]) : null}
          style={{ textAlign: "center" }}
        />
      );
    });
  };




  const renderColumnsGreeks = () => {
    const columns = [
      { field: "Position_Lot", header: "Position Lot" },
      { field: "Buy_Sell", header: "Buy/Sell" },
      { field: "Strike_Price", header: "Strike Price" },
      { field: "CE_PE", header: "Type" },
      { field: "Expiry", header: "Expiry" },
      { field: "IV", header: "IV" },
      { field: "delta", header: "Delta" },
      { field: "gamma", header: "Gamma" },
      { field: "theta", header: "Theta" },
      { field: "vega", header: "Vega" },
      // { field: "Option_Price", header: "Price" },
      
    ];

    return columns.map((col, index) => {
      return (
        <Column
          key={index}
          field={col.field}
          header={col.header}
          body={col.field === 'Date' ? (rowData) => formatDate(rowData[col.field]) : null}
          style={{ textAlign: "center" }}
        />
      );
    });
  };

  return (
    <TabView>
      {/* Tab for Legs */}
      <TabPanel header="Legs">
        <div style={{ overflowX: "auto", width: "100%" }}>
          <DataTable value={legEntityList} responsiveLayout="scroll" scrollable showGridlines>
            <Column header={<Checkbox />} style={{ textAlign: "center" }} />
            {renderColumnsLegs()}
            <Column
              header="Action"
              body={() => <Button label="Exit" className="p-button-danger" />}
              style={{ textAlign: "center" }}
            />
          </DataTable>
        </div>
      </TabPanel>

      {/* Tab for Greeks (for reference) */}
      <TabPanel header="Greeks">
        <div>
          <DataTable value={legEntityList} responsiveLayout="scroll" scrollable showGridlines>
            {renderColumnsGreeks()}
            <Column
              header="Action"
              body={() => <Button label="Exit" className="p-button-danger" />}
              style={{ textAlign: "center" }}
            />
          </DataTable>
        </div>
      </TabPanel>
    </TabView>
  );
};

export default LegComponent;
