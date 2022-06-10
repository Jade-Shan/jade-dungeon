const https = require('https');

// https://www.weatherapi.com/api-explorer.aspx#forecast
// https://www.weatherapi.com/docs/ 
let weatherCodeMap = new Map();
let windDirtCodeMap = new Map();

exports.fetchForecast = async (appKey, cityName, days) => {
    let data = await fetchForecastData(appKey, cityName, days);
    if ('success' == data.status) {
        data.forecastDays = transForecastFormatFontText(data.oriData);
    } else {
        data.forecastDays = [{
            location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
            temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
            windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
        }, {
            location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
            temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
            windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
        }, {
            location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
            temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
            windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
        }, {
            location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
            temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
            windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
        }, {
            location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
            temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
            windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
        }];
    }
    return data;
};

let fetchForecastData = async (appKey, cityName, days) => {
    let result = { status: "err", msg: "unknow err" };
    let pms = new Promise((resolve, reject) => {
        const buffers = [];
        let body = null;
        let request = https.get(`https://api.weatherapi.com/v1/forecast.json?key=${appKey}&q=${cityName}&days=${days}&aqi=no&alerts=no`,
            (res) => {
                if (res.statusCode != 200) {
                    reject(`Server HTTP Err Code: ${res.statusCode}`);
                }
                res.on('data', (chunk) => { buffers.push(chunk); });
                res.on('close', () => {
                    let str = Buffer.concat(buffers).toString('utf8');
                    try {
                        resolve(JSON.parse(str));
                    } catch (e) { reject(`parse json err: ${str}`); }
                });
            });
    });
    await pms.then((data) => {
        result = { status: 'success', msg: '', oriData: data };
    }).catch((e) => {
        result.msg = e;
    });
    return result;
};

let splitWeatherDesc = (str) => {
    let result = ['', ''];
    if (str) {
        if (str.length > 30) {
            str.substring(0, 30);
        }
        if (str.length < 16) {
            result[0] = str;
        } else {
            let arr = str.split(' ');
            for (let s of arr) {
                if (result[0].length + s.length + 1 < 16) {
                    if (result[0].length > 0) {
                        result[0] = result[0] + ' ';
                    }
                    result[0] = result[0] + s;
                } else {
                    if (result[1].length > 0) {
                        result[1] = result[1] + ' ';
                    }
                    result[1] = result[1] + s;
                }
            }
        }
    }
    return result;
}

