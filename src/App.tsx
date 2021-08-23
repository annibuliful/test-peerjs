import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Peer from "peerjs";
import { nanoid } from "nanoid";

const peerId = nanoid();
console.log("peerId", peerId);

const PEER_CONFIG = {
  host: "localhost",
  port: 9000,
  path: "/myapp",
};

const USER_MEDIA_CONTSTRAINT = {
  video: {
    width: { min: 300, ideal: 1920 },
    height: { min: 300, ideal: 1080 },
  },
  audio: true,
};
function App() {
  const srcVideoRef = useRef<HTMLVideoElement>(null);
  const destVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<Peer | null>(null);
  const [destPeerId, setPeerId] = useState("");

  const getUserMedia = () =>
    navigator.mediaDevices.getUserMedia(USER_MEDIA_CONTSTRAINT);

  const handleCallToSomeone = async () => {
    const videoRemoteStream = await getUserMedia();
    console.log("pee", peerConnection.current?.connect);
    if (!peerConnection.current) return;

    const conn = peerConnection.current.connect(destPeerId);
    conn.on("open", () => {
      conn.send("hi!");
    });
    const call = peerConnection.current.call(destPeerId, videoRemoteStream);
    call.on("stream", (remoteStream) => {
      // Show stream in some <video> element.
      // @ts-ignore
      destVideoRef.current.srcObject = remoteStream;
    });
  };

  const initPeerClient = () => {
    peerConnection.current = new Peer(peerId, PEER_CONFIG);

    peerConnection.current.on("call", async (call) => {
      console.log("call", call);
      const stream = await getUserMedia();
      call.answer(stream);
      call.on("stream", (remoteStream) => {
        // Show stream in some <video> element.
        // @ts-ignore
        destVideoRef.current.srcObject = remoteStream;
      });
    });

    peerConnection.current.on("connection", function (conn) {
      conn.on("data", function (data) {
        // Will print 'hi!'
        console.log(data);
      });
    });
  };

  const renderSrcMedia = async () => {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // @ts-ignore
    srcVideoRef.current.srcObject = videoStream;
  };

  useEffect(() => {
    if (!srcVideoRef.current) return;

    renderSrcMedia();
    initPeerClient();
  }, []);
  return (
    <div className="App">
      <input value={destPeerId} onChange={(e) => setPeerId(e.target.value)} />
      <button onClick={handleCallToSomeone}>call</button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          margin: "30px",
        }}
      >
        <video autoPlay ref={srcVideoRef} style={{ width: "300px" }}></video>
        <video autoPlay ref={destVideoRef} style={{ width: "300px" }}></video>
      </div>
    </div>
  );
}

export default App;
