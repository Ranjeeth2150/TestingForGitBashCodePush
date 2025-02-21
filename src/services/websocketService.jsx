import { Buffer } from "buffer";
import proto from "../Components/socket/marketDataFeed.proto";
const protobuf = require("protobufjs");
import { debounce } from "lodash";

let protobufRoot = null;
let firstUpdate = true;

// Initialize protobuf
const initProtobuf = async () => {
  protobufRoot = await protobuf.load(proto);
  console.log("Protobuf initialization complete");
};

// Fetch WebSocket URL
const getUrl = async (token) => {
  const apiUrl = "https://api-v2.upstox.com/feed/market-data-feed/authorize";
  const headers = {
    "Content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const response = await fetch(apiUrl, { method: "GET", headers });
  if (!response.ok) {
    throw new Error("Failed to get WebSocket URL");
  }
  const data = await response.json();
  return data.data.authorizedRedirectUri;
};

// Convert Blob to ArrayBuffer
const blobToArrayBuffer = async (blob) => {
  if ("arrayBuffer" in blob) return await blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

// Decode Protobuf message
const decodeProtobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }
  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  const decoded = FeedResponse.decode(buffer);
  return decoded.toJSON(); // Convert to plain object
};

// Debounced update function
// const updateFeedData = debounce((setFeedData, response) => {
//   setFeedData([response]);
// }, 100);

// WebSocket setup function
export const setupWebSocket = async (token, instrumentKeys, setIsConnected, setFeedData) => {
  if (!token) return;

  await initProtobuf();
  const wsUrl = await getUrl(token);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    setIsConnected(true);
    console.log("WebSocket connected");
    if (instrumentKeys.length > 0) {
      subscribeToInstruments(ws, instrumentKeys);
    }
  };

  ws.onmessage = async (event) => {
    const arrayBuffer = await event.data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const response = decodeProtobuf(buffer);
    setFeedData([response]);
    // if (firstUpdate) {
    //   setFeedData([response]);
    //   firstUpdate = false;
    // } else {
    //   updateFeedData(setFeedData, response);
    // }
  };

  ws.onclose = () => {
    setIsConnected(false);
    console.log("WebSocket disconnected");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    setIsConnected(false);
  };

  return ws;
};

// Subscribe to instrument keys
const subscribeToInstruments = (ws, instrumentKeys) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const request = {
    subscribe: {
      mode: "FULL",
      instrumentKeys: instrumentKeys,
    },
  };
  ws.send(JSON.stringify(request));
};