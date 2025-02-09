let httpServer = require('../common/simpleHTTPServer');
let weatherAPI = require('./weatherapi');
let openWeatherMap = require('./openweathermap');
const https = require('https');
const { times } = require('lodash');

let forecastDays = [];
let weatherCodeMap  = new Map();
let windDirtCodeMap = new Map();


// create weather icon SVG to FONT:  https://icomoon.io/app/#/select

exports.handler = {
	"/api/weather/forecast": async (context, data) => {
		let result = { status: 'err' };
		let outFormat = "conky";
		if (data.params.outFormat) {
			if ("json" == data.params.outFormat) {
				outFormat = "json";
			}
		}
		let appKey1 = data.params.appKey1 ? data.params.appKey1 : "";
		let appKey2 = data.params.appKey2 ? data.params.appKey2 : "";
		let cityName = data.params.cityName ? data.params.cityName : "Shanghai";
		let forecastDays = data.params.days ? data.params.days : "5";

		if (appKey1 && appKey1.length > 6 && appKey2 && appKey2.length > 6) {
			result = await weatherAPI.fetchForecast(appKey1, cityName, forecastDays);
			let lat = data.params.lat ? data.params.lat : "31.18";
			let lon = data.params.lon ? data.params.lon : "121.43";
			let days = await openWeatherMap.fetchForecast(appKey2, lat, lon);
			result.forecastDays[1].windDir = days[1].windDir;
			result.forecastDays[1].windSpeed = days[1].windSpeed;
			result.forecastDays[2].windDir = days[2].windDir;
			result.forecastDays[2].windSpeed = days[2].windSpeed;
			result.forecastDays[3] = days[3];
			result.forecastDays[4] = days[4];
			let cType = "application/json";
			if ("conky" == outFormat) {
				cType = "text/plan";
				result.fontStr = transForecastFormatFontText(result.forecastDays);
			} else {
				cType = "application/json";
				result.fontStr = JSON.stringify(result);
			}
			if (!context.response.headersSent) {
				await context.response.writeHead(200, {
					// 'Content-Type': 'application/json',
					'Content-Type': 'text/plan',
					'Cache-Control': 'public,s-maxage=300,max-age=300',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,POST',
					'Access-Control-Allow-Headers': 'x-requested-with,content-type'
				});
			}
			// context.response.end(JSON.stringify(result));
			await context.response.end(result.fontStr);
		} else {
			if (res.statusCode != 200) {
				console.error(`miss app key `);
				if (!context.response.headersSent) {
					await context.response.writeHead(404, {
						'Content-Type': 'application/json',
						'Cache-Control': 'public,s-maxage=300,max-age=300',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,POST',
						'Access-Control-Allow-Headers': 'x-requested-with,content-type'
					});
				}
				result.msg = 'miss appKey1'
				await context.response.end(JSON.stringify(result));
			}
		}
	}
};


let transMoonPhaseFont = (moonPhase) => {
    let mmMoonIcon = 5;
    if (moonPhase == 'New Moon'       ) { mmMoonIcon = 0; } else
    if (moonPhase == 'Waxing Crescent') { mmMoonIcon = 1; } else
    if (moonPhase == 'First Quarter'  ) { mmMoonIcon = 2; } else
    if (moonPhase == 'Waxing Gibbous' ) { mmMoonIcon = 3; } else
    if (moonPhase == 'Full Moon'      ) { mmMoonIcon = 4; } else
    if (moonPhase == 'Waning Gibbous' ) { mmMoonIcon = 5; } else
    if (moonPhase == 'Last Quarter'   ) { mmMoonIcon = 6; } else
    if (moonPhase == 'Waning Crescent') { mmMoonIcon = 7; }
    return mmMoonIcon;
};

