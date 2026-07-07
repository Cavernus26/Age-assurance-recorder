import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Square, Download, Upload, AlertCircle, Play, 
  Settings, FolderOpen, Film, CheckCircle2, User, HelpCircle, RefreshCw
} from 'lucide-react';
import { TestScenario, AutomationConfig } from '../types';

interface RecorderProps {
  scenarios: TestScenario[];
  activeScenarioId: string;
  config: AutomationConfig;
  onVideoCaptured: (scenarioId: string, videoBlob: Blob, videoName: string, url: string) => void;
}

export default function Recorder({ scenarios, activeScenarioId, config, onVideoCaptured }: RecorderProps) {
  const [recordingState, setRecordingState] = useState<'idle' | 'ready' | 'recording' | 'preview'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [videoFilename, setVideoFilename] = useState<string>('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  // Auto-generate file name when scenario, config, or state changes
  useEffect(() => {
    if (activeScenario) {
      const dateStr = new Date().toISOString().split('T')[0];
      const testerClean = (config.testerName || 'Tester').replace(/\s+/g, '_');
      const appVersionClean = (config.appVersion || 'v1.0').replace(/\s+/g, '_');
      const filename = `StoreKit_AgeAssurance_${activeScenario.id.toUpperCase()}_${testerClean}_${appVersionClean}_${dateStr}.webm`;
      setVideoFilename(filename);
    }
  }, [activeScenarioId, config, activeScenario]);

  // Handle Recording Timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingState === 'idle' || recordingState === 'ready') {
        setTimer(0);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Request display media for recording the Simulator
  const startScreenCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window', // suggest capturing the Simulator window
        },
        audio: false
      });
      
      setStream(mediaStream);
      setRecordingState('ready');
      setRecordedChunks([]);

      // Listen for user stopping sharing via browser bar
      mediaStream.getVideoTracks()[0].onended = () => {
        stopRecording();
        setRecordingState('idle');
      };
    } catch (err) {
      console.error("Error securing display media:", err);
      alert("Permission to capture screen or window was denied.");
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    let recorder: MediaRecorder;
    
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      try {
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      } catch (err) {
        alert("WebM recording is not supported on this browser.");
        return;
      }
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setRecordedChunks(chunks);
      setRecordingState('preview');
      
      // Stop all tracks to release stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    recorder.start(1000); // chunk every second
    setMediaRecorder(recorder);
    setRecordingState('recording');
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const handleSaveCapture = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    onVideoCaptured(activeScenario.id, blob, videoFilename, previewUrl);
    setRecordingState('idle');
    setStream(null);
  };

  // Support local manual video upload if they record via iPhone / separate tool
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it is a video
    if (!file.type.startsWith('video/')) {
      alert("Please upload a valid video file.");
      return;
    }

    // Auto rename file to the compliant name
    const url = URL.createObjectURL(file);
    onVideoCaptured(activeScenario.id, file, videoFilename, url);
    alert(`Success: Video uploaded and cataloged as: \n${videoFilename}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Sandbox Video Capture Hub
          </h3>
          <p className="text-xs text-slate-500">Record simulator or upload proof with standard compliant naming</p>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
          Compliance Standard
        </span>
      </div>

      {/* Target Scenario Info */}
      <div className="mb-5 p-3.5 bg-gray-50/75 rounded-xl border border-gray-100/80">
        <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Targeting Scenario:</div>
        <div className="text-xs font-bold text-gray-800 mt-1">{activeScenario.name}</div>
        <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 italic">
          Configured file format: WebM/MP4
        </div>
      </div>

      {/* Main Recording Workspace */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] border-2 border-dashed border-slate-200/60 rounded-xl bg-slate-50/20 p-6 relative overflow-hidden">
        
        {recordingState === 'idle' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100/60">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Record Connected iOS Device or Simulator</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[320px] mx-auto leading-relaxed">
                Connect your physical iPhone/iPad or launch your Xcode Simulator. Mirror the device screen (e.g. via QuickTime Player or Windows AirPlay), then click below and select that window to record app behavior.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={startScreenCapture}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                Initialize Recorder
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-xs rounded-lg hover:bg-gray-50 transition-all bg-white"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Recording
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleLocalVideoUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {recordingState === 'ready' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Simulator Capture Ready</p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-[240px]">
                Screen sharing initialized. Navigate to your iOS Simulator, then click start.
              </p>
            </div>

            <button
              onClick={startRecording}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
              Start Capture
            </button>
          </div>
        )}

        {recordingState === 'recording' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 animate-pulse">
              <Square className="w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-gray-800 tracking-wider">
                {formatTime(timer)}
              </div>
              <p className="text-xs text-red-600 font-semibold mt-1">
                Recording Active...
              </p>
              <p className="text-[10px] text-gray-400 mt-1 leading-normal max-w-[220px] mx-auto">
                Perform the age assurance scenario in your app now. The recording will auto-save on stop.
              </p>
            </div>

            <button
              onClick={stopRecording}
              className="px-6 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <Square className="w-3.5 h-3.5" />
              Stop Recording
            </button>
          </div>
        )}

        {recordingState === 'preview' && (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="w-full max-w-[260px] aspect-video bg-black rounded-lg overflow-hidden border border-gray-100 relative shadow">
              <video src={previewUrl} controls className="w-full h-full object-contain" />
            </div>

            <div className="text-center">
              <p className="text-xs font-bold text-gray-800">Preview Test Video</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                Double-check the clip. Saving will automatically link it to this scenario.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full max-w-[260px]">
              <button
                onClick={handleSaveCapture}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Link Video
              </button>
              
              <button
                onClick={() => {
                  setRecordingState('idle');
                  setStream(null);
                }}
                className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Naming Preview Filecard */}
      <div className="mt-5 p-4 bg-blue-50/30 rounded-xl border border-blue-100/40">
        <div className="flex items-start gap-3">
          <Settings className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Regulatory Renaming Mask</div>
            <div className="text-xs font-mono font-medium text-slate-900 break-all bg-white p-1.5 rounded border border-blue-100/40">
              {videoFilename}
            </div>
            <div className="text-[10px] text-blue-600 leading-normal pt-1">
              Provides the exact, standardized nomenclature matching Apple Developer compliance regulations and audit requests.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
