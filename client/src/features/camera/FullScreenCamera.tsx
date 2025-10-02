import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Button } from 'antd';
import { CloseOutlined, SwapOutlined } from '@ant-design/icons';
import styles from './FullScreenCamera.module.css';

interface FullScreenCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const FullScreenCamera: React.FC<FullScreenCameraProps> = memo(
  ({ visible, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
      'environment'
    );
    const isStartingRef = useRef(false);

    const startCamera = useCallback(
      async (cameraMode: 'user' | 'environment' = facingMode) => {
        // Предотвращаем множественные вызовы
        if (isStartingRef.current) return;

        isStartingRef.current = true;

        // Останавливаем предыдущий поток если он есть
        setStream(currentStream => {
          if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
          }
          return null;
        });

        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: cameraMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });

          setStream(mediaStream);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;

            // Ждем пока видео загрузится перед воспроизведением
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().catch(err => {
                  console.warn('Ошибка воспроизведения видео:', err);
                });
              }
            };
          }
          isStartingRef.current = false;
        } catch (error) {
          console.error('Ошибка доступа к камере:', error);
          // Fallback на обычную камеру
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            setStream(fallbackStream);

            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;

              videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                  videoRef.current.play().catch(err => {
                    console.warn('Ошибка воспроизведения видео:', err);
                  });
                }
              };
            }
          } catch (fallbackError) {
            console.error(
              'Не удалось получить доступ к камере:',
              fallbackError
            );
          }
          isStartingRef.current = false;
        }
      },
      [facingMode]
    );

    const stopCamera = useCallback(() => {
      setStream(currentStream => {
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }
        return null;
      });
    }, []);

    const flipCamera = useCallback(async () => {
      if (isStartingRef.current) return;

      const newFacingMode =
        facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(newFacingMode);

      // Останавливаем текущий поток
      stopCamera();

      // Небольшая задержка перед запуском новой камеры
      setTimeout(() => {
        startCamera(newFacingMode);
      }, 200);
    }, [facingMode, stopCamera, startCamera]);

    const handleClose = useCallback(() => {
      isStartingRef.current = false;
      stopCamera();
      onClose();
    }, [stopCamera, onClose]);

    useEffect(() => {
      if (visible) {
        // Предотвращаем скролл body
        document.body.style.overflow = 'hidden';
        startCamera();
      } else {
        // Восстанавливаем скролл body
        document.body.style.overflow = 'unset';
        isStartingRef.current = false;
        stopCamera();
      }

      return () => {
        // Восстанавливаем скролл body при размонтировании
        document.body.style.overflow = 'unset';
        isStartingRef.current = false;
        stopCamera();
      };
    }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

    // Обработчик клавиши Escape
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && visible) {
          handleClose();
        }
      };

      if (visible) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [visible, handleClose]);

    const capturePhoto = useCallback(() => {
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

      // Конвертируем в base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      setIsCapturing(true);

      // Небольшая задержка для визуального эффекта
      setTimeout(() => {
        onCapture(imageData);
        setIsCapturing(false);
        onClose();
      }, 200);
    }, [onCapture, onClose]);

    if (!visible) return null;

    return (
      <div className={styles.fullScreenOverlay} onClick={handleClose}>
        <div
          className={styles.cameraContainer}
          onClick={e => e.stopPropagation()}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.cameraVideo}
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Overlay с кнопками */}
          <div className={styles.cameraOverlay}>
            {/* Верхняя панель */}
            <div className={styles.topPanel}>
              <Button
                type='text'
                icon={<SwapOutlined />}
                onClick={flipCamera}
                className={styles.flipButton}
              />
              <Button
                type='text'
                icon={<CloseOutlined />}
                onClick={handleClose}
                className={styles.closeButton}
              />
            </div>

            {/* Нижняя панель с кнопкой съемки */}
            <div className={styles.bottomPanel}>
              <Button
                type='primary'
                shape='circle'
                size='large'
                onClick={capturePhoto}
                loading={isCapturing}
                className={styles.captureButton}
              />
            </div>
          </div>

          {/* Эффект вспышки при съемке */}
          {isCapturing && <div className={styles.flashEffect} />}
        </div>
      </div>
    );
  }
);

FullScreenCamera.displayName = 'FullScreenCamera';
