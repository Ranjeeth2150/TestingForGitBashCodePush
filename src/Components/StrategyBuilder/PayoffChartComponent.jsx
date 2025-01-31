import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PayoffChartComponent = () => {
  // Sample data for the chart
  const sampleData = {
    chartData: {
      xAxis: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], // X-axis values
      series1: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50], // First series (T+0)
      series2: [50, 45, 40, 35, 30, 25, 20, 15, 10, 5], // Second series (Expiry)
    },
    selectedsymbol: "Sample Chart",
    fairPrice: 50, // Fair price for plot lines
  };

  // Prepare data for the chart
  const xAxisData = sampleData.chartData.xAxis;
  const arr1 = xAxisData.map((x, i) => [x, sampleData.chartData.series1[i]]); // T+0 data
  const arr2 = xAxisData.map((x, i) => [x, sampleData.chartData.series2[i]]); // Expiry data

  // Highcharts options
  const options = {
    chart: {
      zoomType: "xy",
      height: 350,
      spacingBottom: 2,
      spacingTop: 5,
      spacingLeft: 2,
      spacingRight: 2,
    },
    title: {
      text: sampleData.selectedsymbol,
      margin: 30,
      align: "center",
      x: 50,
      style: {
        color: "black",
        fontSize: "14px",
      },
    },
    xAxis: {
      gridLineWidth: 1,
      title: {
        text: "Price",
        style: {
          fontWeight: "Bold",
          color: "Black",
        },
      },
      labels: {
        style: {
          color: "black",
        },
      },
      plotLines: [
        {
          color: "red",
          fillOpacity: 0.2,
          lineWidth: 3,
          dashStyle: "shortdot",
          zIndex: 3,
          value: sampleData.fairPrice,
          label: {
            text: `Fair Price: ${sampleData.fairPrice}`,
            rotation: 0,
            x: -20,
            y: 0,
            style: {
              fontSize: "11.5px",
              color: "#606060",
            },
          },
        },
      ],
    },
    yAxis: {
      gridLineColor: "rgba(50,205,50,0.15)",
      startOnTick: false,
      lineWidth: 1,
      title: {
        text: "P/L",
        style: {
          fontWeight: "Bold",
          color: "Black",
        },
      },
      labels: {
        style: {
          color: "black",
        },
      },
      plotLines: [
        {
          value: 0,
          width: 2,
          color: "#aaa",
        },
      ],
    },
    tooltip: {
      useHTML: true,
      shared: true,
      borderColor: "grey",
      borderWidth: 1,
      backgroundColor: "white",
      formatter: function () {
        return `
          <b>Price: ${this.x}</b><br/>
          ${this.points
            ?.map(
              (point) => `
            <span style="color:${point.color}">\u25CF</span> ${point.series.name}: 
            <b>${point.y}</b><br/>
          `
            )
            .join("") || ""}
        `;
      },
    },
    series: [
      {
        showInLegend: false,
        type: "line",
        name: "T+0",
        data: arr1,
        color: "rgb(0,0,255)",
        fillOpacity: 0.1,
        connectNulls: true,
        lineWidth: 1.5,
        dashStyle: "shortdot",
        marker: {
          enabled: false,
        },
      },
      {
        type: "area",
        name: "Expiry",
        fillOpacity: 0.1,
        showInLegend: false,
        negativeColor: "rgb(255,127,127)",
        color: "rgb(50,205,50)",
        data: arr2,
        connectNulls: true,
        lineWidth: 1.5,
        marker: {
          enabled: false,
        },
      },
    ],
  };

  return (
    <div>
      <div className="border-chat">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default PayoffChartComponent;