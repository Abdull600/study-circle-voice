
import { StudyRoom } from "@/components/StudyRoom";
import { useParams } from "react-router-dom";

const Room = () => {
  const { id } = useParams();
  
  // In a real application, we would fetch room details based on the ID
  return (
    <StudyRoom
      roomName="Advanced Mathematics"
      instructorName="Dr. Smith"
    />
  );
};

export default Room;