let transForecastFormatFontText = (oriData) => {
    let forecastDays = [{
        location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
        temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
        windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
    }, {
        location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
        temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
        windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
    }, {
        location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
        temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
        windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
    }, {
        location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
        temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
        windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
    }, {
        location: "", date: "", dayOfWeek: "", weatherCode: 0, weatherDesc: '', moonPhase: 1, uv: 0,
        temp: 0, tempBodyFeel: 0, tempMin: 0, tempMax: 0, atmPressure: 0,
        windSpeed: 0, windDir: 'N', humedPct: 0, preciPct: 0, sunrise: '', sunset: ''
    }];
    console.log(oriData);
    forecastDays[0].location = `${oriData.location.region}, ${oriData.location.country}`;
    forecastDays[0].date = '';
    forecastDays[0].weatherDesc = weatherCodeMap.get(oriData.current.condition.code).ens;
    forecastDays[0].humedPct = oriData.current.humidity;
    forecastDays[0].moonPhase = oriData.forecast.forecastday[0].astro.moon_phase;
    forecastDays[0].temp = oriData.current.temp_c;
    forecastDays[0].tempBodyFeel = oriData.current.feelslike_c;
    forecastDays[0].atmPressure = oriData.current.pressure_mb;
    forecastDays[0].sunrise = oriData.forecast.forecastday[0].astro.sunrise;
    forecastDays[0].sunset = oriData.forecast.forecastday[0].astro.sunset;

    let today = new Date();
    let tomorrow = (new Date());
    tomorrow.setTime(today.getTime() + 24 * 60 * 60 * 1000);
    let dfTomorrow = (new Date());
    dfTomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000);
    let dgTomorrow = (new Date());
    dgTomorrow.setTime(dfTomorrow.getTime() + 24 * 60 * 60 * 1000);
    let dhTomorrow = (new Date());
    dhTomorrow.setTime(dgTomorrow.getTime() + 24 * 60 * 60 * 1000);

    forecastDays[0].dayOfWeek = today.toDateString().split(' ')[0];
    forecastDays[0].weatherCode = weatherCodeMap.get(oriData.current.condition.code).code;
    forecastDays[0].windSpeed = oriData.current.wind_kph;
    forecastDays[0].windDir = oriData.current.wind_dir;
    forecastDays[0].tempMin = oriData.forecast.forecastday[0].day.mintemp_c;
    forecastDays[0].tempMax = oriData.forecast.forecastday[0].day.maxtemp_c;
    let rainChance0 = oriData.forecast.forecastday[0].day.daily_chance_of_rain;
    let snowChance0 = oriData.forecast.forecastday[0].day.daily_chance_of_snow;
    forecastDays[0].preciPct = rainChance0 > snowChance0 ? rainChance0 : snowChance0;

    forecastDays[1].dayOfWeek = tomorrow.toDateString().split(' ')[0];
    forecastDays[1].weatherCode = weatherCodeMap.get(oriData.forecast.forecastday[1].day.condition.code).code;
    forecastDays[1].windSpeed = oriData.forecast.forecastday[1].day.maxwind_kph;
    forecastDays[1].windDir = oriData.forecast.forecastday[1].hour[10].wind_dir;
    forecastDays[1].tempMin = oriData.forecast.forecastday[1].day.mintemp_c;
    forecastDays[1].tempMax = oriData.forecast.forecastday[1].day.maxtemp_c;
    let rainChance1 = oriData.forecast.forecastday[1].day.daily_chance_of_rain;
    let snowChance1 = oriData.forecast.forecastday[1].day.daily_chance_of_snow;
    forecastDays[1].preciPct = rainChance1 > snowChance1 ? rainChance1 : snowChance1;

    forecastDays[2].windDir = oriData.forecast.forecastday[2].hour[10].wind_dir;
    forecastDays[2].dayOfWeek = dfTomorrow.toDateString().split(' ')[0];
    forecastDays[2].weatherCode = weatherCodeMap.get(oriData.forecast.forecastday[2].day.condition.code).code;
    forecastDays[2].windSpeed = oriData.forecast.forecastday[2].day.maxwind_kph;
    forecastDays[2].tempMin = oriData.forecast.forecastday[2].day.mintemp_c;
    forecastDays[2].tempMax = oriData.forecast.forecastday[2].day.maxtemp_c;
    let rainChance2 = oriData.forecast.forecastday[2].day.daily_chance_of_rain;
    let snowChance2 = oriData.forecast.forecastday[2].day.daily_chance_of_snow;
    forecastDays[2].preciPct = rainChance2 > snowChance2 ? rainChance2 : snowChance2;

    forecastDays[3].windDir     = 'N';
    forecastDays[3].dayOfWeek   = dgTomorrow.toDateString().split(' ')[0];
    forecastDays[3].weatherCode = 1000000;
    forecastDays[3].windSpeed   = 0;
    forecastDays[3].tempMin     = 0;
    forecastDays[3].tempMax     = 0;
    forecastDays[3].preciPct    = 0;

    forecastDays[4].windDir     = 'N';
    forecastDays[4].dayOfWeek   = dhTomorrow.toDateString().split(' ')[0];
    forecastDays[4].weatherCode = 1000000;
    forecastDays[4].windSpeed   = '0';
    forecastDays[4].tempMin     = '0';
    forecastDays[4].tempMax     = '0';
    forecastDays[4].preciPct    = '0';

    return forecastDays;
}

