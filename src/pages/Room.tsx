
import { useState, useEffect } from 'react';
import { StudyRoom } from "@/components/StudyRoom";
import { Navbar } from "@/components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface RoomDetails {
  name: string;
  instructor: {
    full_name: string;
  };
}

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select(`
            name,
            instructor:profiles!rooms_instructor_id_fkey (
              full_name
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setRoomDetails({
            name: data.name,
            instructor: {
              full_name: data.instructor?.full_name || 'Unknown Instructor'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching room details:', error);
        toast({
          title: "Error loading room",
          description: "The room could not be found or you don't have access.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Room not found or access denied</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <StudyRoom
        roomName={roomDetails.name}
        instructorName={roomDetails.instructor.full_name}
      />
    </div>
  );
};

export default Room;
