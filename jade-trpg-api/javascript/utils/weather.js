let httpServer = require('../common/simpleHTTPServer');
let weatherAPI = require('./weatherapi.js');
const https = require('https');

let forecastDays = [];
let weatherCodeMap  = new Map();
let windDirtCodeMap = new Map();

exports.handler = {
    "/api/weather/forecast": async (context, data) => {
        let result = { status: 'err' };
        let appKey = data.params.appKey ? data.params.appKey : "";
        let cityName = data.params.cityName ? data.params.cityName : "Shanghai";
        let days = data.params.days ? data.params.days : "5";
        // https://api.openweathermap.org/data/2.5/forecast?lat=31.18&lon=121.43&units=metric&mode=json&appid=48afd2aa7f47491dc494e13f8e7b5db5
        // https://openweathermap.org/forecast5

        if (appKey && appKey.length > 6) {
            result = await weatherAPI.fetchForecast(appKey, cityName, days);
            result.fontStr = transForecastFormatFontText(result.forecastDays);
            context.response.writeHead(200, {
                // 'Content-Type': 'application/json',
                'Content-Type': 'text/plan',
                'Cache-Control': 'public,s-maxage=300,max-age=300',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST',
                'Access-Control-Allow-Headers': 'x-requested-with,content-type'
            });
            // context.response.end(JSON.stringify(result));
            context.response.end(result.fontStr);
            /*
            const buffers = [];
            let body = null;
            let request = https.get(url, (res) => {
                if (res.statusCode != 200) {
                    console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
                    context.response.writeHead(404, {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public,s-maxage=300,max-age=300',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,POST',
                        'Access-Control-Allow-Headers': 'x-requested-with,content-type'
                    });
                    result.msg = `Did not get an OK from the server. Code: ${res.statusCode}`;
                    context.response.end(JSON.stringify(result));
                }
                res.on('data', (chunk) => { buffers.push(chunk); });
                res.on('close', () => {
                    body = Buffer.concat(buffers);
                    // console.log('Retrieved all data');
                    if (res.statusCode == 200) {
                        context.response.writeHead(200, {
                            // 'Content-Type': 'application/json',
                            'Content-Type': 'text/pain',
                            'Cache-Control': 'public,s-maxage=300,max-age=300',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,POST',
                            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
                        });
                    }
                    let dataStr = body.toString('utf8');
                    result.oriData = JSON.parse(dataStr);
                    result.fontStr = transForecastFormatFontText(result.oriData);
                    // context.response.end(JSON.stringify(result));
                    context.response.end(result.fontStr);
                });
            });
            */
        } else {
            if (res.statusCode != 200) {
                console.error(`miss app key `);
                context.response.writeHead(404, {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public,s-maxage=300,max-age=300',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST',
                    'Access-Control-Allow-Headers': 'x-requested-with,content-type'
                });
                result.msg = 'miss appKey'
                context.response.end(JSON.stringify(result));
            }
        }
    }
};


weatherCodeMap.set(1000000,{"code":1000000,"iconChar":{"day":"a","night":"K"},"cn":"晴天","ens":"Clear"             ,"en":"Clear"                          });
weatherCodeMap.set(1000001,{"code":1000001,"iconChar":{"day":"c","night":"m"},"cn":"多云","ens":"Cloudy"            ,"en":"Cloudy"                         });
weatherCodeMap.set(1000002,{"code":1000002,"iconChar":{"day":"d","night":"n"},"cn":"阴天","ens":"Overcast"          ,"en":"Overcast"                       });
weatherCodeMap.set(1000010,{"code":1000010,"iconChar":{"day":"e","night":"o"},"cn":"小雾","ens":"Light Fog"         ,"en":"Light Fog"                      });
weatherCodeMap.set(1000020,{"code":1000020,"iconChar":{"day":"e","night":"o"},"cn":"中雾","ens":"Moderate Fog"      ,"en":"Moderate Fog"                   });
weatherCodeMap.set(1000030,{"code":1000030,"iconChar":{"day":"e","night":"o"},"cn":"大雾","ens":"Heavy Fog"         ,"en":"Heavy Fog"                      });
weatherCodeMap.set(1000100,{"code":1000100,"iconChar":{"day":"g","night":"q"},"cn":"小雨","ens":"Light rain"        ,"en":"Light rain"                     });
weatherCodeMap.set(1000200,{"code":1000200,"iconChar":{"day":"h","night":"r"},"cn":"中雨","ens":"Moderate rain"     ,"en":"Moderate rain"                  });
weatherCodeMap.set(1000300,{"code":1000300,"iconChar":{"day":"h","night":"r"},"cn":"大雨","ens":"Heavy rain"        ,"en":"Heavy rain"                     });
weatherCodeMap.set(1001000,{"code":1001000,"iconChar":{"day":"k","night":"u"},"cn":"小雪","ens":"Light snow"        ,"en":"Light snow"                     });
weatherCodeMap.set(1002000,{"code":1002000,"iconChar":{"day":"k","night":"u"},"cn":"中雪","ens":"Mid snow"          ,"en":"Moderate snow"                  });
weatherCodeMap.set(1003000,{"code":1003000,"iconChar":{"day":"k","night":"u"},"cn":"大雪","ens":"Heavy snow"        ,"en":"Heavy snow"                     });
weatherCodeMap.set(1010000,{"code":1010000,"iconChar":{"day":"h","night":"r"},"cn":"冰雹","ens":"Mid Hvy sleet Shwr","en":"Moderate or heavy sleet showers"});
weatherCodeMap.set(1020000,{"code":1020000,"iconChar":{"day":"h","night":"r"},"cn":"雷电","ens":"Thundery outbreaks","en":"Thundery outbreaks in nearby"   });
weatherCodeMap.set(1030000,{"code":1030000,"iconChar":{"day":"j","night":"t"},"cn":"霜冻","ens":"Frozen Ice"        ,"en":"Frozen Ice"                     });

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

