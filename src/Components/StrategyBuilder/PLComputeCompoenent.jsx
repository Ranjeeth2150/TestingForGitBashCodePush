import React from 'react';
import { LOV } from '../../entity/LOV';
import { PLCalc } from '../../utils/PLCalc'; // Assuming PLCalc is imported from utils

function PLComputeComponent({ legEntityList }) {
  if (!legEntityList || legEntityList.length === 0) return null;

  let data = [];
  let data2 = [];
  let arr = [];
  let arr2 = [];

  const maxProfit = () => 0;
  const maxLoss = () => 0;
  const fundRequired = () => 0;

  let maxp = maxProfit();
  let maxl = maxLoss();
  let funreq = fundRequired();
  let result = funreq !== 0 ? (maxp / funreq) * 100 : NaN;

  let item = new LOV();
  item['label'] = 'Max Profit';
  item['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data.push(item);


  let item1 = new LOV();
  item1['label'] = 'Max Loss';
  item1['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data.push(item1);


  let item2 = new LOV();
  item2['label'] = 'R:R'
  item2['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data.push(item2);


  let item3 = new LOV();
  item3['label'] = 'Breakeven (Expiry) '
  item3['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data.push(item3);



  let item4 = new LOV();
  item4['label'] = 'Breakeven (T+0)'
  item4['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data.push(item4);


  

  
  
  let item5 = new LOV();
  item5['label'] = 'Net Credit'
  item5['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data2.push(item5);



  let item6 = new LOV();
  item6['label'] = 'Margin Required'
  item6['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data2.push(item6);




  let item7 = new LOV();
  item7['label'] = 'Funds Required'
  item7['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data2.push(item7);


  let item8 = new LOV();
  item8['label'] = 'Current PL'
  item8['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data2.push(item8);
  
  let item9 = new LOV();
  item9['label'] = 'POP'
  item9['value'] = !isNaN(result) ? (
    <span>
      <span className="rupee">₹</span> {PLCalc.formatNumberLC(maxp)} ({result.toFixed(2)}%)
    </span>
  ) : (
    '-'
  );
  data2.push(item9);


  for (let i = 0; i < data.length; i++) {
    arr.push(
      <div className="one" style={{ justifyContent: 'flex-start', width: '100%' }} key={i}>
        <strong style={{ color: '#5c6270' }}>{data[i]['label']}</strong>
        <div>{data[i]['value']}</div>
      </div>
    );
  }



  for (let i = 0; i < data2.length; i++) {
    arr2.push(
      <div className="one" style={{ justifyContent: 'flex-start', width: '100%' }} key={i}>
        <strong style={{ color: '#5c6270' }}>{data2[i]['label']}</strong>
        <div>{data2[i]['value']}</div>
      </div>
    );
  }

  return (
    <div  id="computePLList">  
    <div style={{display: 'flex', justifyContent: 'flex-start', width: '100%'}}>  
       {arr}  
    </div>  
    <div  style={{display: 'flex', justifyContent: 'flex-start', width: '100%'}}>  
       {arr2}  
    </div>   
 </div>  
  );
}

export default PLComputeComponent;
