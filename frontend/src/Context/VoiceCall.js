// src/VoiceCallComponent.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const socket = io("http://localhost:5000");

const VoiceCallComponent = ({ user, children }) => {
  //function VoiceCallComponent() {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const myVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        socket.emit("join-call", "test-room");

        socket.on("user-joined", (userId) => {
          const peer = createPeer(userId, socket.id, stream);
          peersRef.current.push({
            peerID: userId,
            peer,
          });
          setPeers((prevPeers) => [...prevPeers, peer]);
        });

        socket.on("signal", (signalData) => {
          const item = peersRef.current.find(
            (p) => p.peerID === signalData.from
          );
          if (item) {
            item.peer.signal(signalData.signal);
          }
        });
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", { signal, to: userToSignal });
    });

    peer.on("stream", (stream) => {
      const existingPeer = peersRef.current.find(
        (p) => p.peerID === userToSignal
      );
      if (existingPeer) {
        setPeers((prevPeers) => {
          const updatedPeers = prevPeers.map((p) =>
            p.peerID === userToSignal ? { ...p, stream } : p
          );
          return updatedPeers;
        });
      }
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", { signal, to: callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div>
      <h1>Voice Call</h1>
      <audio ref={myVideo} autoPlay muted />
      {peers.map((peer, index) => (
        <audio
          key={index}
          ref={(audioRef) => {
            if (audioRef && peer.stream) {
              audioRef.srcObject = peer.stream;
            }
          }}
          autoPlay
        />
      ))}
    </div>
  );
};

export default VoiceCallComponent;
