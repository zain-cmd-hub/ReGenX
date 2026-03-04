"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import {
  SUSTAINABILITY_DATA,
  GLOBAL_IMPACT_COUNTER,
  generateImpactInsights,
  getLocationData,
  getAllLocations,
  getCityFromCoordinates,
  searchLocations,
  WORLD_COUNTRIES,
  INDIAN_STATES,
  US_STATES,
  WORLD_CITIES,
} from "../lib/sustainabilityData";

// Animated Counter Component - Only animates increments, not full recount (Memoized)
const AnimatedCounter = memo(function AnimatedCounter({ value, duration = 500 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const previousValue = previousValueRef.current;
    const difference = value - previousValue;
    
    // If it's the initial render or no change, just set the value
    if (difference === 0) {
      setDisplayValue(value);
      return;
    }
    
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Animate from previous value to new value
      const currentAnimatedValue = previousValue + Math.floor(progress * difference);
      setDisplayValue(currentAnimatedValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        previousValueRef.current = value;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
      previousValueRef.current = value;
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
});

// Circular Gauge Component (Memoized)
const CircularGauge = memo(function CircularGauge({ value, maxValue = 100, label, color, size = 120, thickness = 8, showGlow = false }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = (animatedValue / maxValue) * 100;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="sustainability-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="gauge-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="gauge-inner">
        <span className="gauge-value" style={{ color }}>{Math.round(animatedValue)}</span>
        <span className="gauge-percent">%</span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
});

// Stat Card Component (Memoized)
const StatCard = memo(function StatCard({ icon, value, unit, label, color, trend, trendValue }) {
  return (
    <div className="sustainability-stat-card" style={{ '--card-accent': color }}>
      <div className="stat-card-icon" style={{ background: `${color}20`, color }}>
        <iconify-icon icon={icon} />
      </div>
      <div className="stat-card-content">
        <div className="stat-card-value">
          <span className="value">{value}</span>
          <span className="unit">{unit}</span>
        </div>
        <span className="stat-card-label">{label}</span>
        {trend && (
          <div className={`stat-card-trend ${trend}`}>
            <iconify-icon icon={trend === 'up' ? 'ph:trend-up-bold' : 'ph:trend-down-bold'} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
});

// Location Card Component (Memoized)
const LocationCard = memo(function LocationCard({ data, isActive, isLocked, onClick }) {
  if (!data) return null;

  return (
    <div 
      className={`location-impact-card ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
      onClick={onClick}
    >
      {isLocked && (
        <div className="locked-badge">
          <iconify-icon icon="ph:map-pin-bold" />
          <span>Your Location</span>
        </div>
      )}
      <div className="location-header">
        <span className="location-flag">{data.flag}</span>
        <div className="location-info">
          <h4>{data.name}</h4>
          {data.country && <span className="location-country">{data.country}</span>}
        </div>
      </div>
      <div className="location-stats">
        <div className="loc-stat">
          <iconify-icon icon="ph:cloud-bold" style={{ color: '#ef4444' }} />
          <span>{data.co2.value} {data.co2.unit}</span>
        </div>
        <div className="loc-stat">
          <iconify-icon icon="ph:drop-bold" style={{ color: '#06b6d4' }} />
          <span>{data.water.value} {data.water.unit}</span>
        </div>
        <div className="loc-stat">
          <iconify-icon icon="ph:trash-bold" style={{ color: '#f97316' }} />
          <span>{data.waste.value} {data.waste.unit}</span>
        </div>
        <div className="loc-stat">
          <iconify-icon icon="ph:recycle-bold" style={{ color: '#22c55e' }} />
          <span>{data.recyclingRate.value}%</span>
        </div>
      </div>
    </div>
  );
});

// AI Insight Card Component (Memoized)
const AIInsightCard = memo(function AIInsightCard({ insight, productType, action }) {
  if (!insight) return null;

  return (
    <div className="ai-insight-card">
      <div className="insight-header">
        <div className="insight-icon">
          <iconify-icon icon="ph:robot-bold" />
        </div>
        <div className="insight-title">
          <h4>AI Impact Report</h4>
          <span>{action === 'recycle' ? 'Recycling' : action === 'repair' ? 'Repairing' : 'Reselling'} this {productType}</span>
        </div>
        <div className="insight-badge">
          <iconify-icon icon="ph:sparkle-bold" />
          AI Powered
        </div>
      </div>
      <div className="insight-metrics">
        <div className="insight-metric co2">
          <iconify-icon icon="ph:cloud-bold" />
          <div className="metric-content">
            <span className="metric-value">{insight.co2} kg</span>
            <span className="metric-label">CO₂ Saved</span>
          </div>
        </div>
        <div className="insight-metric water">
          <iconify-icon icon="ph:drop-bold" />
          <div className="metric-content">
            <span className="metric-value">{insight.water} L</span>
            <span className="metric-label">Water Saved</span>
          </div>
        </div>
        <div className="insight-metric energy">
          <iconify-icon icon="ph:lightning-bold" />
          <div className="metric-content">
            <span className="metric-value">{insight.energy} kWh</span>
            <span className="metric-label">Energy Saved</span>
          </div>
        </div>
        <div className="insight-metric score">
          <iconify-icon icon="ph:chart-pie-slice-bold" />
          <div className="metric-content">
            <span className="metric-value">{insight.circularScore}%</span>
            <span className="metric-label">Circular Score</span>
          </div>
        </div>
      </div>
      <div className="insight-message">
        <iconify-icon icon="ph:lightbulb-bold" />
        <p>{insight.message}</p>
      </div>
    </div>
  );
});

// Main Sustainability Dashboard Component
export default function SustainabilityDashboard({ productType = "electronics", action = "recycle", isVisible = true }) {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('global');
  const [locationData, setLocationData] = useState(SUSTAINABILITY_DATA.global);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [impactCounter, setImpactCounter] = useState(GLOBAL_IMPACT_COUNTER);
  const [insight, setInsight] = useState(null);

  // Get user's current location
  useEffect(() => {
    // Set a faster fallback timeout
    const fallbackTimeout = setTimeout(() => {
      if (isLoadingLocation) {
        const fallback = getLocationData('delhi');
        setUserLocation(fallback);
        setLocationData(fallback);
        setIsLoadingLocation(false);
      }
    }, 3000);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationInfo = await getCityFromCoordinates(latitude, longitude);
            
            if (locationInfo.city) {
              const data = getLocationData(locationInfo.city);
              if (data) {
                setUserLocation(data);
                setSelectedLocation(data.key);
                setLocationData(data);
              }
            }
          } catch (error) {
            console.error('Location detection failed:', error);
            // Fallback to Delhi
            const fallback = getLocationData('delhi');
            setUserLocation(fallback);
            setLocationData(fallback);
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Delhi
          const fallback = getLocationData('delhi');
          setUserLocation(fallback);
          setLocationData(fallback);
          setIsLoadingLocation(false);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      // Fallback if geolocation not available
      const fallback = getLocationData('delhi');
      setUserLocation(fallback);
      setLocationData(fallback);
      setIsLoadingLocation(false);
    }

    return () => clearTimeout(fallbackTimeout);
  }, []);

  // Generate AI insights
  useEffect(() => {
    const insightData = generateImpactInsights(productType, action);
    setInsight(insightData);
  }, [productType, action]);

  // Animate impact counter - optimized with longer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setImpactCounter(prev => ({
        ...prev,
        co2Saved: prev.co2Saved + Math.floor(Math.random() * 3) + 1,
        waterSaved: prev.waterSaved + Math.floor(Math.random() * 10) + 5,
        wasteRecycled: prev.wasteRecycled + Math.floor(Math.random() * 2) + 1,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle location change
  const handleLocationChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedLocation(value);
    
    // Use the new getLocationData that supports all world locations
    const data = getLocationData(value);
    if (data) {
      setLocationData(data);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sustainability-dashboard">
      {/* Global Impact Counter Banner */}
      <div className="global-impact-counter-section">
        <div className="counter-header">
          <iconify-icon icon="ph:globe-hemisphere-west-bold" />
          <h3>Global Impact by ReGenX Community</h3>
          <span className="live-indicator">
            <span className="pulse"></span>
            Live
          </span>
        </div>
        <div className="counter-grid">
          <div className="counter-card co2">
            <iconify-icon icon="ph:cloud-bold" />
            <div className="counter-content">
              <span className="counter-value">
                <AnimatedCounter value={impactCounter.co2Saved} />
              </span>
              <span className="counter-unit">kg</span>
            </div>
            <span className="counter-label">CO₂ Saved</span>
          </div>
          <div className="counter-card water">
            <iconify-icon icon="ph:drop-bold" />
            <div className="counter-content">
              <span className="counter-value">
                <AnimatedCounter value={impactCounter.waterSaved} />
              </span>
              <span className="counter-unit">L</span>
            </div>
            <span className="counter-label">Water Saved</span>
          </div>
          <div className="counter-card waste">
            <iconify-icon icon="ph:recycle-bold" />
            <div className="counter-content">
              <span className="counter-value">
                <AnimatedCounter value={impactCounter.wasteRecycled} />
              </span>
              <span className="counter-unit">kg</span>
            </div>
            <span className="counter-label">Waste Recycled</span>
          </div>
          <div className="counter-card users">
            <iconify-icon icon="ph:users-bold" />
            <div className="counter-content">
              <span className="counter-value">
                <AnimatedCounter value={impactCounter.usersContributing} />
              </span>
              <span className="counter-unit">+</span>
            </div>
            <span className="counter-label">Contributors</span>
          </div>
        </div>
      </div>

      {/* Current Location Section */}
      <div className="location-section">
        <div className="section-header">
          <div className="header-left">
            <iconify-icon icon="ph:map-pin-bold" />
            <h3>Your Environmental Impact Zone</h3>
          </div>
          <div className="location-selector">
            <iconify-icon icon="ph:globe-bold" />
            <select value={selectedLocation} onChange={handleLocationChange}>
              <optgroup label="🌍 Global">
                <option value="global">🌍 Global</option>
              </optgroup>
              <optgroup label="🌏 Asia">
                <option value="india">🇮🇳 India</option>
                {Object.entries(WORLD_COUNTRIES)
                  .filter(([_, c]) => c.continent === 'Asia' && c.name !== 'India')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, country]) => (
                    <option key={key} value={key}>{country.flag} {country.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🌍 Europe">
                {Object.entries(WORLD_COUNTRIES)
                  .filter(([_, c]) => c.continent === 'Europe')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, country]) => (
                    <option key={key} value={key}>{country.flag} {country.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🌎 North America">
                {Object.entries(WORLD_COUNTRIES)
                  .filter(([_, c]) => c.continent === 'North America')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, country]) => (
                    <option key={key} value={key}>{country.flag} {country.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🌎 South America">
                {Object.entries(WORLD_COUNTRIES)
                  .filter(([_, c]) => c.continent === 'South America')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, country]) => (
                    <option key={key} value={key}>{country.flag} {country.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🌍 Africa">
                {Object.entries(WORLD_COUNTRIES)
                  .filter(([_, c]) => c.continent === 'Africa')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, country]) => (
                    <option key={key} value={key}>{country.flag} {country.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🌏 Oceania">
                {Object.entries(WORLD_COUNTRIES)
                  .filter(([_, c]) => c.continent === 'Oceania')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, country]) => (
                    <option key={key} value={key}>{country.flag} {country.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🇮🇳 Indian States & UTs">
                {Object.entries(INDIAN_STATES)
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, state]) => (
                    <option key={key} value={key}>{state.flag} {state.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🇺🇸 US States">
                {Object.entries(US_STATES)
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, state]) => (
                    <option key={key} value={key}>{state.flag} {state.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ Indian Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => c.country === 'india')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ US Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => c.country === 'usa')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ China Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => c.country === 'china')
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ European Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => ['uk', 'germany', 'france', 'italy', 'spain', 'netherlands', 'sweden', 'norway', 'denmark', 'finland', 'switzerland', 'austria', 'portugal', 'greece', 'poland', 'czechia', 'hungary', 'romania', 'ireland', 'russia', 'ukraine'].includes(c.country))
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ Middle East Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => ['uae', 'saudiArabia', 'qatar', 'iran', 'turkey', 'israel', 'lebanon', 'jordan', 'kuwait', 'oman', 'bahrain'].includes(c.country))
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ Southeast Asia Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => ['singapore', 'malaysia', 'thailand', 'indonesia', 'philippines', 'vietnam', 'myanmar', 'cambodia', 'taiwan'].includes(c.country))
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🏙️ Other Major Cities">
                {Object.entries(WORLD_CITIES)
                  .filter(([_, c]) => ['japan', 'southKorea', 'australia', 'canada', 'brazil', 'argentina', 'mexico', 'southAfrica', 'egypt', 'nigeria', 'kenya', 'newZealand'].includes(c.country))
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([key, city]) => (
                    <option key={key} value={key}>{city.flag} {city.name}</option>
                  ))
                }
              </optgroup>
            </select>
          </div>
        </div>

        {/* Location Cards */}
        <div className="location-cards-grid">
          {isLoadingLocation ? (
            <div className="loading-location">
              <div className="loading-spinner"></div>
              <span>Detecting your location...</span>
            </div>
          ) : (
            <>
              {userLocation && (
                <LocationCard 
                  data={userLocation} 
                  isActive={selectedLocation === userLocation.key}
                  isLocked={true}
                  onClick={() => {
                    setSelectedLocation(userLocation.key);
                    setLocationData(userLocation);
                  }}
                />
              )}
              <LocationCard 
                data={{ ...SUSTAINABILITY_DATA.india, type: 'country', key: 'india' }}
                isActive={selectedLocation === 'india'}
                onClick={() => {
                  setSelectedLocation('india');
                  setLocationData({ ...SUSTAINABILITY_DATA.india, type: 'country', key: 'india' });
                }}
              />
              <LocationCard 
                data={{ ...SUSTAINABILITY_DATA.global, type: 'global', key: 'global' }}
                isActive={selectedLocation === 'global'}
                onClick={() => {
                  setSelectedLocation('global');
                  setLocationData({ ...SUSTAINABILITY_DATA.global, type: 'global', key: 'global' });
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Sustainability Meters */}
      <div className="sustainability-meters-section">
        <div className="section-header">
          <iconify-icon icon="ph:chart-donut-bold" />
          <h3>Sustainability Metrics</h3>
          <span className="location-badge">
            {locationData?.flag} {locationData?.name}
          </span>
        </div>

        <div className="meters-grid">
          <div className="meter-card">
            <CircularGauge 
              value={locationData?.recyclingRate?.value || 0}
              maxValue={100}
              label="Recycling Rate"
              color="#22c55e"
              size={140}
            />
            <p className="meter-description">Percentage of waste properly recycled</p>
          </div>
          <div className="meter-card">
            <CircularGauge 
              value={locationData?.circularIndex?.value || 0}
              maxValue={100}
              label="Circular Economy"
              color="#3b82f6"
              size={140}
            />
            <p className="meter-description">Materials kept in circulation</p>
          </div>
          <div className="meter-card">
            <CircularGauge 
              value={locationData?.energyRenewable?.value || 0}
              maxValue={100}
              label="Renewable Energy"
              color="#f59e0b"
              size={140}
            />
            <p className="meter-description">Clean energy usage rate</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="stats-grid">
          <StatCard 
            icon="ph:cloud-bold"
            value={locationData?.co2?.value || 0}
            unit={locationData?.co2?.unit || ''}
            label="CO₂ Emissions"
            color="#ef4444"
            trend="down"
            trendValue="2.3%"
          />
          <StatCard 
            icon="ph:drop-bold"
            value={locationData?.water?.value || 0}
            unit={locationData?.water?.unit || ''}
            label="Water Consumption"
            color="#06b6d4"
            trend="down"
            trendValue="1.8%"
          />
          <StatCard 
            icon="ph:trash-bold"
            value={locationData?.waste?.value || 0}
            unit={locationData?.waste?.unit || ''}
            label="Waste Generated"
            color="#f97316"
            trend="up"
            trendValue="0.5%"
          />
          <StatCard 
            icon="ph:recycle-bold"
            value={locationData?.recyclingRate?.value || 0}
            unit="%"
            label="Recycling Rate"
            color="#22c55e"
            trend="up"
            trendValue="4.2%"
          />
        </div>
      </div>

      {/* AI Sustainability Insights */}
      <div className="ai-insights-section">
        <div className="section-header">
          <iconify-icon icon="ph:sparkle-bold" />
          <h3>AI Sustainability Insights</h3>
        </div>
        <AIInsightCard 
          insight={insight}
          productType={productType}
          action={action}
        />
      </div>
    </div>
  );
}
