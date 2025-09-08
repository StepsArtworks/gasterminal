import React, { useState } from 'react';
import { MapView } from './components/MapView';
import { PanoramaViewer } from './components/PanoramaViewer';
import { CollaborationPanel } from './components/CollaborationPanel';
import { NavigationHeader } from './components/NavigationHeader';

export interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'normal' | 'warning' | 'critical';
  imageUrl: string;
  description: string;
  equipment: string[];
  initialRotation?: number;
  connections?: Array<{
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    equipment: string[];
  }>;
}

const mockLocations: Location[] = [
  {
    id: 'entrance',
    name: 'Entrance',
    x: 15,
    y: 55,
    status: 'normal',
    imageUrl: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',
    description: 'Main facility entrance and security checkpoint',
    equipment: ['Security Gate', 'Access Control System', 'Visitor Registration'],
    initialRotation: 0
  },
  {
    id: 'workshop',
    name: 'Workshop',
    x: 29,
    y: 53,
    status: 'normal',
    imageUrl: 'https://images.pexels.com/photos/162568/nuclear-power-plant-cooling-tower-nuclear-power-plant-162568.jpeg',
    description: 'Maintenance and repair workshop facility',
    equipment: ['Workshop', 'Kitchen', 'Offices'],
    initialRotation: 0
  },
  {
    id: 'reception',
    name: 'Reception',
    x: 45,
    y: 53,
    status: 'normal',
    imageUrl: 'https://tbrhub.com/gasterminal/images/reception1.jpg',
    description: 'Reception and administrative area',
    equipment: ['Kitchen', 'Boardroom', 'Offices', 'Control Room'],
    initialRotation: 55,
    connections: [
      {
        id: 'control-room',
        name: 'Control Room',
        imageUrl: 'https://tbrhub.com/gasterminal/images/controlroom1.jpg',
        description: 'Main control room with monitoring systems',
        equipment: ['Control Panels', 'Monitoring Systems', 'SCADA Interface', 'Emergency Controls'],
        initialRotation: 90
      }
    ]
  },
  {
    id: 'ttlr',
    name: 'TTLR',
    x: 70,
    y: 55,
    status: 'warning',
    imageUrl: 'https://tbrhub.com/gasterminal/images/ttlr1.jpg',
    description: 'Terminal Tank Loading Rack facility',
    equipment: ['Loading Arms', 'Flow Meters', 'Safety Systems', 'Control Valves'],
    initialRotation: 120
  },
  {
    id: 'lpg-bullet',
    name: 'LPG Bullet',
    x: 50,
    y: 25,
    status: 'critical',
    imageUrl: 'https://tbrhub.com/gasterminal/images/lpg1.jpg',
    description: 'LPG storage bullet tank system',
    equipment: ['Pressure Vessel', 'Safety Relief Valves', 'Level Indicators', 'Emergency Shutdown'],
    initialRotation: 30
  },
  {
    id: 'utility-building',
    name: 'Utility Building',
    x: 35,
    y: 40,
    status: 'normal',
    imageUrl: 'https://images.pexels.com/photos/162568/nuclear-power-plant-cooling-tower-nuclear-power-plant-162568.jpeg',
    description: 'Utility systems and support equipment',
    equipment: ['MCC Room', 'Water Suppression Room', 'Storage'],
    initialRotation: 0
  }
];

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'panorama'>('map');
  const [collaborators] = useState([
    { id: '1', name: 'Sarah Chen', role: 'Safety Engineer', avatar: 'SC', color: 'bg-blue-500' },
    { id: '2', name: 'Mike Rodriguez', role: 'Operations Manager', avatar: 'MR', color: 'bg-green-500' },
    { id: '3', name: 'Dr. Kim Park', role: 'Process Engineer', avatar: 'KP', color: 'bg-purple-500' }
  ]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setViewMode('panorama');
  };

  const handleBackToMap = () => {
    setViewMode('map');
    setSelectedLocation(null);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <NavigationHeader 
        currentLocation={selectedLocation}
        onBackToMap={handleBackToMap}
        viewMode={viewMode}
      />
      
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          {viewMode === 'map' ? (
            <MapView 
              locations={mockLocations}
              onLocationSelect={handleLocationSelect}
              collaborators={collaborators}
            />
          ) : (
            <PanoramaViewer 
              location={selectedLocation!}
              onBackToMap={handleBackToMap}
            />
          )}
        </div>
        
        <CollaborationPanel 
          collaborators={collaborators}
          currentLocation={selectedLocation}
        />
      </div>
    </div>
  );
}

export default App;