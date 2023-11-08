import { block } from 'million/react';
import { useState, useEffect } from 'react';

const LocationComponent = block(() => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
        },
        () => {
          setError('Error getting user location');
        },
      );
    } else {
      setError('Geolocation is not available in this browser.');
    }
  }, []);

  return (
    <div>
      <h1>User Location</h1>
      {latitude !== null && longitude !== null ? (
        <div>
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
        </div>
      ) : (
        <p>{error || 'Loading...'}</p>
      )}
    </div>
  );
});

export default LocationComponent;
