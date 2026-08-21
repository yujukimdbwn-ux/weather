import React, { useEffect, useState } from 'react'
import { fetchWeather } from './api'
import WeatherCard from './WeatherCard'

function App() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // 인계동 nx=61, ny=121
      const data = await fetchWeather(61, 121);
      setWeatherData(data);
    } catch (err) {
      setError(err.message || '날씨 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [])

  return (
    <>
      {loading && <div className="loading">날씨 정보를 불러오는 중입니다...</div>}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button className="reload-btn" onClick={loadWeather}>다시 시도</button>
        </div>
      )}
      {!loading && !error && (
        <WeatherCard data={weatherData} onReload={loadWeather} />
      )}
    </>
  )
}

export default App
