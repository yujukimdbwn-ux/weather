const API_KEY = '%2FMcX%2B7YU%2Fh04t%2B5jrX8TYO1ukFJ%2FJSDwGS6M8X1LrBSX8LAtyAfR2PF6A035cWXI05v4ASuAxBPHm%2BNEw5IIEg%3D%3D'; // Provided API key
const BASE_URL = '/api/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

// 기상청 초단기실황 API는 매시 정각 40분 이후에 해당 시간의 데이터가 생성됨
const getBaseDateTime = () => {
  const now = new Date();
  
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let date = now.getDate();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  if (minutes < 40) {
    hours -= 1;
    if (hours < 0) {
      hours = 23;
      date -= 1;
      // Note: This simple calculation might have issues on 1st day of month, 
      // for production a proper date lib or logic should be used.
      const d = new Date();
      d.setDate(d.getDate() - 1);
      year = d.getFullYear();
      month = d.getMonth() + 1;
      date = d.getDate();
    }
  }

  const baseDate = `${year}${String(month).padStart(2, '0')}${String(date).padStart(2, '0')}`;
  const baseTime = `${String(hours).padStart(2, '0')}00`;

  return { baseDate, baseTime };
};

export const fetchWeather = async (nx = 61, ny = 121) => {
  const { baseDate, baseTime } = getBaseDateTime();
  
  const url = `${BASE_URL}?ServiceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.response && data.response.header.resultCode === '00') {
      const items = data.response.body.items.item;
      // map data
      const parsedData = {};
      items.forEach(item => {
        parsedData[item.category] = item.obsrValue;
      });
      return parsedData;
    } else {
      throw new Error(data.response?.header?.resultMsg || 'Unknown API Error');
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};
