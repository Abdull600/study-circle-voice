
import { StudyRoom } from "@/components/StudyRoom";
import { Navbar } from "@/components/Navbar";
import { useParams } from "react-router-dom";

const Room = () => {
  const { id } = useParams();
  
  // In a real application, we would fetch room details based on the ID
  return (
    <div>
      <Navbar />
      <StudyRoom
        roomName="Advanced Mathematics"
        instructorName="Dr. Smith"
      />
    </div>
  );
};

export default Room;
