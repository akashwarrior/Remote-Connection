import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import adapter from 'webrtc-adapter';

const URL = "http://localhost:3000";

export const ScreenShare = () => {
    adapter.browserDetails.browser
    const [socket, setSocket] = useState<Socket | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: 60,
                    displaySurface: 'monitor',
                    autoGainControl: true,
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 2,
                    autoGainControl: false,
                },
            });
            setStream(stream);
            mediaStreamRef.current = stream;
            const newSocket = io(URL, { query: { type: 'sender' } });
            setSocket(newSocket);
        } catch (error) {
            console.error("Error accessing screen share:", error);
        }
    };

    useEffect(() => {
        if (!socket || !stream) return;

        const peerConnection = new RTCPeerConnection();

        const sendOffer = async () => {
            try {
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socket.emit("offer", { sdp: offer });
            } catch (error) {
                console.error("Error creating and sending offer:", error);
            }
        };

        sendOffer();

        const handleAnswer = async ({ sdp: remoteSdp }: { sdp: RTCSessionDescriptionInit }) => {
            try {
                await peerConnection.setRemoteDescription(remoteSdp);
            } catch (error) {
                console.error("Error handling answer:", error);
            }
        };

        const handleIceCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            peerConnection.addIceCandidate(candidate).catch(error => {
                console.error("Error adding ICE candidate:", error);
            }).finally(() => {
                socket.disconnect();
            });
        };

        socket.on("answer", handleAnswer);
        socket.on("add-ice-candidate", handleIceCandidate);

        return () => {
            socket.off("answer", handleAnswer);
            socket.off("add-ice-candidate", handleIceCandidate);
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [socket, stream]);

    return (
        <div style={{ width: 300 }}>
            {stream ? (
                <h1 style={{ width: 400 }}>Sharing Screen</h1>
            ) : (
                <button onClick={startScreenShare}>Give Screen Access</button>
            )}
        </div>
    );
};