let splitWeatherDesc = (str) => {
    let result = ['',''];
    if (str && str.length > 0) {
        if (str.length > 30) { str.substring(0, 30); }
        if (str.length < 16) {
            result[0] = str;
        } else {
            let arr = str.split(' ');
            for (let s of arr) {
                if (result[0].length + s.length + 1 < 16) {
                    if (result[0].length > 0) { result[0] = result[0] + ' '; }
                    result[0] = result[0] + s;
                } else {
                    if (result[1].length > 0) { result[1] = result[1] + ' '; }
                    result[1] = result[1] + s;
                }
            }
        }
    }
    return result;
};

forecastDays = [{
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

let getWeatherIconChar = (code, isDay) => {
    let weather = weatherCodeMap.get(code);
    if (weather && weather.iconChar && weather.iconChar.day) {
        // 
    } else {
        weather = weatherCodeMap.get(0b100);
        for (let i = 1; i < 16; i++) {
            let p = 2 ** i;
            // console.log(`2 ** ${i} = ${p}`);
            if ((code | 2 ** i) > 0) {
                weather = weatherCodeMap.get(p);
            }
        }
    }
    // console.log(`${code.toString(2).padStart(16, 0)} : ${weather.iconChar.day}`);
    return isDay ? weather.iconChar.day : weather.iconChar.night;
};

let transTime12to24 = (timeStr) => {
 let hour = parseInt("1" + timeStr.substring(0, 2)) - 100;
 let min  = parseInt("1" + timeStr.substring(3, 5)) - 100;
 let part = timeStr.substring(6, 8);
 if (part == 'pm' || part == 'PM') {
     hour = hour + 12;
 }
 return {hour: hour, min: min};
};

let checkIsDay = (sunrise, sunset) => {
    let now = new Date();
    let hour = now.getHours();
    let min = now.getMinutes();
    if (hour < sunrise.hour || hour > sunset.hour || //
        (hour == sunrise.hour && min < sunrise.min) || //
        (hour == sunset.hour && min > sunset.min)) // 
    {
        return false;
    } else {
        return true;
    }
};

let transForecastFormatFontText = (forecastDays) => {
    // console.log(forecastDays);
    // console.log(forecastDays[0].weatherDesc);
    let weatherStrArr = splitWeatherDesc(forecastDays[0].weatherDesc);
    let sunrise = transTime12to24(forecastDays[0].sunrise);
    let sunset  = transTime12to24(forecastDays[0].sunset );
    let isDay   = checkIsDay(sunrise, sunset);
    let fontStr = '';
    fontStr = fontStr + `${forecastDays[0].location}\n`;
    fontStr = fontStr + `${getWeatherIconChar(forecastDays[0].weatherCode, isDay)}\n`;
    fontStr = fontStr + `${transMoonPhaseFont(forecastDays[0].moonPhase)}\n`;
    fontStr = fontStr + `${forecastDays[0].temp}\n`;
    fontStr = fontStr + `${forecastDays[0].tempBodyFeel}\n`;
    fontStr = fontStr + `${forecastDays[0].tempMin}~${forecastDays[0].tempMax}\n`;
    fontStr = fontStr + `${forecastDays[0].atmPressure}\n`;
    fontStr = fontStr + `${forecastDays[0].windSpeed}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[0].windDir).iconChar}\n`;
    fontStr = fontStr + `${weatherStrArr[0]}\n`;
    fontStr = fontStr + `${weatherStrArr[1]}\n`;
    fontStr = fontStr + `${forecastDays[0].humedPct}%\n`;
    fontStr = fontStr + `${forecastDays[0].preciPct}%\n`;
    fontStr = fontStr + `${`${sunrise.hour}`.padStart(2, '0')}:${`${sunrise.min}`.padStart(2, '0')} ~ ${`${sunset.hour}`.padStart(2, '0')}:${`${sunset.min}`.padStart(2, '0')}\n`;
    fontStr = fontStr + `${forecastDays[1].dayOfWeek.padStart(8, ' ')}  ${forecastDays[2].dayOfWeek.padStart(8, ' ')}  ${forecastDays[3].dayOfWeek.padStart(8, ' ')}  ${forecastDays[4].dayOfWeek.padStart(8, ' ')}\n`;
    fontStr = fontStr + `  ${getWeatherIconChar(forecastDays[1].weatherCode, true)}  ${getWeatherIconChar(forecastDays[2].weatherCode, true)}  ${getWeatherIconChar(forecastDays[3].weatherCode, true)}   ${getWeatherIconChar(forecastDays[4].weatherCode, true)}\n`;
    fontStr = fontStr + `${`${forecastDays[1].preciPct}%`   .padStart(10, ' ')}${`${forecastDays[2].preciPct}%`   .padStart(10, ' ')}${`${forecastDays[3].preciPct}%`   .padStart(10, ' ')}${`${forecastDays[4].preciPct}%`   .padStart(10, ' ')}\n`;
    fontStr = fontStr + `${`${forecastDays[1].windSpeed}Kph`.padStart(10, ' ')}${`${forecastDays[2].windSpeed}Kph`.padStart(10, ' ')}${`${forecastDays[3].windSpeed}Kph`.padStart(10, ' ')}${`${forecastDays[4].windSpeed}Kph`.padStart(10, ' ')}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[1].windDir).iconChar}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[2].windDir).iconChar}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[3].windDir).iconChar}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[4].windDir).iconChar}\n`;
    fontStr = fontStr + `${`${forecastDays[1].tempMax}C`.padStart(10, ' ')}${`${forecastDays[2].tempMax}C`.padStart(10, ' ')}${`${forecastDays[3].tempMax}C`.padStart(10, ' ')}${`${forecastDays[4].tempMax}C`.padStart(10, ' ')}\n`;
    fontStr = fontStr + `${`${forecastDays[1].tempMin}C`.padStart(10, ' ')}${`${forecastDays[2].tempMin}C`.padStart(10, ' ')}${`${forecastDays[3].tempMin}C`.padStart(10, ' ')}${`${forecastDays[4].tempMin}C`.padStart(10, ' ')}\n`;
    // console.log(fontStr);
    return fontStr;
}

windDirtCodeMap.set("N"  ,{"code":"N"  ,"iconChar":"a","name":"North"          ,"angle":  "0.00°"});
windDirtCodeMap.set("NNE",{"code":"NNE","iconChar":"b","name":"North-Northeast","angle": "22.50°"});
windDirtCodeMap.set("NE" ,{"code":"NE" ,"iconChar":"c","name":"Northeast"      ,"angle": "45.00°"});
windDirtCodeMap.set("ENE",{"code":"ENE","iconChar":"d","name":"East-Northeast" ,"angle": "67.50°"});
windDirtCodeMap.set("E"  ,{"code":"E"  ,"iconChar":"e","name":"East"           ,"angle": "90.00°"});
windDirtCodeMap.set("ESE",{"code":"ESE","iconChar":"f","name":"East-Southeast" ,"angle":"112.50°"});
windDirtCodeMap.set("SE" ,{"code":"SE" ,"iconChar":"g","name":"Southeast"      ,"angle":"135.00°"});
windDirtCodeMap.set("SSE",{"code":"SSE","iconChar":"h","name":"South-Southeast","angle":"157.50°"});
windDirtCodeMap.set("S"  ,{"code":"S"  ,"iconChar":"i","name":"South"          ,"angle":"180.00°"});
windDirtCodeMap.set("SSW",{"code":"SSW","iconChar":"j","name":"South-Southwest","angle":"202.50°"});
windDirtCodeMap.set("SW" ,{"code":"SW" ,"iconChar":"k","name":"Southwest"      ,"angle":"225.00°"});
windDirtCodeMap.set("WSW",{"code":"WSW","iconChar":"l","name":"West-Southwest" ,"angle":"247.50°"});
windDirtCodeMap.set("W"  ,{"code":"W"  ,"iconChar":"m","name":"West"           ,"angle":"270.00°"});
windDirtCodeMap.set("WNW",{"code":"WNW","iconChar":"n","name":"West-Northwest" ,"angle":"292.50°"});
windDirtCodeMap.set("NW" ,{"code":"NW" ,"iconChar":"o","name":"Northwest"      ,"angle":"315.00°"});
windDirtCodeMap.set("NNW",{"code":"NNW","iconChar":"p","name":"North-Northwest","angle":"337.50°"});

weatherCodeMap.set(0b0000000000000000, { "code": 0b0000000000000000,"iconChar":{"day":"a","night":"A"},"cn": "晴天", "ens": "Clear", "en": "Clear" });
weatherCodeMap.set(0b0000000000000001, { "code": 0b0000000000000001,"iconChar":{"day":"u","night":"u"},"cn": "霜冻", "ens": "Fozen", "en": "Fozen" });
weatherCodeMap.set(0b0000000000000010, { "code": 0b0000000000000010,"iconChar":{"day":"d","night":"D"},"cn": "雾", "ens": "Fog", "en": "Fog" });
weatherCodeMap.set(0b0000000000000100, { "code": 0b0000000000000100,"iconChar":{"day":"b","night":"B"},"cn": "局部多云", "ens": "Partly Cloudy", "en": "Partly Cloudy" });
weatherCodeMap.set(0b0000000000001000, { "code": 0b0000000000001000,"iconChar":{"day":"c","night":"C"},"cn": "多云", "ens": "Cloudy", "en": "Cloudy" });
weatherCodeMap.set(0b0000000000010000, { "code": 0b0000000000010000,"iconChar":{"day":"q","night":"q"},"cn": "阴天", "ens": "Overcast", "en": "Overcast" });
weatherCodeMap.set(0b0000000000100000, { "code": 0b0000000000100000,"iconChar":{"day":"g","night":"G"},"cn": "小雨", "ens": "Light rain", "en": "Light rain" });
weatherCodeMap.set(0b0000000001000000, { "code": 0b0000000001000000,"iconChar":{"day":"g","night":"G"},"cn": "中雨", "ens": "Moderate rain", "en": "Moderate rain" });
weatherCodeMap.set(0b0000000010000000, { "code": 0b0000000010000000,"iconChar":{"day":"i","night":"I"},"cn": "大雨", "ens": "Heavy rain", "en": "Heavy rain" });
weatherCodeMap.set(0b0000000100000000, { "code": 0b0000000100000000,"iconChar":{"day":"i","night":"I"},"cn": "暴风雨", "ens": "Torrent rain Shwr", "en": "Torrential rain shower" });
weatherCodeMap.set(0b0000001000000000, { "code": 0b0000001000000000,"iconChar":{"day":"Q","night":"Q"},"cn": "小冰雹雨", "ens": "Light sleet Shwr", "en": "Light sleet showers" });
weatherCodeMap.set(0b0000010000000000, { "code": 0b0000010000000000,"iconChar":{"day":"Q","night":"Q"},"cn": "中度或大冰雹雨", "ens": "Mid Hvy sleet Shwr", "en": "Moderate or heavy sleet showers" });
weatherCodeMap.set(0b0000100000000000, { "code": 0b0000100000000000,"iconChar":{"day":"j","night":"J"},"cn": "小雪", "ens": "Light snow", "en": "Light snow" });
weatherCodeMap.set(0b0001000000000000, { "code": 0b0001000000000000,"iconChar":{"day":"j","night":"J"},"cn": "中雪", "ens": "Mid snow", "en": "Moderate snow" });
weatherCodeMap.set(0b0010000000000000, { "code": 0b0010000000000000,"iconChar":{"day":"k","night":"K"},"cn": "大雪", "ens": "Heavy snow", "en": "Heavy snow" });
weatherCodeMap.set(0b0100000000000000, { "code": 0b0100000000000000,"iconChar":{"day":"k","night":"K"},"cn": "暴风雪", "ens": "Blizzard", "en": "Blizzard" });
weatherCodeMap.set(0b1000000000000000, { "code": 0b1000000000000000,"iconChar":{"day":"n","night":"N"},"cn": "雷电", "ens": "Thunder", "en": "Thundery outbreak" });
//
weatherCodeMap.set(0b0000000000000011, { "code": 0b0000000000000011,"iconChar":{"day":"u","night":"u"},"cn": "冻雾", "ens": "Freezing fog", "en": "Freezing fog" });
weatherCodeMap.set(0b0000000000100010, { "code": 0b0000000000100010,"iconChar":{"day":"y","night":"y"},"cn": "微冻雨", "ens": "Light Frez rain", "en": "Light freezing rain" });
weatherCodeMap.set(0b0000000000100011, { "code": 0b0000000000100011,"iconChar":{"day":"y","night":"y"},"cn": "周边有有零星小冻雾雨", "ens": "Ptch Frez Drz nerby", "en": "Patchy freezing drizzle nearby" });
weatherCodeMap.set(0b0000000001000010, { "code": 0b0000000001000010,"iconChar":{"day":"y","night":"y"},"cn": "中度或大冻雨", "ens": "Mid or Hvy Frez rain", "en": "Moderate or heavy freezing rain" });
weatherCodeMap.set(0b0000000001000011, { "code": 0b0000000001000011,"iconChar":{"day":"y","night":"y"},"cn": "冻雾雨", "ens": "Frez drizzle", "en": "Freezing drizzle" });
weatherCodeMap.set(0b0000000010000011, { "code": 0b0000000010000011,"iconChar":{"day":"y","night":"y"},"cn": "大冻雾雨", "ens": "Heavy Frez Drz", "en": "Heavy freezing drizzle" });
weatherCodeMap.set(0b0000000011000000, { "code": 0b0000000011000000,"iconChar":{"day":"h","night":"H"},"cn": "中雨或大阵雨", "ens": "Mid or Hvy rain Shwr", "en": "Moderate or heavy rain shower" });
weatherCodeMap.set(0b0000100000100000, { "code": 0b0000100000100000,"iconChar":{"day":"S","night":"S"},"cn": "周边有零星小雨夹雪", "ens": "Ptch sleet nerby", "en": "Patchy sleet nearby" });
weatherCodeMap.set(0b0011000000000000, { "code": 0b0011000000000000,"iconChar":{"day":"k","night":"K"},"cn": "中度或大阵雪", "ens": "Mid or Hvy snow Shwr", "en": "Moderate or heavy snow showers" });
weatherCodeMap.set(0b0011000000100000, { "code": 0b0011000000100000,"iconChar":{"day":"k","night":"K"},"cn": "中度或大雨夹雪", "ens": "Mid or Hvy sleet", "en": "Moderate or heavy sleet" });
weatherCodeMap.set(0b1000000000100000, { "code": 0b1000000000100000,"iconChar":{"day":"l","night":"L"},"cn": "小雷雨", "ens": "Thundery outbreaks", "en": "Thundery outbreaks in nearby" });
weatherCodeMap.set(0b1000000001000000, { "code": 0b1000000001000000,"iconChar":{"day":"l","night":"L"},"cn": "中到大雷雨", "ens": "Thundery outbreaks", "en": "Thundery outbreaks in nearby" });
weatherCodeMap.set(0b1000000010000000, { "code": 0b1000000010000000,"iconChar":{"day":"l","night":"L"},"cn": "雷区有中或大雨", "ens": "Mid Hvy rain thunder", "en": "Moderate or heavy rain in area with thunder" });
weatherCodeMap.set(0b1000100000000000, { "code": 0b1000100000000000,"iconChar":{"day":"j","night":"J"},"cn": "雷区有零星小雪", "ens": "Ptch light snow thndr", "en": "Patchy light snow in area with thunder" });
weatherCodeMap.set(0b1001000000000000, { "code": 0b1001000000000000,"iconChar":{"day":"k","night":"K"},"cn": "雷区有中或大雪", "ens": "Mid or Hvy snow thndr", "en": "Moderate or heavy snow in area with thunder" });