let transMoonPhaseFont = (moonPhase) => {
    let mmMoonIcon = 5;
    if (moonPhase == 'New Moon'       ) { mmMoonIcon = 8; } else
    if (moonPhase == 'Waxing Crescent') { mmMoonIcon = 7; } else
    if (moonPhase == 'First Quarter'  ) { mmMoonIcon = 5; } else
    if (moonPhase == 'Waxing Gibbous' ) { mmMoonIcon = 3; } else
    if (moonPhase == 'Full Moon'      ) { mmMoonIcon = 1; } else
    if (moonPhase == 'Waning Gibbous' ) { mmMoonIcon = 3; } else
    if (moonPhase == 'Last Quarter'   ) { mmMoonIcon = 5; } else
    if (moonPhase == 'Waning Crescent') { mmMoonIcon = 7; }
    return mmMoonIcon;
};

let splitWeatherDesc = (str) => {
    let result = ['',''];
    if (str) {
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

let transForecastFormatFontText = (forecastDays) => {
    console.log(forecastDays);
    let weatherStrArr = splitWeatherDesc(forecastDays[0].weatherDesc);
    let fontStr = '';
    fontStr = fontStr + `${forecastDays[0].location}\n`;
    fontStr = fontStr + `${weatherCodeMap.get(forecastDays[0].weatherCode).iconChar.day}\n`;
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
    fontStr = fontStr + `${forecastDays[0].sunrise} ~ ${forecastDays[0].sunset}\n`;
    fontStr = fontStr + `${forecastDays[1].dayOfWeek.padStart(8, ' ')}  ${forecastDays[2].dayOfWeek.padStart(8, ' ')}  ${forecastDays[3].dayOfWeek.padStart(8, ' ')}  ${forecastDays[4].dayOfWeek.padStart(8, ' ')}\n`;
    fontStr = fontStr + `  ${weatherCodeMap.get(forecastDays[1].weatherCode).iconChar.day}  ${weatherCodeMap.get(forecastDays[2].weatherCode).iconChar.day}   ${weatherCodeMap.get(forecastDays[3].weatherCode).iconChar.day}   ${weatherCodeMap.get(forecastDays[4].weatherCode).iconChar.day}\n`;
    fontStr = fontStr + `${`${forecastDays[1].preciPct}%`   .padStart(10, ' ')}${`${forecastDays[2].preciPct}%`   .padStart(10, ' ')}${`${forecastDays[3].preciPct}%`   .padStart(10, ' ')}${`${forecastDays[4].preciPct}%`   .padStart(10, ' ')}\n`;
    fontStr = fontStr + `${`${forecastDays[1].windSpeed}Kph`.padStart(10, ' ')}${`${forecastDays[2].windSpeed}Kph`.padStart(10, ' ')}${`${forecastDays[3].windSpeed}Kph`.padStart(10, ' ')}${`${forecastDays[4].windSpeed}Kph`.padStart(10, ' ')}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[1].windDir).iconChar}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[2].windDir).iconChar}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[3].windDir).iconChar}\n`;
    fontStr = fontStr + `${windDirtCodeMap.get(forecastDays[4].windDir).iconChar}\n`;
    fontStr = fontStr + `${`${forecastDays[1].tempMax}C`.padStart(10, ' ')}${`${forecastDays[2].tempMax}C`.padStart(10, ' ')}${`${forecastDays[3].tempMax}C`.padStart(10, ' ')}${`${forecastDays[4].tempMax}C`.padStart(10, ' ')}\n`;
    fontStr = fontStr + `${`${forecastDays[1].tempMin}C`.padStart(10, ' ')}${`${forecastDays[2].tempMin}C`.padStart(10, ' ')}${`${forecastDays[3].tempMin}C`.padStart(10, ' ')}${`${forecastDays[4].tempMin}C`.padStart(10, ' ')}\n`;
    console.log(fontStr);
    return fontStr;
}