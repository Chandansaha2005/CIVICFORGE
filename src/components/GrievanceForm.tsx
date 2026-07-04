import React, { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  FileText, 
  Camera, 
  Mic, 
  MapPin, 
  Upload, 
  CheckCircle, 
  Play, 
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
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden" id="citizen-grievance-form">
      {/* Tab selectors */}
      <div className="flex border-b border-slate-800 bg-slate-950/50">
        <button
          type="button"
          onClick={() => { setActiveTab('text'); setError(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'text' 
              ? 'border-teal-500 text-teal-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
          id="tab-text-btn"
        >
          <FileText className="w-4 h-4" />
          <span>Text Issue</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('photo'); setError(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'photo' 
              ? 'border-teal-500 text-teal-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
          id="tab-photo-btn"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('voice'); setError(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'voice' 
              ? 'border-teal-500 text-teal-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
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
          <div className="bg-rose-950/40 text-rose-300 text-sm px-4 py-3 rounded-xl border border-rose-900/30" id="form-error">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-950/40 text-emerald-300 text-sm px-4 py-4 rounded-xl border border-emerald-900/30 flex items-start space-x-2.5" id="form-success">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Location Selection Block */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Problem Location / Geo-Tag</span>
            </label>
            <button
              type="button"
              onClick={detectLocation}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use My GPS Location</span>
            </button>
          </div>

          {!useCustomLocation ? (
            <div>
              <select
                value={SECTORS.findIndex(s => s.name === selectedSector.name)}
                onChange={(e) => setSelectedSector(SECTORS[Number(e.target.value)])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500"
                id="location-select"
              >
                {SECTORS.map((sector, idx) => (
                  <option key={sector.name} value={idx}>{sector.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium italic">
                Coordinates: {selectedSector.lat}, {selectedSector.lng} • Address: {selectedSector.address}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Custom Address / Area Name</label>
                <input
                  type="text"
                  required
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. Behala Tram Depot, Ward 120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Lat, Lng</label>
                <input
                  type="text"
                  readOnly
                  value={`${customLat}, ${customLng}`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-400 focus:outline-none mt-1 cursor-not-allowed"
                />
              </div>
              <div className="sm:col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => setUseCustomLocation(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-medium cursor-pointer"
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
            <label className="text-sm font-semibold text-slate-200">Describe the Infrastructure Problem</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear description. What happened? Where exactly is it? Mention if it is hazardous or blocking traffic so our Gemini model can prioritize it..."
              className="w-full bg-slate-950 focus:bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
              id="text-grievance-desc"
            />
          </div>
        )}

        {/* PHOTO TAB */}
        {activeTab === 'photo' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Explain the Uploaded Image</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this photo shows (e.g. Clogged sewer in Salt Lake Ward 4)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-teal-500 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Attach Photo</label>
              
              {photoPreview ? (
                <div className="relative border border-slate-800 rounded-xl overflow-hidden max-h-64 flex items-center justify-center bg-slate-950 group">
                  <img src={photoPreview} alt="Preview" className="object-contain max-h-60" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute top-3 right-3 bg-slate-900/80 text-white p-2 rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className="border-2 border-dashed border-slate-800 hover:border-teal-500 rounded-xl p-8 flex flex-col items-center justify-center space-y-2 bg-slate-950/20 hover:bg-teal-950/10 cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-300">Drag photo here, or click to browse</span>
                  <span className="text-xs text-slate-500">Supports PNG, JPG (Max 10MB)</span>
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
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <span className="text-sm font-bold text-slate-200">Voice Note Recorder</span>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Record your complaint. Google Gemini will automatically transcribe your voice and classify it under appropriate municipal priority channels!
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {!isRecording && !audioUrl ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-5 rounded-full shadow-lg hover:scale-[1.02] cursor-pointer transition-all"
                    id="record-btn"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                ) : isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 px-5 rounded-full shadow animate-pulse border border-slate-800 cursor-pointer"
                    id="stop-record-btn"
                  >
                    <Square className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Recording... Click to Stop</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <audio src={audioUrl || ''} controls className="h-10 rounded-lg filter invert" />
                    <button
                      type="button"
                      onClick={deleteRecording}
                      className="p-2.5 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/20 border border-slate-850 rounded-full transition-colors cursor-pointer"
                      title="Delete recording"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
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
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-teal-500/10 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:bg-teal-950 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
            id="submit-grievance-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
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
