import React, { useEffect, useState } from "react";
import proto from "./marketDataFeed.proto";
import { Buffer } from "buffer";
const protobuf = require("protobufjs");

// Initialize Protobuf root
let protobufRoot = null;
const initProtobuf = async () => {
  protobufRoot = await protobuf.load(proto);
  console.log(protobufRoot)
  console.log(protobufRoot)
  console.log("Protobuf part initialization complete");
};

// Function to get WebSocket URL
const getUrl = async (token) => {
  const apiUrl = "https://api-v2.upstox.com/feed/market-data-feed/authorize";
  let headers = {
    "Content-type": "application/json",
    Authorization: "Bearer " + token,
  };
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: headers,
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const res = await response.json();
  return res.data.authorizedRedirectUri;
};

// Helper functions for handling Blob and ArrayBuffer
const blobToArrayBuffer = async (blob) => {
  if ("arrayBuffer" in blob) return await blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject();
    reader.readAsArrayBuffer(blob);
  });
};

// Decode Protobuf messages
const decodeProfobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }
  console.log(protobufRoot)
  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

// MarketDataFeed component
function MarketDataFeed({ token }) {
  const [isConnected, setIsConnected] = useState(false);
  const [feedData, setFeedData] = useState([]);

  // Establish WebSocket connection
  useEffect(() => {
    const connectWebSocket = async (token) => {
      try {
        const wsUrl = await getUrl(token);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => 
        {
          setIsConnected(true);
          console.log("Connected");
          const data = {
            guid: "someguid",
            method: "sub",
            data: {
              mode: "full",
              instrumentKeys: ['NSE_FO|50308', 'NSE_FO|50309', 'NSE_FO|50311', 'NSE_FO|50310', 'NSE_FO|50313', 'NSE_FO|50314', 'NSE_FO|50322', 'NSE_FO|50315', 'NSE_FO|50323', 'NSE_FO|50324', 'NSE_FO|50327', 'NSE_FO|50326', 'NSE_FO|50331', 'NSE_FO|50328', 'NSE_FO|50332', 'NSE_FO|50333', 'NSE_FO|50335', 'NSE_FO|50334', 'NSE_FO|50339', 'NSE_FO|50336', 'NSE_FO|50341', 'NSE_FO|50340', 'NSE_FO|50349', 'NSE_FO|50347', 'NSE_FO|50352', 'NSE_FO|50353', 'NSE_FO|50356', 'NSE_FO|50357', 'NSE_FO|50359', 'NSE_FO|50358', 'NSE_FO|50362', 'NSE_FO|50361', 'NSE_FO|50363', 'NSE_FO|50365', 'NSE_FO|50366', 'NSE_FO|50367', 'NSE_FO|50371', 'NSE_FO|50370', 'NSE_FO|50375', 'NSE_FO|50374', 'NSE_FO|50376', 'NSE_FO|50378', 'NSE_FO|50379', 'NSE_FO|50380', 'NSE_FO|50381', 'NSE_FO|50382', 'NSE_FO|50384', 'NSE_FO|50383', 'NSE_FO|50387', 'NSE_FO|50385', 'NSE_FO|50389', 'NSE_FO|50388', 'NSE_FO|50391', 'NSE_FO|50390', 'NSE_FO|50393', 'NSE_FO|50392', 'NSE_FO|50395', 'NSE_FO|50394', 'NSE_FO|50396', 'NSE_FO|50399', 'NSE_FO|50400', 'NSE_FO|50401', 'NSE_FO|50402', 'NSE_FO|50403', 'NSE_FO|50408', 'NSE_FO|50409', 'NSE_FO|50411', 'NSE_FO|50410', 'NSE_FO|50413', 'NSE_FO|50414', 'NSE_FO|50417', 'NSE_FO|50416', 'NSE_FO|50418', 'NSE_FO|50419', 'NSE_FO|50423', 'NSE_FO|50422', 'NSE_FO|50424', 'NSE_FO|50425', 'NSE_FO|50426', 'NSE_FO|50427', 'NSE_FO|50429', 'NSE_FO|50428', 'NSE_FO|50432', 'NSE_FO|50431', 'NSE_FO|50433', 'NSE_FO|50434', 'NSE_FO|50436', 'NSE_FO|50435', 'NSE_FO|50437', 'NSE_FO|50438', 'NSE_FO|50439', 'NSE_FO|50440', 'NSE_FO|50441', 'NSE_FO|50442', 'NSE_FO|50446', 'NSE_FO|50445', 'NSE_FO|50449', 'NSE_FO|50450', 'NSE_FO|50452', 'NSE_FO|50451'],
            },
          };
          ws.send(Buffer.from(JSON.stringify(data)));
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log("Disconnected");
        };

        ws.onmessage = async (event) => {
          const arrayBuffer = await blobToArrayBuffer(event.data);
          let buffer = Buffer.from(arrayBuffer);
          let response = decodeProfobuf(buffer);
          setFeedData((currentData) => [
            ...currentData,
            JSON.stringify(response),
          ]);
        };

        ws.onerror = (error) => {
          setIsConnected(false);
          console.log("WebSocket error:", error);
        };

        return () => ws.close();
      } catch (error) {
        console.error("WebSocket connection error:", error);
      }
    };

    initProtobuf();
    connectWebSocket(token);
  }, [token]);

  return (
    <div className="feed-container">
      <div className="header-section">
        <h1>Market Feed</h1>
        <h3 className={`status ${isConnected ? "connected" : "not-connected"}`}>
          Status: <span>{isConnected ? "Connected" : "Not Connected"}</span>
        </h3>
      </div>
      {isConnected && (
        <div className="feed-section">
          <div className="title">Feed</div>
          <div>
            {feedData.map((data, index) => (
              <div key={index} className="feed-item">
                {JSON.stringify(data)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketDataFeed;
