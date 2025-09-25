import React, { useState } from 'react';
import { MessageSquare, Users, Video, Mic, MicOff, VideoOff, Phone, Share2 } from 'lucide-react';
import { Location } from '../App';

interface CollaborationPanelProps {
  collaborators: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
  }>;
  currentLocation: Location | null;
}

export function CollaborationPanel({ collaborators, currentLocation }: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Prevent text selection during panorama drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [messages] = useState([
    {
      id: '1',
      author: 'Sarah Chen',
      text: 'I can see the pressure readings are elevated here',
      timestamp: '2:34 PM',
      avatar: 'SC',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      author: 'Mike Rodriguez',
      text: 'Agreed, we should schedule a maintenance check',
      timestamp: '2:35 PM',
      avatar: 'MR',
      color: 'bg-green-500'
    },
    {
      id: '3',
      author: 'Dr. Kim Park',
      text: 'I can review the historical data to identify patterns',
      timestamp: '2:36 PM',
      avatar: 'KP',
      color: 'bg-purple-500'
    }
  ]);

  return (
    <div 
      className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', MozUserSelect: 'none' }}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Collaboration</h2>
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'participants' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'chat' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'participants' ? (
          <div className="p-4">
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${collaborator.color} flex items-center justify-center text-sm font-bold`}>
                    {collaborator.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{collaborator.name}</p>
                    <p className="text-xs text-gray-400">{collaborator.role}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
              ))}
            </div>
            
            {currentLocation && (
              <div className="mt-6 p-3 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-2">Current Location</h3>
                <p className="text-sm text-gray-300">{currentLocation.name}</p>
                <p className="text-xs text-gray-400 mt-1">{currentLocation.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className={`w-8 h-8 rounded-full ${message.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {message.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white">{message.author}</span>
                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-2 rounded-lg transition-colors ${
                isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          </div>
          
          <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}