weatherCodeMap.set(1000, { "code": 1000000, "cn": "晴天", "ens": "Clear", "en": "Clear" });
weatherCodeMap.set(1003, { "code": 1000001, "cn": "局部多云", "ens": "Partly Cloudy", "en": "Partly Cloudy" });
weatherCodeMap.set(1006, { "code": 1000001, "cn": "多云", "ens": "Cloudy", "en": "Cloudy" });
weatherCodeMap.set(1009, { "code": 1000002, "cn": "阴天", "ens": "Overcast", "en": "Overcast" });
weatherCodeMap.set(1030, { "code": 1000010, "cn": "薄雾", "ens": "Mist", "en": "Mist" });
weatherCodeMap.set(1135, { "code": 1000010, "cn": "雾", "ens": "Fog", "en": "Fog" });
weatherCodeMap.set(1072, { "code": 1000100, "cn": "周边有有零星小冻雾雨", "ens": "Ptch Frez Drz nerby", "en": "Patchy freezing drizzle nearby" });
weatherCodeMap.set(1063, { "code": 1000100, "cn": "周边有零星小雨", "ens": "Ptch rain nerby", "en": "Patchy rain nearby" });
weatherCodeMap.set(1240, { "code": 1000100, "cn": "小阵雨", "ens": "Light rain Shwr", "en": "Light rain shower" });
weatherCodeMap.set(1183, { "code": 1000100, "cn": "小雨", "ens": "Light rain", "en": "Light rain" });
weatherCodeMap.set(1198, { "code": 1000100, "cn": "微冻雨", "ens": "Light Frez rain", "en": "Light freezing rain" });
weatherCodeMap.set(1180, { "code": 1000100, "cn": "片状小雨", "ens": "Ptch light rain", "en": "Patchy light rain" });
weatherCodeMap.set(1153, { "code": 1000100, "cn": "细雨", "ens": "Light drizzle", "en": "Light drizzle" });
weatherCodeMap.set(1150, { "code": 1000100, "cn": "零星细雨", "ens": "Ptch light Drz", "en": "Patchy light drizzle" });
weatherCodeMap.set(1249, { "code": 1000100, "cn": "小冰雹雨", "ens": "Light sleet Shwr", "en": "Light sleet showers" });
weatherCodeMap.set(1189, { "code": 1000200, "cn": "中雨", "ens": "Moderate rain", "en": "Moderate rain" });
weatherCodeMap.set(1186, { "code": 1000200, "cn": "偶尔有中雨", "ens": "Mid rain at times", "en": "Moderate rain at times" });
weatherCodeMap.set(1201, { "code": 1000200, "cn": "中度或大冻雨", "ens": "Mid or Hvy Frez rain", "en": "Moderate or heavy freezing rain" });
weatherCodeMap.set(1243, { "code": 1000200, "cn": "中雨或大阵雨", "ens": "Mid or Hvy rain Shwr", "en": "Moderate or heavy rain shower" });
weatherCodeMap.set(1192, { "code": 1000300, "cn": "偶尔有大雨", "ens": "Heavy rain at times", "en": "Heavy rain at times" });
weatherCodeMap.set(1195, { "code": 1000300, "cn": "大雨", "ens": "Heavy rain", "en": "Heavy rain" });
weatherCodeMap.set(1246, { "code": 1000300, "cn": "暴雨", "ens": "Torrent rain Shwr", "en": "Torrential rain shower" });
weatherCodeMap.set(1168, { "code": 1000300, "cn": "冻雾雨", "ens": "Frez drizzle", "en": "Freezing drizzle" });
weatherCodeMap.set(1171, { "code": 1000300, "cn": "大冻雾雨", "ens": "Heavy Frez Drz", "en": "Heavy freezing drizzle" });
weatherCodeMap.set(1087, { "code": 1020000, "cn": "周边有雷雨", "ens": "Thundery outbreaks", "en": "Thundery outbreaks in nearby" });
weatherCodeMap.set(1276, { "code": 1020000, "cn": "雷区有中或大雨", "ens": "Mid Hvy rain thunder", "en": "Moderate or heavy rain in area with thunder" });
weatherCodeMap.set(1273, { "code": 1020000, "cn": "雷区有零星小雨", "ens": "Ptch light rain thndr", "en": "Patchy light rain in area with thunder" });
weatherCodeMap.set(1237, { "code": 1010000, "cn": "冰丸", "ens": "Ice pellets", "en": "Ice pellets" });
weatherCodeMap.set(1261, { "code": 1010000, "cn": "冰丸小雨", "ens": "Light ice Plts", "en": "Light showers of ice pellets" });
weatherCodeMap.set(1264, { "code": 1010000, "cn": "中度或大冰丸", "ens": "Mid Hvy ice Plts", "en": "Moderate or heavy showers of ice pellets" });
weatherCodeMap.set(1252, { "code": 1010000, "cn": "中度或大冰雹雨", "ens": "Mid Hvy sleet Shwr", "en": "Moderate or heavy sleet showers" });
weatherCodeMap.set(1147, { "code": 1030000, "cn": "冻雾", "ens": "Freezing fog", "en": "Freezing fog" });
weatherCodeMap.set(1069, { "code": 1001000, "cn": "周边有零星小雨夹雪", "ens": "Ptch sleet nerby", "en": "Patchy sleet nearby" });
weatherCodeMap.set(1066, { "code": 1001000, "cn": "周边有零星小雪", "ens": "Ptch snow nerby", "en": "Patchy snow nearby" });
weatherCodeMap.set(1255, { "code": 1001000, "cn": "小阵雪", "ens": "Light snow Shwr", "en": "Light snow showers" });
weatherCodeMap.set(1213, { "code": 1001000, "cn": "小雪", "ens": "Light snow", "en": "Light snow" });
weatherCodeMap.set(1204, { "code": 1001000, "cn": "微雨夹雪", "ens": "Light sleet", "en": "Light sleet" });
weatherCodeMap.set(1210, { "code": 1001000, "cn": "零星小雪", "ens": "Ptch light snow", "en": "Patchy light snow" });
weatherCodeMap.set(1114, { "code": 1002000, "cn": "飞雪", "ens": "Blowing snow", "en": "Blowing snow" });
weatherCodeMap.set(1216, { "code": 1002000, "cn": "零星中雪", "ens": "Ptch Mid snow", "en": "Patchy moderate snow" });
weatherCodeMap.set(1219, { "code": 1002000, "cn": "中雪", "ens": "Mid snow", "en": "Moderate snow" });
weatherCodeMap.set(1258, { "code": 1002000, "cn": "中度或大阵雪", "ens": "Mid or Hvy snow Shwr", "en": "Moderate or heavy snow showers" });
weatherCodeMap.set(1207, { "code": 1002000, "cn": "中度或大雨夹雪", "ens": "Mid or Hvy sleet", "en": "Moderate or heavy sleet" });
weatherCodeMap.set(1222, { "code": 1003000, "cn": "零星大雪", "ens": "Ptch Hvy snow", "en": "Patchy heavy snow" });
weatherCodeMap.set(1225, { "code": 1003000, "cn": "大雪", "ens": "Heavy snow", "en": "Heavy snow" });
weatherCodeMap.set(1117, { "code": 1003000, "cn": "暴风雪", "ens": "Blizzard", "en": "Blizzard" });
weatherCodeMap.set(1279, { "code": 1020000, "cn": "雷区有零星小雪", "ens": "Ptch light snow thndr", "en": "Patchy light snow in area with thunder" });
weatherCodeMap.set(1282, { "code": 1020000, "cn": "雷区有中或大雪", "ens": "Mid or Hvy snow thndr", "en": "Moderate or heavy snow in area with thunder" });
