import React, { useEffect, useState } from 'react'
import { fetchWeather } from './api'
import WeatherCard from './WeatherCard'
import { dfs_xy_conv, getCurrentPosition, getLocationNameFromGrid } from './utils/geo'
import { requestNotificationPermission, setupForegroundMessaging } from './firebase'

function App() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locationName, setLocationName] = useState('위치 확인 중...')

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get GPS Position
      setLocationName('현재 위치 확인 중...');
      let nx = 61; // Default fallback to 인계동
      let ny = 121;
      let locName = '수원시 팔달구 인계동';

      try {
        const coords = await getCurrentPosition();
        const grid = dfs_xy_conv("toXY", coords.lat, coords.lng);
        nx = grid.nx;
        ny = grid.ny;
        locName = getLocationNameFromGrid(nx, ny);
      } catch (gpsError) {
        console.warn("GPS Error, using default location:", gpsError);
        // Fallback or show warning, we just proceed with default
        locName = '인계동 (GPS 거부됨)';
      }

      setLocationName(locName);

      // 2. Fetch Weather using nx, ny
      const data = await fetchWeather(nx, ny);
      setWeatherData(data);
    } catch (err) {
      setError(err.message || '날씨 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1) 날씨 로드
    loadWeather();

    // 2) FCM 알림 권한 요청 및 포그라운드 메시지 설정
    requestNotificationPermission();
    setupForegroundMessaging();
  }, []);


  return (
    <>
      {loading && <div className="loading">날씨 정보를 불러오는 중입니다...<br/><small>위치 확인 창이 뜨면 허용해주세요.</small></div>}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button className="reload-btn" onClick={loadWeather}>다시 시도</button>
        </div>
      )}
      {!loading && !error && (
        <WeatherCard data={weatherData} locationName={locationName} onReload={loadWeather} />
      )}
    </>
  )
}

export default App
