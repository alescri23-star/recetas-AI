
import React, { useRef, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos necesarios.");
        onCancel();
      }
    };
    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureClick = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        onCapture(base64Data);
      }
    }
  }, [onCapture]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center bg-gray-900 p-4 rounded-lg shadow-2xl border border-gray-700">
      <div className="relative w-full aspect-video rounded-md overflow-hidden mb-4">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
      <div className="flex space-x-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleCaptureClick}
          className="flex-1 bg-[#D4AF37] hover:bg-[#c09d2e] text-black font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300"
        >
          Escanear Ingredientes
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
