import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatusBar } from '../../components/feature/StatusBar';
import { BottomNav } from '../../components/feature/BottomNav';
import { kSpots } from '../../mocks/kSpots';

interface RouteSpot {
  id: number;
  spotId: number;
  name: string;
  image: string;
  location: string;
  estimatedTime: string;
}

function SortableSpotItem({ spot, onRemove }: { spot: RouteSpot; onRemove: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: spot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl p-4 shadow-sm mb-3">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <i className="ri-draggable text-xl text-gray-400"></i>
        </button>
        <img src={spot.image} alt={spot.name} className="w-16 h-16 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900">{spot.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{spot.location}</p>
          <p className="text-xs text-teal-600 mt-1">
            <i className="ri-time-line mr-1"></i>
            {spot.estimatedTime}
          </p>
        </div>
        <button onClick={() => onRemove(spot.id)} className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center cursor-pointer">
          <i className="ri-close-line text-red-500"></i>
        </button>
      </div>
    </div>
  );
}

export default function RouteCreatePage() {
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [selectedSpots, setSelectedSpots] = useState<RouteSpot[]>([
    { id: 1, spotId: 1, name: kSpots[0].name, image: kSpots[0].image, location: kSpots[0].location, estimatedTime: '1-2 hours' },
    { id: 2, spotId: 2, name: kSpots[1].name, image: kSpots[1].image, location: kSpots[1].location, estimatedTime: '30 mins' },
  ]);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedSpots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemoveSpot = (id: number) => {
    setSelectedSpots((prev) => prev.filter((spot) => spot.id !== id));
  };

  const handleAddSpot = (spotId: number) => {
    const spot = kSpots.find((s) => s.id === spotId);
    if (spot) {
      const newId = Math.max(...selectedSpots.map((s) => s.id), 0) + 1;
      setSelectedSpots((prev) => [
        ...prev,
        { id: newId, spotId: spot.id, name: spot.name, image: spot.image, location: spot.location, estimatedTime: '1 hour' },
      ]);
      setShowAddSpot(false);
    }
  };

  const handleSave = () => {
    if (!routeName.trim()) {
      alert('루트 이름을 입력해주세요!');
      return;
    }
    if (selectedSpots.length < 2) {
      alert('최소 2개 이상의 장소를 추가해주세요!');
      return;
    }
    alert('루트가 저장되었습니다!');
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/favorites');
    }
  };

  const handleBack = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(-1);
    }
  };

  const totalTime = selectedSpots.length * 1.5;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <StatusBar />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 pt-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Create Route</h1>
          <button onClick={handleSave} className="text-teal-600 font-semibold text-sm cursor-pointer whitespace-nowrap">
            Save
          </button>
        </div>
      </div>

      <div className="pt-24 px-4 pb-8">
        {/* Route Info */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="루트 이름을 입력하세요"
            className="w-full text-lg font-bold text-gray-900 mb-3 focus:outline-none"
            maxLength={50}
          />
          <textarea
            value={routeDescription}
            onChange={(e) => setRouteDescription(e.target.value)}
            placeholder="루트 설명을 입력하세요 (선택사항)"
            className="w-full text-sm text-gray-600 resize-none focus:outline-none"
            rows={2}
            maxLength={200}
          ></textarea>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <i className="ri-map-pin-line text-teal-600"></i>
              <span className="text-sm text-gray-600">{selectedSpots.length} spots</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-time-line text-teal-600"></i>
              <span className="text-sm text-gray-600">~{totalTime.toFixed(1)} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Public</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isPublic ? 'bg-teal-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Spots List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Route Spots</h2>
            <button
              onClick={() => setShowAddSpot(true)}
              className="px-4 py-2 bg-teal-500 text-white rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-1"></i>
              Add Spot
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedSpots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {selectedSpots.map((spot, index) => (
                <div key={spot.id} className="relative">
                  {index > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-0.5 h-6 bg-gray-300"></div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <SortableSpotItem spot={spot} onRemove={handleRemoveSpot} />
                    </div>
                  </div>
                </div>
              ))}
            </SortableContext>
          </DndContext>

          {selectedSpots.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-map-pin-line text-5xl text-gray-300 mb-3"></i>
              <p className="text-sm text-gray-500">장소를 추가해서 루트를 만들어보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Spot Modal */}
      {showAddSpot && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end" onClick={() => setShowAddSpot(false)}>
          <div
            className="w-full bg-white rounded-t-3xl max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Add Spot</h3>
                <button onClick={() => setShowAddSpot(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search spots..."
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-120px)] p-4">
              {kSpots.filter((spot) => !selectedSpots.some((s) => s.spotId === spot.id)).map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleAddSpot(spot.id)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <img src={spot.image} alt={spot.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-bold text-gray-900">{spot.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{spot.location}</p>
                  </div>
                  <i className="ri-add-circle-line text-2xl text-teal-500"></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
