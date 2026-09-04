export default async function handler(req, res) {
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || "04d6cffe-4814-482d-8018-f13839e23ec8";
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || "YOUR_REST_API_KEY";

  if (ONESIGNAL_REST_API_KEY === "YOUR_REST_API_KEY") {
    return res.status(400).json({ error: "ONESIGNAL_REST_API_KEY not set in environment" });
  }

  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      headings: { en: "테스트 알림", ko: "테스트 알림" },
      contents: { en: "OneSignal 테스트 메시지입니다.", ko: "OneSignal 테스트 메시지입니다." },
    }),
  };

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", options);
    const data = await response.json();
    return res.status(200).json({ result: data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
