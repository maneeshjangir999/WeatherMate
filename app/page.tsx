"use client"

import type React from "react"

import { useState } from "react"
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Loader2,
  MapPin,
  Search,
  Sun,
  Wind,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Weather data types
interface WeatherData {
  city: string
  country: string
  temperature: number
  feelsLike: number
  condition: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
  activities: string[]
  temperatureCategory: string
}

// Get temperature category
const getTemperatureCategory = (temp: number): string => {
  if (temp < 0) return "Very Cold"
  if (temp < 10) return "Cold"
  if (temp < 15) return "Cool"
  if (temp < 20) return "Mild"
  if (temp < 25) return "Warm"
  if (temp < 30) return "Hot"
  return "Very Hot"
}

// Get temperature icon
const getTemperatureIcon = (temp: number) => {
  if (temp < 10) return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />
  if (temp < 25) return <Thermometer className="h-5 w-5 text-green-500" />
  return <ThermometerSun className="h-5 w-5 text-orange-500" />
}

// Get activities based on temperature
const getActivitiesByTemperature = (temp: number): string[] => {
  if (temp < 0) {
    // Very Cold (below 0°C)
    return [
      "Visit an indoor ice skating rink",
      "Enjoy hot chocolate or mulled wine by the fireplace",
      "Visit a museum or art gallery to stay warm",
      "Try a hot yoga class for warming exercise",
      "Cook a hearty stew or soup at home",
    ]
  } else if (temp < 10) {
    // Cold (0-10°C)
    return [
      "Go for a brisk walk in warm clothing",
      "Visit a cozy café for hot drinks",
      "Explore indoor attractions like museums or aquariums",
      "Try indoor rock climbing or bowling",
      "Visit a local bookstore and find a good read",
    ]
  } else if (temp < 15) {
    // Cool (10-15°C)
    return [
      "Go hiking in light layers",
      "Visit an outdoor market or fair",
      "Explore a botanical garden",
      "Go for a scenic drive with stops at viewpoints",
      "Try outdoor photography in the pleasant weather",
    ]
  } else if (temp < 20) {
    // Mild (15-20°C)
    return [
      "Have a picnic in the park",
      "Go cycling on local trails",
      "Visit an outdoor café or restaurant",
      "Go sightseeing around the city",
      "Try outdoor yoga or tai chi",
    ]
  } else if (temp < 25) {
    // Warm (20-25°C)
    return [
      "Go for a hike in nature",
      "Visit a local farmers' market",
      "Have a barbecue in the park or garden",
      "Go kayaking or paddleboarding if near water",
      "Play outdoor sports like tennis or volleyball",
    ]
  } else if (temp < 30) {
    // Hot (25-30°C)
    return [
      "Go swimming at a local pool or beach",
      "Visit a water park",
      "Have a picnic in a shaded area",
      "Go for an early morning or evening walk",
      "Enjoy ice cream at a local parlor",
    ]
  } else {
    // Very Hot (above 30°C)
    return [
      "Visit an air-conditioned museum or mall",
      "Go swimming or visit a water park",
      "Enjoy frozen treats like ice cream or smoothies",
      "Watch a movie at an indoor theater",
      "Plan indoor activities during the hottest part of the day",
    ]
  }
}

// Weather icon component based on OpenWeatherMap icon code
const WeatherIcon = ({ iconCode }: { iconCode: string }) => {
  // Map OpenWeatherMap icon codes to Lucide icons
  if (iconCode.includes("01")) {
    return <Sun className="h-16 w-16 text-yellow-400" />
  } else if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) {
    return <Cloud className="h-16 w-16 text-gray-400" />
  } else if (iconCode.includes("09") || iconCode.includes("10")) {
    return <CloudRain className="h-16 w-16 text-blue-400" />
  } else if (iconCode.includes("13")) {
    return <CloudSnow className="h-16 w-16 text-sky-200" />
  } else {
    return <Wind className="h-16 w-16 text-gray-400" />
  }
}

// Background gradient based on temperature
const getBackgroundGradient = (temp: number): string => {
  if (temp < 0) {
    return "from-blue-700 to-indigo-600" // Very Cold
  } else if (temp < 10) {
    return "from-blue-600 to-indigo-500" // Cold
  } else if (temp < 15) {
    return "from-blue-500 to-sky-400" // Cool
  } else if (temp < 20) {
    return "from-green-500 to-emerald-400" // Mild
  } else if (temp < 25) {
    return "from-green-400 to-yellow-300" // Warm
  } else if (temp < 30) {
    return "from-yellow-400 to-orange-300" // Hot
  } else {
    return "from-orange-500 to-red-400" // Very Hot
  }
}

