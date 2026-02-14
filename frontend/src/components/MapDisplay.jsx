import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// แก้ปัญหา icon ของ Leaflet ใน React ไม่ขึ้น
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapDisplay = ({ chain }) => {
  // กรองเอาเฉพาะ Block ที่มีข้อมูล Location
  const locations = chain
    .filter(block => block.data.location && block.data.location.lat)
    .map(block => ({
      lat: block.data.location.lat,
      lng: block.data.location.lng,
      info: `Block #${block.index}: ${block.data.status} (${block.data.location.address})`
    }));

  // ถ้าไม่มีข้อมูล ให้ Default ไปที่กรุงเทพ
  const center = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [13.7563, 100.5018];
  
  // เส้นทาง (Polyline)
  const route = locations.map(loc => [loc.lat, loc.lng]);

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-md border border-gray-200 mt-6 z-0 relative">
      <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* วาดจุด (Marker) */}
        {locations.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lng]}>
            <Popup>{loc.info}</Popup>
          </Marker>
        ))}

        {/* วาดเส้นเชื่อม (Route) */}
        <Polyline positions={route} color="blue" />
      </MapContainer>
    </div>
  );
};

export default MapDisplay;