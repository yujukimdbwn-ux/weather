const API_KEY = '%2FMcX%2B7YU%2Fh04t%2B5jrX8TYO1ukFJ%2FJSDwGS6M8X1LrBSX8LAtyAfR2PF6A035cWXI05v4ASuAxBPHm%2BNEw5IIEg%3D%3D'; // KMA API KEY
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID_HERE";
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || "YOUR_ONESIGNAL_REST_API_KEY_HERE";

// 기준 위치 (수원시 팔달구 인계동)
const NX = 61;
const NY = 121;

function getBaseDateTime() {
  const now = new Date();
  // 한국 시간(KST)으로 보정
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  let year = kstTime.getFullYear();
  let month = kstTime.getMonth() + 1;
  let date = kstTime.getDate();
  let hours = kstTime.getHours();
  let minutes = kstTime.getMinutes();

  if (minutes < 40) {
    hours -= 1;
    if (hours < 0) {
      hours = 23;
      date -= 1;
      const d = new Date(kstTime.getTime() - (24 * 60 * 60 * 1000));
      year = d.getFullYear();
      month = d.getMonth() + 1;
      date = d.getDate();
    }
  }

  const baseDate = `${year}${String(month).padStart(2, '0')}${String(date).padStart(2, '0')}`;
  const baseTime = `${String(hours).padStart(2, '0')}00`;

  return { baseDate, baseTime };
}

async function sendOneSignalPush(message) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'], // 등록된 모든 유저에게 전송
      contents: {
        en: message,
        ko: message
      },
      headings: {
        en: "☔ 날씨 알림",
        ko: "☔ 날씨 알림"
      }
    })
  };

  const res = await fetch('https://onesignal.com/api/v1/notifications', options);
  return await res.json();
}

export default async function handler(req, res) {
  try {
    const { baseDate, baseTime } = getBaseDateTime();
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?ServiceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${NX}&ny=${NY}`;
    
    const weatherRes = await fetch(url);
    const data = await weatherRes.json();

    if (data.response && data.response.header.resultCode === '00') {
      const items = data.response.body.items.item;
      const ptyItem = items.find(item => item.category === 'PTY');
      const pty = ptyItem ? ptyItem.obsrValue : '0';

      // PTY: 0(없음), 1(비), 2(비/눈), 3(눈), 5(빗방울), 6(빗방울눈날림), 7(눈날림)
      const rainCodes = ['1', '2', '3', '5', '6', '7'];
      
      if (rainCodes.includes(pty)) {
        // 비나 눈이 오면 OneSignal에 푸시 발송 명령!
        const pushResult = await sendOneSignalPush("오늘 아침 기준 지역(인계동)에 비 또는 눈이 오고 있습니다. 외출 시 우산을 꼭 챙기세요!");
        console.log("Push sent:", pushResult);
        return res.status(200).json({ status: 'success', message: 'Rain detected, push sent', pushResult });
      } else {
        return res.status(200).json({ status: 'success', message: 'No rain detected, no push sent' });
      }
    } else {
      return res.status(500).json({ status: 'error', message: 'KMA API Error' });
    }
  } catch (error) {
    console.error('Error in cron:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