// Get temperature badge color
const getTemperatureBadgeColor = (temp: number): string => {
  if (temp < 0) return "bg-blue-700 hover:bg-blue-700"
  if (temp < 10) return "bg-blue-500 hover:bg-blue-500"
  if (temp < 15) return "bg-sky-500 hover:bg-sky-500"
  if (temp < 20) return "bg-green-500 hover:bg-green-500"
  if (temp < 25) return "bg-yellow-500 hover:bg-yellow-500 text-black"
  if (temp < 30) return "bg-orange-500 hover:bg-orange-500"
  return "bg-red-500 hover:bg-red-500"
}

export default function WeatherMate() {
  const [location, setLocation] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async (city: string) => {
    try {
      const apiKey = "17cce50ddd85795945085a5f513e850a"
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("City not found. Please check the spelling and try again.")
        }
        throw new Error("Failed to fetch weather data. Please try again later.")
      }

      const data = await response.json()

      // Round temperature to nearest integer
      const temperature = Math.round(data.main.temp)
      const temperatureCategory = getTemperatureCategory(temperature)

      // Extract relevant data from API response
      const weatherInfo: WeatherData = {
        city: data.name,
        country: data.sys.country,
        temperature: temperature,
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        activities: getActivitiesByTemperature(temperature),
        temperatureCategory: temperatureCategory,
      }

      return weatherInfo
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location.trim()) {
      setError("Please enter a city name")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchWeatherData(location)
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      setWeatherData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 to-blue-100">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-600 to-sky-400 p-4 md:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Background pattern */}
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <Cloud
                key={i}
                className="absolute text-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.4,
                  transform: `scale(${0.5 + Math.random()})`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 container mx-auto flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="h-8 w-8" />
            WeatherMate
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Search Form */}
        <Card className="mb-8 shadow-lg bg-white/90 backdrop-blur-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Find Weather & Temperature-Based Activities</CardTitle>
            <CardDescription>Enter a city name to get personalized activity suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter city name..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-300 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Weather Display */}
        {weatherData && (
          <div className="space-y-6 animate-fadeIn">
            <Card className="overflow-hidden shadow-xl bg-white/90 backdrop-blur-sm border-0 transition-all duration-300 hover:shadow-2xl">
              <div className={`bg-gradient-to-r ${getBackgroundGradient(weatherData.temperature)} p-6 text-white`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      {weatherData.city}
                      <span className="text-sm ml-2 opacity-90">{weatherData.country}</span>
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-5xl font-bold">{weatherData.temperature}°C</p>
                      <Badge className={`ml-2 ${getTemperatureBadgeColor(weatherData.temperature)}`}>
                        {weatherData.temperatureCategory}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">Feels like: {weatherData.feelsLike}°C</p>
                    <p className="capitalize mt-1">{weatherData.description}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <WeatherIcon iconCode={weatherData.icon} />
                    <span className="mt-2 font-medium">{weatherData.condition}</span>
                  </div>
                </div>
                <div className="flex gap-6 mt-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <Cloud className="h-4 w-4" />
                    <span>Humidity: {weatherData.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-4 w-4" />
                    <span>Wind: {weatherData.windSpeed} m/s</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  {getTemperatureIcon(weatherData.temperature)}
                  Temperature-Based Activities
                  <Badge variant="outline" className="ml-1">
                    {weatherData.temperatureCategory}
                  </Badge>
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Perfect activities for {weatherData.temperature}°C weather in {weatherData.city}
                </p>
                <ul className="space-y-3">
                  {weatherData.activities.map((activity, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 transition-all duration-300 hover:shadow-md"
                    >
                      <div
                        className={`bg-gradient-to-r ${getBackgroundGradient(weatherData.temperature)} p-2 rounded-full text-white flex items-center justify-center min-w-[28px] h-7`}
                      >
                        <span className="font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="pt-0.5">{activity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Initial state - no weather data yet */}
        {!weatherData && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-sky-100 p-6 rounded-full">
                <Search className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-700">Enter a city to get weather and activity suggestions</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              We'll recommend activities based on the current temperature in your selected location
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Cloud className="h-10 w-10 text-blue-400" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Fetching weather data...</p>
          </div>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 py-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} WeatherMate | Temperature-Based Activity Suggester</p>
          <p className="text-xs mt-1 text-gray-400">Powered by OpenWeatherMap API</p>
        </div>
      </footer>
    </div>
  )
}
