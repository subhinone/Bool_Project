// 위경도를 기상청 격자좌표로 변환
const convertToGrid = (lat, lon) => {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx: x, ny: y };
};

const getBaseDateTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const baseTimes = [
    "0200",
    "0500",
    "0800",
    "1100",
    "1400",
    "1700",
    "2000",
    "2300",
  ];

  let baseTime = "2300";
  let baseDate = now;

  for (let i = baseTimes.length - 1; i >= 0; i--) {
    const baseHour = parseInt(baseTimes[i].substring(0, 2));
    if (hours > baseHour || (hours === baseHour && minutes >= 10)) {
      baseTime = baseTimes[i];
      break;
    }
    if (i === 0) {
      baseDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      baseTime = "2300";
    }
  }

  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: baseTime,
  };
};

export const getWeatherForecast = async (latitude, longitude) => {
  try {
    const serviceKey = import.meta.env.VITE_WEATHER_API_KEY;

    if (!serviceKey) {
      console.warn("기상청 API 키가 설정되지 않았습니다.");
      return null;
    }

    const { nx, ny } = convertToGrid(latitude, longitude);
    const { baseDate, baseTime } = getBaseDateTime();

    const url = new URL(
      "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
    );
    url.searchParams.append("serviceKey", serviceKey);
    url.searchParams.append("numOfRows", "300");
    url.searchParams.append("pageNo", "1");
    url.searchParams.append("dataType", "JSON");
    url.searchParams.append("base_date", baseDate);
    url.searchParams.append("base_time", baseTime);
    url.searchParams.append("nx", nx);
    url.searchParams.append("ny", ny);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.response?.header?.resultCode !== "00") {
      console.error("기상청 API 오류:", data.response?.header);
      return null;
    }

    const items = data.response?.body?.items?.item || [];

    const now = new Date();
    const currentDate = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const currentHour = String(now.getHours()).padStart(2, "0") + "00";

    const currentItems = items.filter((item) => {
      if (item.fcstDate > currentDate) return true;
      if (item.fcstDate === currentDate && item.fcstTime >= currentHour)
        return true;
      return false;
    });

    const weatherData = {
      temperature: null,
      humidity: null,
      windSpeed: null,
      windDirection: null,
      precipitation: null,
      rainType: null,
    };

    currentItems.forEach((item) => {
      switch (item.category) {
        case "TMP":
          weatherData.temperature = parseFloat(item.fcstValue);
          break;
        case "REH":
          weatherData.humidity = parseFloat(item.fcstValue);
          break;
        case "WSD":
          weatherData.windSpeed = parseFloat(item.fcstValue);
          break;
        case "VEC":
          weatherData.windDirection = getWindDirection(
            parseFloat(item.fcstValue)
          );
          break;
        case "PCP":
          weatherData.precipitation = item.fcstValue;
          break;
        case "PTY":
          weatherData.rainType = item.fcstValue;
          break;
      }
    });

    return weatherData;
  } catch (error) {
    console.error("날씨 API 호출 실패:", error);
    return null;
  }
};

const getWindDirection = (degree) => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
};

export const calculateEffectiveHumidity = (humidity, temperature) => {
  const tempFactor = temperature > 25 ? 1.2 : temperature > 20 ? 1.1 : 1.0;
  const effectiveHumidity = humidity * 0.7;

  let riskLevel = 0;

  if (effectiveHumidity < 30) {
    riskLevel = 90;
  } else if (effectiveHumidity < 40) {
    riskLevel = 70;
  } else if (effectiveHumidity < 50) {
    riskLevel = 50;
  } else if (effectiveHumidity < 60) {
    riskLevel = 30;
  } else {
    riskLevel = 15;
  }

  riskLevel = Math.min(100, Math.round(riskLevel * tempFactor));

  return {
    effectiveHumidity: Math.round(effectiveHumidity),
    riskLevel,
    riskText: getRiskText(riskLevel),
  };
};

const getRiskText = (riskLevel) => {
  if (riskLevel >= 80) return "매우 위험";
  if (riskLevel >= 60) return "위험";
  if (riskLevel >= 40) return "주의";
  if (riskLevel >= 20) return "보통";
  return "낮음";
};
