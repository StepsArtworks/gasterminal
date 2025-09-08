import React from 'react';
import { ArrowLeft, Map, Users, Settings, Zap } from 'lucide-react';
import { Location } from '../App';

interface NavigationHeaderProps {
  currentLocation: Location | null;
  onBackToMap: () => void;
  viewMode: 'map' | 'panorama';
}

export function NavigationHeader({ currentLocation, onBackToMap, viewMode }: NavigationHeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {viewMode === 'panorama' && (
            <button
              onClick={onBackToMap}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Map</span>
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {currentLocation ? currentLocation.name : 'Terminal Overview'}
              </h1>
              <p className="text-sm text-gray-400">
                {currentLocation ? currentLocation.description : 'North Sea Gas Terminal - Digital Twin'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span>3 collaborators online</span>
          </div>
          
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <Map className="w-4 h-4" />
            <span>Site Map</span>
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}