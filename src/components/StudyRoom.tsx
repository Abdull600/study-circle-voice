
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import PDFViewer from 'pdf-viewer-reactjs';

interface StudyRoomProps {
  roomName: string;
  instructorName: string;
}

export const StudyRoom: React.FC<StudyRoomProps> = ({ roomName, instructorName }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
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
                <h2 className="text-xl font-semibold text-study-700">Study Material</h2>
                <div className="bg-study-50 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload">
                    <Button variant="outline" className="w-full">
                      Upload PDF
                    </Button>
                  </label>
                  {pdfUrl && (
                    <div className="mt-4 h-[600px] overflow-hidden rounded-lg border border-study-200">
                      <PDFViewer
                        document={{
                          url: pdfUrl,
                        }}
                      />
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
