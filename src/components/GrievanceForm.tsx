import React, { useState, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  FileText, 
  Camera, 
  Mic, 
  MapPin, 
  Upload, 
  CheckCircle, 
  Square, 
  Trash2, 
  Loader2 
} from 'lucide-react';

const SECTORS = [
  { name: 'Behala & South Suburban', lat: 22.4981, lng: 88.3184, address: 'Roy Bahadur Road, Behala, Kolkata, WB' },
  { name: 'Salt Lake (Sector V)', lat: 22.5726, lng: 88.4339, address: 'Sector V, Salt Lake City, Kolkata, WB' },
  { name: 'Park Street & Chowringhee', lat: 22.5530, lng: 88.3510, address: '75 Park Street, Chowringhee, Kolkata, WB' },
  { name: 'Garia & Jadavpur', lat: 22.4714, lng: 88.3768, address: 'Raja SC Mullick Road, Garia, Kolkata, WB' }
];

interface GrievanceFormProps {
  onSuccess: () => void;
}

export const GrievanceForm: React.FC<GrievanceFormProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'voice'>('text');
  const [description, setDescription] = useState('');
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [customLat, setCustomLat] = useState('22.5726');
  const [customLng, setCustomLng] = useState('88.4339');
  const [customAddress, setCustomAddress] = useState('');

  // Photo uploading states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-fill coordinates if custom address is chosen
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomLat(position.coords.latitude.toFixed(6));
          setCustomLng(position.coords.longitude.toFixed(6));
          setCustomAddress('Current GPS Coordinates (Verified)');
          setUseCustomLocation(true);
        },
        (err) => {
          console.error(err);
          setError('Could not access current location. Using preset sectors instead.');
        }
      );
    } else {
      setError('Geolocation not supported by your browser.');
    }
  };

  // Handle Photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle Drag & Drop for Photo
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Voice Note Recorder Logic
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        // Clear microphone stream tracks to avoid hardware lock
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Mic access error:', err);
      setError('Microphone access is required to record voice notes. Please allow mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('inputType', activeTab);
      
      // Location data
      if (useCustomLocation) {
        formData.append('lat', customLat);
        formData.append('lng', customLng);
        formData.append('address', customAddress || 'Custom Coordinate Area, Kolkata');
      } else {
        formData.append('lat', selectedSector.lat.toString());
        formData.append('lng', selectedSector.lng.toString());
        formData.append('address', selectedSector.address);
      }

      // Input specific data
      if (activeTab === 'text') {
        if (!description.trim()) {
          throw new Error('Please fill in a description of the issue.');
        }
        formData.append('description', description);
      } else if (activeTab === 'photo') {
        if (!description.trim()) {
          throw new Error('Please provide context description along with the photo.');
        }
        if (!photoFile) {
          throw new Error('Please upload or drag a photo.');
        }
        formData.append('description', description);
        formData.append('file', photoFile);
      } else if (activeTab === 'voice') {
        if (!audioBlob) {
          throw new Error('Please record a voice note before submitting.');
        }
        // Save voice note file
        formData.append('file', audioBlob, 'voice-grievance.wav');
      }

      const response = await axiosClient.post('/api/grievances', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessMsg(`Grievance submitted successfully! AI classified this under "${response.data.grievance.category.toUpperCase()}" with an urgency of ${response.data.grievance.urgencyScore}/100.`);
        // Reset form
        setDescription('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setAudioBlob(null);
        setAudioUrl(null);
        setTimeout(() => {
          onSuccess();
          setSuccessMsg(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF9] rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40 overflow-hidden" id="citizen-grievance-form">
      {/* Tab selectors */}
      <div className="flex bg-[#FAF6ED] p-1.5 border-b border-[#E5DEC9]/60">
        <button
          type="button"
          onClick={() => { setActiveTab('text'); setError(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'text' 
              ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] text-[#3F6C51] border border-[#3F6C51]/15' 
              : 'text-[#9A8C7F] hover:text-[#3A2E2B] border border-transparent'
          }`}
          id="tab-text-btn"
        >
          <FileText className="w-4 h-4" />
          <span>Text Issue</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('photo'); setError(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'photo' 
              ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] text-[#3F6C51] border border-[#3F6C51]/15' 
              : 'text-[#9A8C7F] hover:text-[#3A2E2B] border border-transparent'
          }`}
          id="tab-photo-btn"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('voice'); setError(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'voice' 
              ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] text-[#3F6C51] border border-[#3F6C51]/15' 
              : 'text-[#9A8C7F] hover:text-[#3A2E2B] border border-transparent'
          }`}
          id="tab-voice-btn"
        >
          <Mic className="w-4 h-4" />
          <span>Voice Note</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error and Success alerts */}
        {error && (
          <div className="bg-[#E76F51]/10 text-[#E76F51] text-xs px-4 py-3 rounded-xl border border-[#E76F51]/20 font-bold" id="form-error">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-[#3F6C51]/10 text-[#3F6C51] text-xs px-4 py-4 rounded-xl border border-[#3F6C51]/20 flex items-start space-x-2.5 font-bold" id="form-success">
            <CheckCircle className="w-5 h-5 text-[#3F6C51] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Location Selection Block */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-wider text-[#9A8C7F] flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#E76F51]" />
              <span>Problem Location / Geo-Tag</span>
            </label>
            <button
              type="button"
              onClick={detectLocation}
              className="text-xs text-[#3F6C51] hover:text-[#E76F51] font-bold flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use My GPS Location</span>
            </button>
          </div>

          {!useCustomLocation ? (
            <div>
              <div className="relative">
                <select
                  value={SECTORS.findIndex(s => s.name === selectedSector.name)}
                  onChange={(e) => setSelectedSector(SECTORS[Number(e.target.value)])}
                  className="w-full neumorphic-concave px-4 py-3 text-sm font-bold text-[#3A2E2B] border-none focus:outline-none"
                  id="location-select"
                >
                  {SECTORS.map((sector, idx) => (
                    <option key={sector.name} value={idx}>{sector.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-[#9A8C7F] mt-2 font-bold italic">
                Coordinates: {selectedSector.lat}, {selectedSector.lng} • {selectedSector.address}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF6ED]/50 p-4 border border-white/20 rounded-2xl shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
              <div>
                <label className="text-[9px] uppercase tracking-wider font-black text-[#9A8C7F]">Custom Address / Area Name</label>
                <input
                  type="text"
                  required
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. Behala Tram Depot, Ward 120"
                  className="w-full neumorphic-concave px-3 py-2 text-xs text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider font-black text-[#9A8C7F]">Lat, Lng</label>
                <input
                  type="text"
                  readOnly
                  value={`${customLat}, ${customLng}`}
                  className="w-full bg-[#FAF6ED] border border-transparent rounded-xl px-3 py-2.5 text-xs text-[#9A8C7F] font-medium mt-1 cursor-not-allowed shadow-[inset_1px_1px_2px_rgba(142,130,114,0.1)]"
                />
              </div>
              <div className="sm:col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => setUseCustomLocation(false)}
                  className="text-[10px] text-[#9A8C7F] hover:text-[#3F6C51] font-bold cursor-pointer hover:underline"
                >
                  Switch back to preset sectors
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Grievance Input Area based on Active Tab */}
        
        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[#9A8C7F]">Describe the Infrastructure Problem</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear description. What happened? Where exactly is it? Mention if it is hazardous or blocking traffic so our Gemini model can prioritize it..."
              className="w-full neumorphic-concave px-4 py-3.5 text-sm text-[#3A2E2B] focus:outline-none transition-all placeholder-[#9A8C7F]/60 font-medium"
              id="text-grievance-desc"
            />
          </div>
        )}

        {/* PHOTO TAB */}
        {activeTab === 'photo' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#9A8C7F]">Explain the Uploaded Image</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this photo shows (e.g. Clogged sewer in Salt Lake Ward 4)"
                className="w-full neumorphic-concave px-4 py-3 text-sm text-[#3A2E2B] placeholder-[#9A8C7F]/60 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#9A8C7F]">Attach Photo</label>
              
              {photoPreview ? (
                <div className="relative border border-[#E5DEC9]/60 rounded-2xl overflow-hidden max-h-64 flex items-center justify-center bg-[#FAF6ED] p-2">
                  <img src={photoPreview} alt="Preview" className="object-contain max-h-60 rounded-xl" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute top-4 right-4 bg-[#FFFDF9] shadow-lg text-[#E76F51] p-2 rounded-full hover:scale-110 transition-transform cursor-pointer border border-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className="border-2 border-dashed border-[#E5DEC9]/80 hover:border-[#3F6C51] rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 bg-[#FAF6ED]/30 hover:bg-[#FFFDF9]/80 cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 text-[#9A8C7F]" />
                  <span className="text-xs font-bold text-[#3A2E2B]">Drag photo here, or click to browse</span>
                  <span className="text-[10px] text-[#9A8C7F] font-semibold">Supports PNG, JPG (Max 10MB)</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* VOICE TAB */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="bg-[#FAF6ED]/40 border border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.06)]">
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#3A2E2B]">Voice Note Recorder</span>
                <p className="text-[10px] text-[#9A8C7F] font-bold mt-1 max-w-sm">
                  Record your complaint. Google Gemini will automatically transcribe your voice and classify it under appropriate municipal priority channels!
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {!isRecording && !audioUrl ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center space-x-2 bg-[#E76F51] hover:brightness-110 text-white font-extrabold text-[11px] uppercase tracking-wider py-3 px-6 rounded-full shadow-[4px_4px_8px_rgba(231,111,81,0.25),-4px_-4px_8px_#FFFFFF] cursor-pointer transition-all"
                    id="record-btn"
                  >
                    <Mic className="w-4 h-4 text-white" />
                    <span>Start Recording</span>
                  </button>
                ) : isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center space-x-2 bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15),inset_-2px_-2px_5px_#FFFFFF] border border-[#E76F51]/30 text-[#E76F51] font-black text-[11px] uppercase tracking-wider py-3 px-6 rounded-full animate-pulse cursor-pointer"
                    id="stop-record-btn"
                  >
                    <Square className="w-4 h-4 text-[#E76F51] fill-[#E76F51]" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3 bg-[#FFFDF9] p-2.5 rounded-xl shadow-[4px_4px_8px_rgba(142,130,114,0.1),-4px_-4px_8px_#FFFFFF] border border-white/40">
                    <audio src={audioUrl || ''} controls className="h-9 rounded-lg" />
                    <button
                      type="button"
                      onClick={deleteRecording}
                      className="p-2.5 text-[#E76F51] bg-[#FFFDF9] shadow-[2px_2px_5px_rgba(142,130,114,0.1),-2px_-2px_5px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_rgba(142,130,114,0.1)] border border-white rounded-full transition-all cursor-pointer"
                      title="Delete recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full neumorphic-btn-accent py-4 px-4 font-black uppercase tracking-wider text-xs shadow-[6px_6px_12px_rgba(63,108,81,0.25),-6px_-6px_12px_#FFFFFF] flex items-center justify-center space-x-2 disabled:opacity-50"
            id="submit-grievance-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>AI Data Fusion Analysis running...</span>
              </>
            ) : (
              <span>Submit Grievance to CivicForge</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

