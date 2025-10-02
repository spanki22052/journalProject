import React, { useRef, useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { CloseOutlined, RetweetOutlined } from '@ant-design/icons';
import styles from './FullScreenCamera.module.css';

interface FullScreenCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const FullScreenCamera: React.FC<FullScreenCameraProps> = ({
  visible,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setIsLoading(true);
      setError(null);

      // Останавливаем предыдущий поток
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Устанавливаем размеры canvas равными размерам видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Рисуем кадр из видео на canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Получаем данные изображения
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Вызываем callback с данными изображения
    onCapture(imageData);

    // Закрываем камеру
    onClose();
  };

  useEffect(() => {
    if (visible) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [visible]);

  // Очищаем ресурсы при размонтировании
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width='100vw'
      style={{
        top: 0,
        paddingBottom: 0,
        maxWidth: '100vw',
        height: '100vh',
      }}
      bodyStyle={{
        padding: 0,
        height: '100vh',
        backgroundColor: '#000',
      }}
      className={styles.fullScreenModal}
      destroyOnClose
    >
      <div className={styles.cameraContainer}>
        {/* Видео элемент */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
        />

        {/* Скрытый canvas для захвата фото */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Контролы камеры */}
        <div className={styles.controls}>
          {/* Кнопка закрытия */}
          <Button
            type='text'
            icon={<CloseOutlined />}
            onClick={onClose}
            className={styles.closeButton}
            size='large'
          />

          {/* Кнопка переключения камеры */}
          <Button
            type='text'
            icon={<RetweetOutlined />}
            onClick={switchCamera}
            className={styles.switchButton}
            size='large'
            disabled={isLoading}
          />
        </div>

        {/* Кнопка захвата фото */}
        <div className={styles.captureContainer}>
          <Button
            type='primary'
            onClick={capturePhoto}
            className={styles.captureButton}
            size='large'
            loading={isLoading}
            disabled={!stream}
          />
        </div>

        {/* Сообщение об ошибке */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <p>Запуск камеры...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
