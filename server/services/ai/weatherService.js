/**
 * @file weatherService.js
 * @description Real-time live weather service for Moroccan cities and global locations
 * Free and instant via wttr.in JSON API
 */

export async function fetchLiveWeather(cityName, lang = 'darija') {
  try {
    const cleanCity = encodeURIComponent(cityName.trim());
    const url = `https://wttr.in/${cleanCity}?format=j1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ReserverDark-AI/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current_condition?.[0];
    if (!current) return null;

    const tempC = current.temp_C;
    const feelsLikeC = current.FeelsLikeC;
    const humidity = current.humidity;
    const windSpeedKm = current.windspeedKmph;
    const desc = current.weatherDesc?.[0]?.value || '';

    // Weather condition translation to Darija / French / Arabic
    let descTranslated = desc;
    if (lang === 'darija' || lang === 'ar') {
      if (/sunny|clear/i.test(desc)) descTranslated = 'مشمس وصافي ☀️';
      else if (/partly cloudy/i.test(desc)) descTranslated = 'مغيم جزئياً ⛅';
      else if (/cloudy|overcast/i.test(desc)) descTranslated = 'مغيم ☁️';
      else if (/rain|drizzle/i.test(desc)) descTranslated = 'كاين الشتاء والخير 🌧️';
      else if (/thunder/i.test(desc)) descTranslated = 'كاين الرعد ⛈️';
      else if (/snow/i.test(desc)) descTranslated = 'كاين الثلج ❄️';
      else if (/fog|mist/i.test(desc)) descTranslated = 'كاين الضباب 🌫️';
    } else if (lang === 'fr') {
      if (/sunny|clear/i.test(desc)) descTranslated = 'Ensoleillé et dégagé ☀️';
      else if (/partly cloudy/i.test(desc)) descTranslated = 'Partiellement nuageux ⛅';
      else if (/cloudy|overcast/i.test(desc)) descTranslated = 'Nuageux ☁️';
      else if (/rain|drizzle/i.test(desc)) descTranslated = 'Pluvieux 🌧️';
    }

    if (lang === 'darija') {
      return `Taqs lyouma f ${cityName}:
- L-7arara: ${tempC}°C (kat-7ess biha bhal ${feelsLikeC}°C)
- L-7ala d s-sma: ${descTranslated}
- R-rtouba (Humidity): ${humidity}%
- S-ser3a d r-ri7: ${windSpeedKm} km/h
Jaw zwin l l-kharja o l-visite dyal l-3aqarat! 😉`;
    }

    if (lang === 'ar') {
      return `أحوال الطقس اليوم في ${cityName}:
- درجة الحرارة: ${tempC}°م (تشعر وكأنها ${feelsLikeC}°م)
- حالة الجو: ${descTranslated}
- نسبة الرطوبة: ${humidity}%
- سرعة الرياح: ${windSpeedKm} كم/ساعة`;
    }

    if (lang === 'fr') {
      return `Météo actuelle à ${cityName} :
- Température : ${tempC}°C (ressenti ${feelsLikeC}°C)
- Ciel : ${descTranslated}
- Humidité : ${humidity}%
- Vent : ${windSpeedKm} km/h`;
    }

    return `Current weather in ${cityName}:
- Temperature: ${tempC}°C (feels like ${feelsLikeC}°C)
- Condition: ${desc}
- Humidity: ${humidity}%
- Wind: ${windSpeedKm} km/h`;
  } catch (err) {
    console.warn('⚠️ Weather fetch failed:', err.message);
    return null;
  }
}
