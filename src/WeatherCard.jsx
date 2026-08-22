import React from 'react';
import { CloudSun, CloudRain, CloudSnow, Snowflake, CloudDrizzle, Wind } from 'lucide-react';

// 강수형태(PTY) 아이콘 매핑
const getWeatherIcon = (pty) => {
  const iconProps = { size: 64, color: 'var(--accent-color)', strokeWidth: 1.5 };
  switch(pty) {
    case '0': return <CloudSun {...iconProps} />;
    case '1': return <CloudRain {...iconProps} />;
    case '2': return <CloudSnow {...iconProps} />;
    case '3': return <Snowflake {...iconProps} />;
    case '5': return <CloudDrizzle {...iconProps} />;
    case '6': return <CloudSnow {...iconProps} />;
    case '7': return <Wind {...iconProps} />;
    default: return <CloudSun {...iconProps} />;
  }
};

// 강수형태 텍스트
const getPtyText = (pty) => {
  switch(pty) {
    case '0': return '맑음/구름';
    case '1': return '비';
    case '2': return '비/눈';
    case '3': return '눈';
    case '5': return '빗방울';
    case '6': return '빗방울눈날림';
    case '7': return '눈날림';
    default: return '알 수 없음';
  }
};

const WeatherCard = ({ data, locationName, onReload }) => {
  if (!data) return null;

  const temperature = data.T1H || '--';
  const humidity = data.REH || '--';
  const windSpeed = data.WSD || '--';
  const rainAmount = data.RN1 === '강수없음' || data.RN1 === '0' ? '0' : data.RN1;
  const weatherStatus = getPtyText(data.PTY);
  const WeatherIcon = getWeatherIcon(data.PTY);

  return (
    <div className="glass-card">
      <div className="title">CURRENT WEATHER</div>
      <div className="location" style={{ fontSize: locationName && locationName.length > 6 ? '1.5rem' : '2rem' }}>
        {locationName || '인계동'}
      </div>
      
      <div className="weather-icon-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
        {WeatherIcon}
      </div>
      <div className="weather-desc" style={{ marginBottom: '15px' }}>
        {weatherStatus}
      </div>

      <div className="temp-container">
        <span className="temperature">{temperature}</span>
        <span className="unit">°C</span>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">습도</span>
          <span className="detail-value">{humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">바람</span>
          <span className="detail-value">{windSpeed} m/s</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">강수량</span>
          <span className="detail-value">{rainAmount} mm</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">상태</span>
          <span className="detail-value" style={{ fontSize: '1.2rem' }}>{weatherStatus}</span>
        </div>
      </div>

      <button className="reload-btn" onClick={onReload}>새로고침</button>
    </div>
  );
};

export default WeatherCard;
