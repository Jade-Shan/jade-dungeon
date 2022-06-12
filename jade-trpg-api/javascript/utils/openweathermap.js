const https = require('https');
const http = require('http');
const { map } = require('lodash');

// https://api.openweathermap.org/data/2.5/forecast?lat=31.18&lon=121.43&units=metric&mode=json&appid=48afd2aa7f47491dc494e13f8e7b5db5
// https://openweathermap.org/forecast5
// query city
// https://openweathermap.org/api/geocoding-api

const CALL_ITV = 1000 * 60 * 60;
let lastUpdateTime = 0;
let lastCache = undefined;

let weatherCode3rdMap = new Map();

let createEmptyRecs = () => {
    return [{
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

let cityMap = new Map();

let queryCityCord = async (appKey, cityName) => {
    let result = { status: "err", msg: "unknow err" };
    let pms = new Promise((resolve, reject) => {
        const buffers = [];
        let body = null;
        let request = http.get(
            `http://api.openweathermap.org/geo/1.0/direct?appid=${appKey}&q=${cityName}&limit=5`,
            (res) => {
                if (res.statusCode != 200) { reject(`Server HTTP Err Code: ${res.statusCode}`); }
                res.on('data', (chunk) => { buffers.push(chunk); });
                res.on('close', () => {
                    let str = Buffer.concat(buffers).toString('utf8');
                    try { resolve(JSON.parse(str)); } catch (e) { reject(`parse json err: ${str}`); }
                });
            });
    });
    await pms.then((data) => {
        let tmpMap = new Map();
        for (let rec of data) {
            if (!tmpMap.has(`${rec.country}-${rec.name}`)) {
                tmpMap.set(`${rec.country}-${rec.name}`,
                    { country: rec.country, city: rec.name, lat: rec.lat, lon: rec.lon });
            }
        }
        for (let k of tmpMap) { cityMap.set(k[0], k[1]); }
        // console.log(cityMap);
    }).catch((e) => { console.log(e); });
};


let fetchForecastData = async (appKey, lat, lon) => {
    let result = { status: "err", msg: "unknow err" };
    let pms = new Promise((resolve, reject) => {
        const buffers = [];
        let body = null;
        let request = https.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&mode=json&appid=${appKey}`,
            (res) => {
                if (res.statusCode != 200) { reject(`Server HTTP Err Code: ${res.statusCode}`); }
                res.on('data', (chunk) => { buffers.push(chunk); });
                res.on('close', () => {
                    let str = Buffer.concat(buffers).toString('utf8');
                    try {
                        let json = JSON.parse(str);
                        if ('200' == json.cod) {
                            resolve(json); 
                        } else {
                            reject(str);
                        }
                    } catch (e) { reject(`parse json err: ${str}`); }
                });
            });
    });
    await pms.then((data) => {
        result = { status: 'success', msg: '', oriData: data };
        // console.log(result);
    }).catch((e) => {
        result.msg = e;
    });
    return result;
};

weatherCode3rdMap.set('01', { "code": 0b0000000000000000, "cn": "晴天", "ens": "Clear", "en": "Clear" });
weatherCode3rdMap.set('50', { "code": 0b0000000000000010, "cn": "雾", "ens": "Fog", "en": "Fog" });
weatherCode3rdMap.set('02', { "code": 0b0000000000000100, "cn": "局部多云", "ens": "Partly Cloudy", "en": "Partly Cloudy" });
weatherCode3rdMap.set('03', { "code": 0b0000000000001000, "cn": "多云", "ens": "Cloudy", "en": "Cloudy" });
weatherCode3rdMap.set('04', { "code": 0b0000000000010000, "cn": "阴天", "ens": "Overcast", "en": "Overcast" });
weatherCode3rdMap.set('09', { "code": 0b0000000000100000, "cn": "小雨", "ens": "Light rain", "en": "Light rain" });
weatherCode3rdMap.set('10', { "code": 0b0000000001000000, "cn": "大雨", "ens": "Heavy rain", "en": "Heavy rain" });
weatherCode3rdMap.set('11', { "code": 0b1000000001000000, "cn": "周边有雷雨", "ens": "Thundery outbreaks", "en": "Thundery outbreaks in nearby" });
weatherCode3rdMap.set('13', { "code": 0b0001000000000000, "cn": "飞雪", "ens": "Blowing snow", "en": "Blowing snow" });

let transWindDir = (deg) => {
    if (deg < 22.50)       { return "N"  ; }
    else if (deg <  45.00) { return "NNE"; }
    else if (deg <  67.50) { return "NE" ; } 
    else if (deg <  90.00) { return "ENE"; } 
    else if (deg < 112.50) { return "E"  ; } 
    else if (deg < 135.00) { return "ESE"; } 
    else if (deg < 157.50) { return "SE" ; } 
    else if (deg < 180.00) { return "SSE"; } 
    else if (deg < 202.50) { return "S"  ; } 
    else if (deg < 225.00) { return "SSW"; } 
    else if (deg < 247.50) { return "SW" ; } 
    else if (deg < 270.00) { return "WSW"; } 
    else if (deg < 292.50) { return "W"  ; } 
    else if (deg < 315.00) { return "WNW"; }
    else if (deg < 337.50) { return "NW" ; }
    else                   { return "NNW"; }
};
let dayOfWeekArr = ['Sun', 'Mon', 'Thu', 'Wed', 'Thu', 'Fir', 'Sat'];

let groupForecastByDay = (dayMap, rec) => {
    let date = new Date();
    let year  = parseInt(rec.dt_txt.substring(0,  4));
    let month = parseInt(rec.dt_txt.substring(5,  7));
    let day   = parseInt(rec.dt_txt.substring(8, 10));
    date.setFullYear(year, month -1, day);
    let dayStr = `${year}-${month}-${day}`;
    let dayOfWeek = dayOfWeekArr[date.getDay()];
    let data = dayMap.has(dayStr) ? dayMap.get(dayStr) : { date: "", dayOfWeek: "",
        weatherCode: 0, preciPct: 0, tempMin: 255, tempMax: -255, windSpeed: 0, windDir: 'N' };
    data.date = dayStr;
    data.dayOfWeek = dayOfWeek;
    let ccode = getWeatherCode(rec.weather[0].icon.substring(0,2));
    // console.log(`${data.weatherCode} | ${ccode} = ${data.weatherCode | ccode} `);
    data.weatherCode = data.weatherCode | ccode;
    data.preciPct = data.preciPct > rec.pop * 100 ? data.preciPct : rec.pop * 100;
    data.tempMin = data.tempMin < rec.main.temp_max ? data.tempMin : rec.main.temp_min;
    data.tempMax = data.tempMax > rec.main.temp_max ? data.tempMax : rec.main.temp_max;
    data.windSpeed = data.windSpeed > rec.wind.speed ? data.windSpeed : rec.wind.speed;
    data.windDir = transWindDir(rec.wind.deg);
    dayMap.set(dayStr, data);
};

let getWeatherCode = (code3rd) => {
    let ccode = weatherCode3rdMap.get(code3rd);
    if (ccode) {
        return ccode;
    } else {
        console.log(`miss code ${ccode}`);
        return 0b0000000000000100;
    }
};

let groupForecastByDays = (oriData) => {
    let dayMap = new Map();
    if (oriData && oriData.list && oriData.list.length > 0) {
        for (let rec of oriData.list) {
            // console.log(rec);
            groupForecastByDay(dayMap, rec);
        }
        let forecastDayList = [];
        for (let day of dayMap) {
            forecastDayList.push(day[1]);
        }
        // console.log(forecastDayList);
        return forecastDayList;
    } else {
        return createEmptyRecs();
    }
};


exports.fetchForecast = async (appKey, lat, lon) => {
    let now = (new Date()).getTime();
    if (!lastCache || now - CALL_ITV - lastUpdateTime > 0) {
        let result = await fetchForecastData(appKey, lat, lon);
        if ('success' == result.status) {
            lastCache = result.oriData;
            lastUpdateTime = now;
            return groupForecastByDays(result.oriData);
        } else {
            return groupForecastByDays(createEmptyRecs());
        }
    } else {
        return groupForecastByDays(lastCache);
    }
};
