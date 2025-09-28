import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Polygon, Placemark, SearchControl, GeolocationControl, ZoomControl } from '@pbe/react-yandex-maps';
import { Button, Space, Alert, Typography, Tag } from 'antd';
import { ClearOutlined, AimOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface MapDrawerProps {
  polygonCoords: number[][];
  setPolygonCoords: (coords: number[][]) => void;
}

export const MapDrawer: React.FC<MapDrawerProps> = ({
  polygonCoords,
  setPolygonCoords,
}) => {
  const [points, setPoints] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const mapRef = useRef<any>(null);

  // Синхронизируем points с polygonCoords (без замыкающей точки)
  useEffect(() => {
    if (polygonCoords.length > 0) {
      // Убираем замыкающую точку для отображения
      const pointsWithoutClosing = polygonCoords.slice(0, -1);
      setPoints(pointsWithoutClosing);
    }
  }, [polygonCoords]);

  const handleMapClick = (e: any) => {
    if (!isDrawing) return;
    
    const coords = e.get('coords');
    const newPoints = [...points, coords];
    setPoints(newPoints);
  };

  const startDrawing = () => {
    setPoints([]);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (points.length >= 3) {
      // Замыкаем полигон, добавляя первую точку в конец (для бэкенда)
      const closedPolygon = [...points, points[0]];
      
      // Логируем данные перед сохранением
      console.log('=== ЗАВЕРШЕНИЕ ОБЛАСТИ ===');
      console.log('Исходные точки (пользовательские):', points);
      console.log('Количество исходных точек:', points.length);
      console.log('Замкнутый полигон (для бэкенда):', closedPolygon);
      console.log('Количество точек в полигоне:', closedPolygon.length);
      console.log('Координаты полигона:');
      closedPolygon.forEach((coord, index) => {
        console.log(`  Точка ${index + 1}: [${coord[0]}, ${coord[1]}]`);
      });
      console.log('========================');
      
      setPolygonCoords(closedPolygon);
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    setPoints([]);
    setPolygonCoords([]);
    setIsDrawing(false);
  };

  // Функция для получения количества точек для отображения
  const getDisplayPointsCount = () => {
    if (isDrawing) {
      return points.length;
    } else if (polygonCoords.length > 0) {
      // Для завершенного полигона показываем количество точек без замыкающей
      return polygonCoords.length - 1;
    }
    return 0;
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          description={
            isDrawing 
              ? `Режим рисования: кликайте на карте чтобы добавить точку (${points.length} точек)`
              : polygonCoords.length >= 3 
                ? `Область определена (${getDisplayPointsCount()} точек)`
                : 'Нажмите "Начать рисование" чтобы определить границы объекта'
          }
          type={isDrawing ? "warning" : polygonCoords.length >= 3 ? "success" : "info"}
          showIcon
        />
        
        <div style={{ 
          position: 'relative', 
          border: '1px solid #d9d9d9', 
          borderRadius: '6px',
          height: '400px'
        }}>
          <YMaps
            query={{
              apikey: '2a7b60fe-5ad5-43ca-84a8-21aa77b8a789',
            }}
          >
            <Map
              defaultState={{
                center: [55.751574, 37.573856],
                zoom: 10,
                controls: [] // Убираем все стандартные контролы
              }}
              width="100%"
              height="100%"
              onClick={handleMapClick}
              instanceRef={mapRef}
              options={{ 
                suppressMapOpenBlock: true,
              }}
            >
              {/* Добавляем контрол поиска */}
              <SearchControl options={{ float: 'right' }} />
              
              {/* Добавляем контрол геолокации */}
              <GeolocationControl options={{ float: 'left' }} />
              
              {/* Добавляем контрол зума */}
              <ZoomControl />

              {/* Отображаем точки при рисовании */}
              {isDrawing && points.map((point, index) => (
                <Placemark
                  key={index}
                  geometry={point}
                  options={{
                    preset: 'islands#blueCircleIcon',
                    draggable: false,
                  }}
                  properties={{
                    balloonContent: `Точка ${index + 1}`,
                  }}
                />
              ))}
              
              {/* Отображаем линии между точками при рисовании */}
              {isDrawing && points.length > 1 && (
                <Polygon
                  geometry={[points]}
                  options={{
                    strokeColor: '#0000FF',
                    strokeWidth: 2,
                    strokeOpacity: 0.5,
                    fillColor: '#0000FF',
                    fillOpacity: 0.1,
                  }}
                />
              )}
              
              {/* Отображаем готовый полигон */}
              {!isDrawing && polygonCoords.length > 0 && (
                <Polygon
                  geometry={[polygonCoords]}
                  options={{
                    fillColor: 'rgba(0, 255, 0, 0.3)',
                    strokeColor: '#0000FF',
                    strokeWidth: 2,
                  }}
                />
              )}
            </Map>
          </YMaps>
        </div>

        <Space>
          {!isDrawing ? (
            <Button
              type="primary"
              icon={<AimOutlined />}
              onClick={startDrawing}
              disabled={isDrawing}
            >
              Начать рисование
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={finishDrawing}
              disabled={points.length < 3}
            >
              Завершить область
            </Button>
          )}
          
          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={points.length === 0 && polygonCoords.length === 0}
          >
            Очистить
          </Button>
        </Space>

        {(points.length > 0 || polygonCoords.length > 0) && (
          <div>
            <Tag color={points.length >= 3 || polygonCoords.length >= 3 ? "success" : "warning"}>
              Точек: {getDisplayPointsCount()}
            </Tag>
            {(points.length < 3 && isDrawing) && (
              <Text type="warning">
                Минимум 3 точки для создания области
              </Text>
            )}
          </div>
        )}

        <Text type="secondary" style={{ fontSize: '12px' }}>
          {isDrawing 
            ? 'Кликайте на карте для добавления точек области. Нажмите "Завершить область" когда добавите минимум 3 точки.'
            : 'Для создания объекта необходимо указать его границы на карте.'}
        </Text>
      </Space>
    </div>
  );
};