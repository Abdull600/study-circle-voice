
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import PDFViewer from 'pdf-viewer-reactjs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './ui/use-toast';

interface StudyRoomProps {
  roomName: string;
  instructorName: string;
}

export const StudyRoom: React.FC<StudyRoomProps> = ({ roomName, instructorName }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const roomId = window.location.pathname.split('/').pop() || '';

  useEffect(() => {
    // Check if current user is the instructor
    const checkInstructorStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('instructor_id')
          .eq('id', roomId)
          .single();

        if (error) {
          console.error('Error checking instructor status:', error);
          return;
        }

        if (data && user && data.instructor_id === user.id) {
          setIsInstructor(true);
        }
      } catch (error) {
        console.error('Error checking instructor status:', error);
      }
    };

    // Get current PDF for the room
    const getCurrentPdf = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('current_pdf_url')
          .eq('id', roomId)
          .single();

        if (error) {
          console.error('Error fetching current PDF:', error);
          return;
        }

        if (data && data.current_pdf_url) {
          setPdfUrl(data.current_pdf_url);
        }
      } catch (error) {
        console.error('Error fetching current PDF:', error);
      }
    };

    if (user) {
      checkInstructorStatus();
      getCurrentPdf();
    }

    // Subscribe to real-time updates for the room
    const channel = supabase
      .channel('room-pdf-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        (payload) => {
          if (payload.new && payload.new.current_pdf_url) {
            setPdfUrl(payload.new.current_pdf_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isInstructor) return;

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('study_materials')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('study_materials')
        .getPublicUrl(filePath);

      if (data) {
        // Update the room with the new PDF URL
        const { error: updateError } = await supabase
          .from('rooms')
          .update({ current_pdf_url: data.publicUrl })
          .eq('id', roomId);

        if (updateError) {
          throw updateError;
        }

        setPdfUrl(data.publicUrl);
        toast({
          title: "PDF Uploaded",
          description: "All participants can now see the PDF",
        });
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-study-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-study-800">{roomName}</h1>
                <p className="text-study-500">Instructor: {instructorName}</p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`transition-colors ${isMuted ? 'bg-study-100' : 'bg-study-200'}`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`transition-colors ${isHandRaised ? 'bg-study-200' : 'bg-study-100'}`}
                >
                  {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-study-700">Participants</h2>
                <div className="bg-study-50 rounded-lg p-4">
                  {/* Placeholder for participants list */}
                  <p className="text-study-500">No participants yet</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-study-700">Study Material</h2>
                  {isInstructor && (
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload">
                        <Button variant="outline" size="sm">
                          Upload PDF
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                <div className="bg-study-50 rounded-lg p-4">
                  {pdfUrl ? (
                    <div className="mt-4 h-[600px] overflow-hidden rounded-lg border border-study-200">
                      <PDFViewer
                        document={{
                          url: pdfUrl,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <p className="text-study-500 mb-4">
                        {isInstructor 
                          ? "Upload a PDF to share with participants" 
                          : "Waiting for instructor to share a PDF"}
                      </p>
                      {isInstructor && (
                        <label htmlFor="pdf-upload">
                          <Button variant="outline">
                            Upload PDF
                          </Button>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
