# 天气预报

## 数据来源

把两个网站上能拿的天气数据整合一下，报出包括当天在内的五天气象数据：

* 网站：`https://openweathermap.org/forecast5`
* 网站：`https://www.weatherapi.com/docs/`

### OpenWeatherMap

代码在`javascript/utils/openweathermap.js`。

#### 按城市名查经纬度坐标

方法`queryCityCord()`按城市名查经纬度，结果缓存在映射`cityMap`中，
格式为：

* key：`${rec.country}-${rec.name}`
* value：`{ country: "...", city: "...", lat: 0.00, lon: 0.00 })`

#### 查询天气

方法`fetchForecast(appKey, lat, lon)`的作用：

* 跟据经纬度查询天气预报。
* 返回的天气信息数据格式转换为本应用的天气格式。

### WeatherApi

方法`fetchForecast(appKey, cityName, days)`按城市和日期取天气信息。
并把第三方网站的信息格式转为本应用的信息格式。

## 数据格式

### 天气图标

#### 风向图标

风向图标使用的是字体`Arrows`：

| 风向              | 代码  | 图标 |
|-----|-----|-----|
| "North"           | "N"   | "a" |
| "North-Northeast" | "NNE" | "b" |
| "Northeast"       | "NE"  | "c" |
| "East-Northeast"  | "ENE" | "d" |
| "East"            | "E"   | "e" |
| "East-Southeast"  | "ESE" | "f" |
| "Southeast"       | "SE"  | "g" |
| "South-Southeast" | "SSE" | "h" |
| "South"           | "S"   | "i" |
| "South-Southwest" | "SSW" | "j" |
| "Southwest"       | "SW"  | "k" |
| "West-Southwest"  | "WSW" | "l" |
| "West"            | "W"   | "m" |
| "West-Northwest"  | "WNW" | "n" |
| "Northwest"       | "NW"  | "o" |
| "North-Northwest" | "NNW" | "p" |

#### 气象图标

气象图标使用自制字体`icomoonweatherjade3`。天气使用二进制占位符，方便多种天气组合：

| 二进制代码  | 白天图标 | 夜晚图标 | 天气  |
|----------------------|-----|-----|----------------|
| `0b0000000000000000` | "a" | "A" | "晴天"           |
| `0b0000000000000001` | "u" | "u" | "霜冻"           |
| `0b0000000000000010` | "d" | "D" | "雾"            |
| `0b0000000000000100` | "b" | "B" | "局部多云"         |
| `0b0000000000001000` | "c" | "C" | "多云"           |
| `0b0000000000010000` | "q" | "q" | "阴天"           |
| `0b0000000000100000` | "g" | "G" | "小雨"           |
| `0b0000000001000000` | "g" | "G" | "中雨"           |
| `0b0000000010000000` | "i" | "I" | "大雨"           |
| `0b0000000100000000` | "i" | "I" | "暴风雨"          |
| `0b0000001000000000` | "Q" | "Q" | "小冰雹雨"         |
| `0b0000010000000000` | "Q" | "Q" | "中度或大冰雹雨"      |
| `0b0000100000000000` | "j" | "J" | "小雪"           |
| `0b0001000000000000` | "j" | "J" | "中雪"           |
| `0b0010000000000000` | "k" | "K" | "大雪"           |
| `0b0100000000000000` | "k" | "K" | "暴风雪"          |
| `0b1000000000000000` | "n" | "N" | "雷电"           |
