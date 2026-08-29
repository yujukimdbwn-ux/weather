import React, { useEffect, useState } from 'react'
import { fetchWeather } from './api'
import WeatherCard from './WeatherCard'
import { dfs_xy_conv, getCurrentPosition, getLocationNameFromGrid } from './utils/geo'

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
  // 요청 순서: 1) GPS 및 날씨 로드, 2) 푸시 권한 요청
  loadWeather();

  // OneSignal 푸시 권한 요청 (OneSignal SDK가 index.html에 로드되어 있다고 가정)
  if (window.OneSignal) {
    window.OneSignal.isPushNotificationsEnabled().then(isEnabled => {
      if (!isEnabled) {
        // 사용자에게 푸시 권한을 물어봅니다.
        window.OneSignal.showNativePrompt();
      }
    });
  }
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
