import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import adapter from 'webrtc-adapter';

const URL = "http://localhost:3000";

export const ScreenView = () => {
    adapter.browserDetails.browser
    const [socket, setSocket] = useState<Socket>();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (socket) return;
        const newSocket = io(URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleOffer = async ({ sdp: remoteSdp }: { sdp: RTCSessionDescriptionInit }) => {
            const peerConnection = new RTCPeerConnection();

            peerConnection.ontrack = ({ streams }) => {
                if (videoRef.current && !videoRef.current.srcObject) {
                    videoRef.current.srcObject = streams[0];
                }
            };

            await peerConnection.setRemoteDescription(remoteSdp);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("answer", { sdp: peerConnection.localDescription });

            peerConnection.onicecandidate = ({ candidate }) => {
                socket.emit("add-ice-candidate", { candidate });
                const interval = setTimeout(() => {
                    console.log("disconnecting");
                    if (videoRef.current?.srcObject && socket.connected) {
                        socket.disconnect();
                    } else {
                        interval;
                    }
                }, 2000);
            };


        };

        socket.on("offer", handleOffer);

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <div>
            <h1>{videoRef.current?.srcObject ? "Connected" : "Connecting"}</h1>
            <video playsInline controls autoPlay muted ref={videoRef} />
        </div>
    );
};