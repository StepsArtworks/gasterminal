import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';
import { Location } from '../App';

interface MapViewProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  collaborators: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
  }>;
}

export function MapView({ locations, onLocationSelect, collaborators }: MapViewProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const getStatusIcon = (status: Location['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: Location['status']) => {
    switch (status) {
      case 'normal':
        return 'border-green-400 bg-green-400/20';
      case 'warning':
        return 'border-yellow-400 bg-yellow-400/20';
      case 'critical':
        return 'border-red-400 bg-red-400/20 animate-pulse';
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-800">
      {/* Actual Gas Terminal Site Map */}
      <div className="absolute inset-0">
        <img
          src="https://tbrhub.com/gasterminal/images/topview.jpg"
          alt="Gas Terminal Top View"
          className="w-full h-full object-contain"
        />
        
        {/* Subtle overlay for better marker visibility */}
        <div className="absolute inset-0 bg-gray-900/20" />
      </div>

      {/* Location Markers */}
      {locations.map((location) => (
        <div
          key={location.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${location.x}%`, top: `${location.y}%` }}
          onMouseEnter={() => setHoveredLocation(location.id)}
          onMouseLeave={() => setHoveredLocation(null)}
          onClick={() => onLocationSelect(location)}
        >
          {/* Marker */}
          <div className={`
            w-8 h-8 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 hover:scale-110
            ${getStatusColor(location.status)}
            ${hoveredLocation === location.id ? 'scale-110 shadow-lg' : ''}
          `}>
            {getStatusIcon(location.status)}
          </div>
          
          {/* Pulse animation for critical status */}
          {location.status === 'critical' && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
          )}
          
          {/* Location tooltip */}
          {hoveredLocation === location.id && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
              <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl min-w-64">
                <h3 className="font-semibold text-white mb-1">{location.name}</h3>
                <p className="text-sm text-gray-300 mb-2">{location.description}</p>
                <div className="text-xs text-gray-400">
                  <p className="mb-1">Areas:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {location.equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 text-xs text-blue-400">
                  Click to enter 360° view
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Collaborator cursors */}
      {collaborators.map((collaborator, index) => (
        <div
          key={collaborator.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ 
            left: `${30 + index * 15}%`, 
            top: `${40 + index * 10}%`,
            animation: `float 3s ease-in-out infinite ${index * 0.5}s`
          }}
        >
          <div className={`w-6 h-6 rounded-full ${collaborator.color} border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold`}>
            {collaborator.avatar}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {collaborator.name}
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-gray-900/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-white">Status Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Normal Operation</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">Attention Required</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-gray-300">Critical Issue</span>
          </div>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-6 right-6 bg-gray-900/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-1">Scale</div>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-0.5 bg-white"></div>
          <span className="text-xs text-gray-300">100m</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-5px); }
        }
      `}</style>
    </div>
  );
}