import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Maximize2, MessageSquare, Pin, Ruler, RotateCcw, ArrowRight } from 'lucide-react';
import * as THREE from 'three';
import { Location } from '../App';

interface PanoramaViewerProps {
  location: Location;
  onBackToMap: () => void;
}

interface NavigationHotspot {
  id: string;
  longitude: number; // -180 to 180 degrees
  latitude: number;  // -90 to 90 degrees
  target: {
    name: string;
    imageUrl: string;
    description: string;
    equipment: string[];
    initialRotation?: number;
  };
}

interface Annotation {
  id: string;
  longitude: number; // -180 to 180 degrees
  latitude: number;  // -90 to 90 degrees
  text: string;
  author: string;
  type: 'note' | 'measurement' | 'issue';
  screenPosition?: { x: number; y: number };
}

export function PanoramaViewer({ location, onBackToMap }: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const sphereRef = useRef<THREE.Mesh>();
  const frameRef = useRef<number>();
  
  const [navigationHotspots, setNavigationHotspots] = useState<NavigationHotspot[]>([
    {
      id: 'to-control-room',
      longitude: 105,
      latitude: 0,
      target: {
        name: 'Control Room',
        imageUrl: 'https://tbrhub.com/gasterminal/images/controlroom1.jpg',
        description: 'Main control room with monitoring systems',
        equipment: ['Control Panels', 'Monitoring Systems', 'SCADA Interface', 'Emergency Controls'],
        initialRotation: 180
      }
    },
    {
      id: 'to-boardroom',
      longitude: -130,
      latitude: 0,
      target: {
        name: 'Boardroom',
        imageUrl: 'https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg',
        description: 'Executive boardroom for meetings and presentations',
        equipment: ['Conference Table', 'Presentation Screen', 'Video Conferencing', 'Whiteboard'],
        initialRotation: 0
      }
    },
    {
      id: 'to-kitchen',
      longitude: 150,
      latitude: 0,
      target: {
        name: 'Kitchen',
        imageUrl: 'https://tbrhub.com/gasterminal/images/kitchen1.jpg',
        description: 'Staff kitchen and break area',
        equipment: ['Kitchen Appliances', 'Dining Area', 'Coffee Station', 'Refrigeration'],
        initialRotation: 90
      }
    }
  ]);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([
    // Start with no annotations - they'll be added by users
  ]);
  
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [hotspotPositions, setHotspotPositions] = useState<{ [key: string]: { x: number; y: number; visible: boolean } }>({});
  const [annotationPositions, setAnnotationPositions] = useState<{ [key: string]: { x: number; y: number; visible: boolean } }>({});
  const [currentPanorama, setCurrentPanorama] = useState(location);

  // Define navigation hotspots based on current location
  const getNavigationHotspotsForLocation = (locationName: string): NavigationHotspot[] => {
    switch (locationName) {
      case 'Reception':
        return [
          {
            id: 'to-control-room',
            longitude: 105,
            latitude: 0,
            target: {
              name: 'Control Room',
              imageUrl: 'https://tbrhub.com/gasterminal/images/controlroom1.jpg',
              description: 'Main control room with monitoring systems',
              equipment: ['Control Panels', 'Monitoring Systems', 'SCADA Interface', 'Emergency Controls'],
              initialRotation: 180
            }
          },
          {
            id: 'to-boardroom',
            longitude: -130,
            latitude: 0,
            target: {
              name: 'Boardroom',
             imageUrl: 'https://tbrhub.com/gasterminal/images/boardroom2.jpg',
              description: 'Executive boardroom for meetings and presentations',
              equipment: ['Conference Table', 'Presentation Screen', 'Video Conferencing', 'Whiteboard'],
              initialRotation: 230
            }
          },
          {
            id: 'to-kitchen',
            longitude: 150,
            latitude: 0,
            target: {
              name: 'Kitchen Lounge',
              imageUrl: 'https://tbrhub.com/gasterminal/images/kitchen1.jpg',
              description: 'Staff kitchen and break area',
              equipment: ['Kitchen Appliances', 'Dining Area', 'Coffee Station', 'Refrigeration'],
              initialRotation: 90
            }
          }
        ];
      
      case 'Control Room':
        return [
          {
            id: 'back-to-reception',
            longitude: -75,
            latitude: 0,
            target: {
              name: 'Reception',
              imageUrl: 'https://tbrhub.com/gasterminal/images/reception1.jpg',
              description: 'Reception and administrative area',
              equipment: ['Kitchen', 'Boardroom', 'Offices', 'Control Room'],
              initialRotation: 55
            }
          }
        ];
      
      case 'Kitchen Lounge':
        return [
          {
            id: 'back-to-reception',
            longitude: 0,
            latitude: 0,
            target: {
              name: 'Reception',
              imageUrl: 'https://tbrhub.com/gasterminal/images/reception1.jpg',
              description: 'Reception and administrative area',
              equipment: ['Kitchen', 'Boardroom', 'Offices', 'Control Room'],
              initialRotation: 55
            }
          },
          {
            id: 'to-washroom',
            longitude: 90,
            latitude: 0,
            target: {
              name: 'Washroom',
              imageUrl: 'https://tbrhub.com/gasterminal/images/kitchen2.jpg',
              description: 'Staff washroom and facilities',
              equipment: ['Washbasins', 'Facilities', 'Mirror', 'Hand Dryer'],
              initialRotation: 120
            }
          }
        ];
      
      case 'Washroom':
        return [
          {
            id: 'back-to-kitchen',
            longitude: -75,
            latitude: 0,
            target: {
              name: 'Kitchen Lounge',
              imageUrl: 'https://tbrhub.com/gasterminal/images/kitchen1.jpg',
              description: 'Staff kitchen and break area',
              equipment: ['Kitchen Appliances', 'Dining Area', 'Coffee Station', 'Refrigeration'],
              initialRotation: 90
            }
          }
        ];
      
      case 'Boardroom':
        return [
          {
            id: 'back-to-reception',
            longitude: 0,
            latitude: 0,
            target: {
              name: 'Reception',
              imageUrl: 'https://tbrhub.com/gasterminal/images/reception1.jpg',
              description: 'Reception and administrative area',
              equipment: ['Kitchen', 'Boardroom', 'Offices', 'Control Room'],
              initialRotation: 90
            }
          }
        ];
      
      case 'TTLR':
      case 'TTLR Area 1':
        return [
          {
            id: 'to-ttlr-2',
            longitude: 160,
            latitude: 0,
            target: {
              name: 'TTLR Area 2',
              imageUrl: 'https://tbrhub.com/gasterminal/images/ttlr2.jpg',
              description: 'TTLR Area 2 - Loading operations zone',
              equipment: ['Loading Arms', 'Flow Meters', 'Safety Systems', 'Control Valves'],
              initialRotation: 180
            }
          }
        ];
      
      case 'TTLR Area 2':
        return [
          {
            id: 'to-ttlr-1',
            longitude: 0,
            latitude: 0,
            target: {
              name: 'TTLR Area 1',
              imageUrl: 'https://tbrhub.com/gasterminal/images/ttlr1.jpg',
              description: 'TTLR Area 1 - Terminal Tank Loading Rack entrance',
              equipment: ['Loading Arms', 'Flow Meters', 'Safety Systems', 'Control Valves'],
              initialRotation: 90
            }
          },
          {
            id: 'to-ttlr-3',
            longitude: 180,
            latitude: 0,
            target: {
              name: 'TTLR Area 3',
              imageUrl: 'https://tbrhub.com/gasterminal/images/ttlr3.jpg',
              description: 'TTLR Area 3 - Final loading position',
              equipment: ['Loading Arms', 'Flow Meters', 'Safety Systems', 'Control Valves'],
              initialRotation: 0
            }
          }
        ];
      
      case 'TTLR Area 3':
        return [
          {
            id: 'to-ttlr-2',
            longitude: -20,
            latitude: 0,
            target: {
              name: 'TTLR Area 2',
              imageUrl: 'https://tbrhub.com/gasterminal/images/ttlr2.jpg',
              description: 'TTLR Area 2 - Loading operations zone',
              equipment: ['Loading Arms', 'Flow Meters', 'Safety Systems', 'Control Valves'],
              initialRotation: 0
            }
          }
        ];
      
      default:
        return [];
    }
  };

  // Convert 3D sphere coordinates to screen position
  const projectAnnotation = (longitude: number, latitude: number, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude);
    
    const vector = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    
    vector.multiplyScalar(500); // Match sphere radius
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    
    // Check if annotation is visible (in front of camera)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const annotationDirection = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    const dotProduct = cameraDirection.dot(annotationDirection);
    
    // Check if annotation is in front of camera AND within viewport bounds
    const inFrontOfCamera = dotProduct > 0;
    const withinBounds = x >= 0 && x <= renderer.domElement.clientWidth && 
                        y >= 0 && y <= renderer.domElement.clientHeight;
    const visible = inFrontOfCamera && withinBounds;
    
    return { x, y, visible };
  };

  useEffect(() => {
    // Update navigation hotspots when current panorama changes
    setNavigationHotspots(getNavigationHotspotsForLocation(currentPanorama.name));
  }, [currentPanorama.name]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create sphere geometry for 360° panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert to see from inside

    // Load panorama texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(currentPanorama.imageUrl);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Set initial camera position
    camera.position.set(0, 0, 0);
    // Set initial rotation based on location
    const initialLon = currentPanorama.initialRotation || 0;
    const initialLat = 0;
    const phi = THREE.MathUtils.degToRad(90 - initialLat);
    const theta = THREE.MathUtils.degToRad(initialLon);
    
    camera.lookAt(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    sphereRef.current = sphere;

    // Mouse controls for panorama navigation
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let lon = currentPanorama.initialRotation || 0;
    let lat = 0;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
      
      // Prevent text selection globally when starting drag
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
    };

    const onMouseUp = () => {
      isMouseDown = false;
      
      // Re-enable text selection when drag ends
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.mozUserSelect = '';
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      // Prevent text selection when dragging
      event.preventDefault();
      event.stopPropagation();

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      mouseX = event.clientX;
      mouseY = event.clientY;

      lon -= deltaX * 0.1;
      lat += deltaY * 0.1;

      lat = Math.max(-85, Math.min(85, lat));

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      camera.target = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(camera.target);
    };

    // Global mouse event handlers to prevent text selection anywhere
    const onGlobalMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        event.preventDefault();
        event.stopPropagation();
        onMouseMove(event);
      }
    };

    const onGlobalMouseUp = (event: MouseEvent) => {
      if (isMouseDown) {
        event.preventDefault();
        event.stopPropagation();
        onMouseUp();
      }
    };

    const onWheel = (event: WheelEvent) => {
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
      camera.updateProjectionMatrix();
    };

    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onGlobalMouseUp);
    document.addEventListener('mousemove', onGlobalMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);
    window.addEventListener('resize', onResize);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Update navigation hotspot positions
      const newHotspotPositions: { [key: string]: { x: number; y: number; visible: boolean } } = {};
      navigationHotspots.forEach(hotspot => {
        const position = projectAnnotation(hotspot.longitude, hotspot.latitude, camera, renderer);
        newHotspotPositions[hotspot.id] = position;
      });
      setHotspotPositions(newHotspotPositions);
      
      // Update annotation positions
      const newPositions: { [key: string]: { x: number; y: number; visible: boolean } } = {};
      annotations.forEach(annotation => {
        const position = projectAnnotation(annotation.longitude, annotation.latitude, camera, renderer);
        newPositions[annotation.id] = position;
      });
      setAnnotationPositions(newPositions);
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onGlobalMouseUp);
      document.removeEventListener('mousemove', onGlobalMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      
      // Clean up any lingering styles
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentPanorama, navigationHotspots, annotations]);

  // Initialize navigation hotspots on component mount
  useEffect(() => {
    setNavigationHotspots(getNavigationHotspotsForLocation(currentPanorama.name));
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const screenY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Convert screen coordinates to sphere coordinates
    const camera = cameraRef.current!;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(screenX, screenY), camera);
    
    const intersects = raycaster.intersectObject(sphereRef.current!);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const longitude = Math.atan2(point.z, point.x) * 180 / Math.PI;
      const latitude = Math.asin(point.y / 500) * 180 / Math.PI;
    
      if (newAnnotation.trim()) {
        const annotation: Annotation = {
          id: Date.now().toString(),
          longitude,
          latitude,
          text: newAnnotation,
          author: 'You',
          type: 'note'
        };
        
        setAnnotations([...annotations, annotation]);
        setNewAnnotation('');
        setIsAnnotating(false);
      }
    }
  };

  const handleNavigationClick = (hotspot: NavigationHotspot) => {
    setCurrentPanorama({
      id: hotspot.id,
      name: hotspot.target.name,
      x: 0,
      y: 0,
      status: 'normal' as const,
      imageUrl: hotspot.target.imageUrl,
      description: hotspot.target.description,
      equipment: hotspot.target.equipment,
      initialRotation: hotspot.target.initialRotation || 0
    });

    // Clear annotations when switching rooms  
    setAnnotations([]);
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
      
      // Reset to the current panorama's initial rotation
      const initialLon = currentPanorama.initialRotation || 0;
      const initialLat = 0;
      const phi = THREE.MathUtils.degToRad(90 - initialLat);
      const theta = THREE.MathUtils.degToRad(initialLon);
      
      cameraRef.current.lookAt(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* 360° Panorama Container */}
      <div 
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleImageClick}
      />
      
      {/* Annotations Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Navigation Hotspots */}
        {navigationHotspots.map((hotspot) => {
          const position = hotspotPositions[hotspot.id];
          if (!position || !position.visible) return null;
          
          return (
            <div
              key={hotspot.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
              style={{ left: `${position.x}px`, top: `${position.y}px` }}
              onClick={() => handleNavigationClick(hotspot)}
            >
              {/* Navigation arrow */}
              <div className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              
              {/* Navigation tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl min-w-48">
                  <h3 className="text-sm font-semibold text-white mb-1">Navigate to {hotspot.target.name}</h3>
                  <p className="text-xs text-gray-300 mb-2">{hotspot.target.description}</p>
                  <div className="text-xs text-gray-400">
                    <p className="mb-1">Equipment:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {hotspot.target.equipment.slice(0, 3).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* User Annotations */}
        {annotations.map((annotation) => {
          const position = annotationPositions[annotation.id];
          if (!position || !position.visible) return null;
          
          return (
            <div
              key={annotation.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
              style={{ left: `${position.x}px`, top: `${position.y}px` }}
            >
              {/* Annotation pin */}
              <div className={`
                w-6 h-6 rounded-full border-2 border-white flex items-center justify-center cursor-pointer
                transition-all duration-200 hover:scale-110 shadow-lg
                ${annotation.type === 'issue' ? 'bg-red-500' : 
                  annotation.type === 'measurement' ? 'bg-yellow-500' : 'bg-blue-500'}
              `}>
                <Pin className="w-3 h-3 text-white" />
              </div>
              
              {/* Annotation tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl min-w-48">
                  <p className="text-sm text-white mb-1">{annotation.text}</p>
                  <p className="text-xs text-gray-400">— {annotation.author}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="absolute top-6 left-6 flex space-x-2">
        <button
          onClick={() => setIsAnnotating(!isAnnotating)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg transition-all backdrop-blur-sm
            ${isAnnotating 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-900/80 text-gray-300 hover:bg-gray-800 border border-gray-600'
            }
          `}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isAnnotating ? 'Cancel' : 'Add Note'}</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900/80 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors backdrop-blur-sm border border-gray-600">
          <Ruler className="w-4 h-4" />
          <span>Measure</span>
        </button>
        
        <button 
          onClick={resetView}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900/80 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors backdrop-blur-sm border border-gray-600"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset View</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900/80 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors backdrop-blur-sm border border-gray-600">
          <Maximize2 className="w-4 h-4" />
          <span>Fullscreen</span>
        </button>
      </div>

      {/* Annotation input */}
      {isAnnotating && (
        <div className="absolute top-20 left-6 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-4 shadow-xl">
          <h3 className="text-white font-semibold mb-2">Add Annotation</h3>
          <input
            type="text"
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Enter your note..."
            className="w-64 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-2">Click on the panorama to place your annotation</p>
        </div>
      )}

      {/* Areas info panel */}
      <div className="absolute bottom-6 left-6 bg-gray-900/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 max-w-sm">
        <h3 className="font-semibold text-white mb-2">Areas at {currentPanorama.name}</h3>
        <div className="space-y-1">
          {currentPanorama.equipment.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation instructions */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-2">360° Navigation</p>
        <div className="space-y-1 text-xs text-gray-300">
          <p>• Drag to look around</p>
          <p>• Scroll to zoom in/out</p>
          <p>• Click "Reset View" to center</p>
          <p>• Click to add annotations</p>
        </div>
      </div>
    </div>
  );
}