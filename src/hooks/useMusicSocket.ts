"use client";
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export const useMusicSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.addEventListener('message', (event) => {
      console.log('Message from server:', event.data);
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "TRACK_ADDED") {
          toast.success("Track successfully added to library!");
        } else if (msg.type === "TRACK_ERROR") {
          toast.error(msg.payload?.message || "Error adding track.");
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  return socketRef.current;
};
