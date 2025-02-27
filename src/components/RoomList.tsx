
import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  instructor: string;
  participants: number;
  isLive: boolean;
}

const sampleRooms: Room[] = [
  {
    id: '1',
    name: 'Advanced Mathematics',
    instructor: 'Dr. Smith',
    participants: 12,
    isLive: true,
  },
  {
    id: '2',
    name: 'Physics Study Group',
    instructor: 'Prof. Johnson',
    participants: 8,
    isLive: true,
  },
];

export const RoomList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-study-800">Study Circles</h1>
        <Button onClick={() => navigate('/create-room')} className="bg-study-700 hover:bg-study-800">
          Create Room
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleRooms.map((room) => (
          <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-study-800">{room.name}</h2>
                {room.isLive && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Live
                  </span>
                )}
              </div>
              <p className="text-study-600 mb-4">Instructor: {room.instructor}</p>
              <p className="text-study-500 mb-6">{room.participants} participants</p>
              <Button
                onClick={() => navigate(`/room/${room.id}`)}
                className="w-full bg-study-700 hover:bg-study-800"
              >
                Join Room
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
