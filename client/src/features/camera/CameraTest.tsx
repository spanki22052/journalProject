import React, { useRef } from 'react';
import { Button } from 'antd';

export const CameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const testCamera = async () => {
    try {
      console.log('Тестирование камеры...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      console.log('Поток получен:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        console.log('Видео запущено');
      }
    } catch (error) {
      console.error('Ошибка камеры:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Тест камеры</h3>
      <Button onClick={testCamera}>Запустить камеру</Button>
      <div style={{ marginTop: '20px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '300px', height: '200px', backgroundColor: '#000' }}
        />
      </div>
    </div>
  );
};
