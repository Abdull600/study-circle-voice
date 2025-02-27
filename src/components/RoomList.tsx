
import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from './ui/use-toast';

interface Room {
  id: string;
  name: string;
  instructor_id: string;
  profiles: {
    full_name: string | null;
  } | null;
  participant_count: number;
}

export const RoomList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchRooms = async () => {
      try {
        const { data: roomsData, error } = await supabase
          .from('rooms')
          .select(`
            id,
            name,
            instructor_id,
            profiles (
              full_name
            ),
            participant_count:room_participants (
              count
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match our Room interface
        const transformedRooms: Room[] = (roomsData || []).map(room => ({
          id: room.id,
          name: room.name,
          instructor_id: room.instructor_id,
          profiles: room.profiles,
          participant_count: room.participant_count?.[0]?.count || 0
        }));

        setRooms(transformedRooms);
      } catch (error) {
        toast({
          title: "Error fetching rooms",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('room-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate, toast]);

  const createRoom = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          { 
            name: `${user.firstName || 'New'}'s Room`,
            instructor_id: user.id 
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        navigate(`/room/${data.id}`);
      }
    } catch (error) {
      toast({
        title: "Error creating room",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Study Circles</h1>
        <Button onClick={createRoom} className="bg-blue-700 hover:bg-blue-800">
          Create Room
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{room.name}</h2>
                  {room.participant_count > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">Instructor: {room.profiles?.full_name || 'Unknown'}</p>
                <p className="text-gray-500 mb-6">{room.participant_count} participants</p>
                <Button
                  onClick={() => navigate(`/room/${room.id}`)}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  Join Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
