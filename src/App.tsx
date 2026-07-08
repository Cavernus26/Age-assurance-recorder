import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Video, FileText, Terminal, CheckCircle2, 
  AlertTriangle, Play, Trash2, Settings, X, RefreshCw, 
  Copy, Check, Upload, Film, Square, Info, Download, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Scenarios
import { TestScenario, AutomationConfig } from './types';
import { DEFAULT_SCENARIOS } from './scenariosData';

export default function App() {
  // Scenarios State - load from localStorage or fall back to default data
  const [scenarios, setScenarios] = useState<TestScenario[]>(() => {
    const saved = localStorage.getItem('storekit_age_scenarios');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_SCENARIOS.length) {
          return parsed;
        }
        // If the number of scenarios is stale (e.g. from an older version of the app),
        // clear local storage and load the full 12 scenarios.
        localStorage.removeItem('storekit_age_scenarios');
      } catch (e) {
        console.error("Failed to parse saved scenarios, loading defaults", e);
      }
    }
    return DEFAULT_SCENARIOS;
  });

  // Selected Active Scenario
  const [activeScenarioId, setActiveScenarioId] = useState<string>('under13_approved');

  // Interactive Checklist Checkboxes state for the active scenario
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});

  // Script tab state
  const [activeScriptTab, setActiveScriptTab] = useState<'maestro' | 'bash' | 'xctest'>('maestro');
  const [scriptCopied, setScriptCopied] = useState(false);

  // Setup help drawer state
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Screen recorder states
  const [recordingState, setRecordingState] = useState<'idle' | 'ready' | 'recording' | 'preview'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [recordingTimer, setRecordingTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Config State
  const [config, setConfig] = useState<AutomationConfig>(() => {
    const saved = localStorage.getItem('storekit_automation_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      bundleId: 'com.gamestudio.legendquest',
      deepLink: 'legendquest://storekit-verify',
      deviceName: 'iPhone 15 Pro (Physical Device)',
      triggerButtonId: 'storekit_age_btn',
      approveButtonId: 'sandbox_approve_btn',
      denyButtonId: 'sandbox_deny_btn',
      testerName: 'QA Lead',
      appVersion: 'v3.4.0'
    };
  });

  // Sync state to local storage to preserve test progress
  useEffect(() => {
    localStorage.setItem('storekit_age_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    localStorage.setItem('storekit_automation_config', JSON.stringify(config));
  }, [config]);

  // Handle recording timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingState === 'idle' || recordingState === 'ready') {
        setRecordingTimer(0);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Active scenario reference
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  // Auto-generate compliant video filename mask
  const getComplianceFilename = (scenario: TestScenario) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const testerClean = (config.testerName || 'Tester').replace(/\s+/g, '_');
    const appVersionClean = (config.appVersion || 'v1.0').replace(/\s+/g, '_');
    return `StoreKit_AgeAssurance_${scenario.id.toUpperCase()}_${testerClean}_${appVersionClean}_${dateStr}.webm`;
  };

  const videoFilename = getComplianceFilename(activeScenario);

  // Start Screen/Window Capture via browser's WebRTC API
  const startScreenCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
        },
        audio: false
      });
      
      setStream(mediaStream);
      setRecordingState('ready');
      setRecordedChunks([]);

      mediaStream.getVideoTracks()[0].onended = () => {
        setRecordingState('idle');
        setStream(null);
      };
    } catch (err) {
      console.error("Error securing display media:", err);
      alert("Permission to capture screen or window was denied.");
    }
  };

  // Start active recording
  const startRecording = () => {
    if (!stream) return;
    
    let recorder: MediaRecorder;
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
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
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    recorder.start(1000);
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
    const url = URL.createObjectURL(blob);

    setScenarios(prev => prev.map(s => {
      if (s.id === activeScenario.id) {
        return {
          ...s,
          videoUrl: url,
          videoName: videoFilename,
          status: 'Pass', // Auto-promote status to Pass upon linking video proof
          lastTested: new Date().toISOString()
        };
      }
      return s;
    }));

    setRecordingState('idle');
    setStream(null);
  };

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert("Please upload a valid video file.");
      return;
    }

    const url = URL.createObjectURL(file);
    setScenarios(prev => prev.map(s => {
      if (s.id === activeScenario.id) {
        return {
          ...s,
          videoUrl: url,
          videoName: videoFilename,
          status: 'Pass',
          lastTested: new Date().toISOString()
        };
      }
      return s;
    }));

    alert(`Successfully cataloged local video as:\n${videoFilename}`);
  };

  const handleDiscardVideo = (scenarioId: string) => {
    if (window.confirm("Remove this saved video proof from the scenario?")) {
      setScenarios(prev => prev.map(s => {
        if (s.id === scenarioId) {
          return {
            ...s,
            videoUrl: undefined,
            videoName: undefined
          };
        }
        return s;
      }));
    }
  };

  const handleUpdateStatus = (id: string, status: TestScenario['status']) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, status, lastTested: new Date().toISOString() } : s));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, notes } : s));
  };

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Divide scenarios
  const standardScenarios = scenarios.filter(s => !s.consentRevoked);
  const revokedScenarios = scenarios.filter(s => s.consentRevoked);

  // Generate dynamic test scripts
  const testerClean = (config.testerName || 'tester').toLowerCase().replace(/\s+/g, '_');
  const appVerClean = (config.appVersion || 'v1.0').replace(/\s+/g, '_');
  const dateString = new Date().toISOString().split('T')[0];

  const scripts = {
    maestro: `appId: "${config.bundleId}"
---
# -----------------------------------------------------------------------------
# Maestro Compliance Test: ${activeScenario.id.toUpperCase()}
# Target Device: ${config.deviceName}
# Generated: ${dateString}
# -----------------------------------------------------------------------------

- clearState
- launchApp:
    arguments:
      -key: "STOREKIT_AGE_ASSURANCE_SCENARIO"
      -value: "${activeScenario.id}"

# Wait for application screen to fully load
- assertVisible: "Age Verification"

# Start Background Video Recording Session via Simulator CLI
- runScript: 
    commands:
      - "xcrun simctl io booted recordVideo --codec=h264 ${videoFilename.replace('.webm', '.mp4')} & echo $! > record.pid"

# Trigger native Age Assurance flow
- tapOn: "${config.triggerButtonId}"

# Assert native sandbox dialog and perform verification action
- assertVisible: "StoreKit Sandbox Age Sheet"
- takeScreenshot: "${activeScenario.id}_prompt"

# Simulate selecting Sandbox compliance decision
- tapOn: "Simulate Apple Sandbox Response"

# Confirm game state updates correctly
- takeScreenshot: "${activeScenario.id}_success_state"

# Terminate and save video proof
- runScript:
    commands:
      - "kill $(cat record.pid) && rm record.pid"`,

    bash: `#!/bin/bash
# -----------------------------------------------------------------------------
# Apple StoreKit Age Assurance Video Capture Automator
# Scenario: ${activeScenario.id}
# -----------------------------------------------------------------------------

BUNDLE="${config.bundleId}"
SCENARIO="${activeScenario.id}"
FILE_OUT="${videoFilename.replace('.webm', '.mp4')}"

echo "🚀 Preparing Automated Recording for Scenario: $SCENARIO"
echo "🎥 Output File: $FILE_OUT"

# Start screen recorder on booted simulator in the background
xcrun simctl io booted recordVideo --codec=h264 "$FILE_OUT" &
RECORD_PID=$!

sleep 1.5

# Open App with Sandbox Override
xcrun simctl openurl booted "${config.deepLink}?scenario=$SCENARIO"

echo "👉 Complete evaluation inside Simulator now."
echo "Press [ENTER] to stop and save compliance proof..."
read -r

kill -SIGINT $RECORD_PID
wait $RECORD_PID 2>/dev/null

echo "✅ Video Proof Saved to: $FILE_OUT"`,

    xctest: `import XCTest

class StoreKitAgeAssuranceTests: XCTestCase {
    let app = XCUIApplication()
    let scenario = "${activeScenario.id}"
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments.append("--storekit-age-assurance-scenario")
        app.launchArguments.append(scenario)
        app.launch()
    }
    
    func testAgeAssuranceFlow() throws {
        let triggerButton = app.buttons["${config.triggerButtonId}"]
        XCTAssertTrue(triggerButton.waitForExistence(timeout: 5))
        triggerButton.tap()
        
        // Wait for StoreKit Sandbox age sheet to slide up
        let sandboxSheet = app.otherElements["StoreKit Sandbox Age Sheet"]
        XCTAssertTrue(sandboxSheet.waitForExistence(timeout: 10))
        
        // Take diagnostic screenshot
        let screen = XCUIScreen.main
        let startAttachment = XCTAttachment(screenshot: screen.screenshot())
        startAttachment.name = "\\(scenario)_Prompt_State"
        startAttachment.lifetime = .keepAlways
        add(startAttachment)
        
        // Tap confirmation simulation
        let simulateButton = app.buttons["Simulate Apple Sandbox Response"]
        XCTAssertTrue(simulateButton.waitForExistence(timeout: 5))
        simulateButton.tap()
        
        // Capture verified success state
        let successAttachment = XCTAttachment(screenshot: screen.screenshot())
        successAttachment.name = "\\(scenario)_Outcome"
        successAttachment.lifetime = .keepAlways
        add(successAttachment)
    }
}`
  };

  const getActiveScriptText = () => {
    return scripts[activeScriptTab];
  };

  const handleExportJSONReport = () => {
    const passed = scenarios.filter(s => s.status === 'Pass').length;
    const failed = scenarios.filter(s => s.status === 'Fail').length;
    const pending = scenarios.filter(s => s.status === 'Not Started' || s.status === 'In Progress').length;
    const total = scenarios.length;

    const payload = {
      complianceReportType: "StoreKit Age Assurance Compliance Checklist",
      generatedAt: new Date().toISOString(),
      tester: config.testerName,
      appVersion: config.appVersion,
      bundleId: config.bundleId,
      device: config.deviceName,
      score: `${passed}/${total} Scenarios Passed`,
      checklist: scenarios.map(s => ({
        id: s.id,
        name: s.name,
        category: s.consentRevoked ? "Consent Revoked" : "Standard",
        status: s.status,
        notes: s.notes || "",
        videoFile: s.videoName || "No proof attached"
      }))
    };

    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", str);
    dl.setAttribute("download", `StoreKit_ComplianceReport_${appVerClean}_${dateString}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-950">
      
      {/* Sleek Flat Top Branding Header */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-sm border-b border-slate-800 flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center border border-blue-400/20">
            <ShieldCheck className="w-5 h-5 text-blue-50" />
          </div>
          <div className="text-left">
            <h1 className="text-sm font-bold tracking-tight">StoreKit Age Assurance Compliance Companion</h1>
            <p className="text-[11px] text-slate-400">Automated scenario mapping, video-proof capture, and audit log manager</p>
          </div>
        </div>

        {/* Audit Configuration Inputs Bar directly in Header */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Tester:</label>
            <input 
              type="text" 
              value={config.testerName}
              onChange={(e) => setConfig({ ...config, testerName: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Version:</label>
            <input 
              type="text" 
              value={config.appVersion}
              onChange={(e) => setConfig({ ...config, appVersion: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Bundle:</label>
            <input 
              type="text" 
              value={config.bundleId}
              onChange={(e) => setConfig({ ...config, bundleId: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Instructions
          </button>
        </div>
      </header>

      {/* Main 3-Column Minimalist Grid */}
      <main className="flex-1 w-full px-6 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch overflow-y-auto">
        
        {/* ================= COLUMN 1: COMPLIANCE SCENARIOS (xl:col-span-4) ================= */}
        <section className="xl:col-span-4 bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-900">12 Compliance Scenarios</h2>
              <p className="text-[11px] text-slate-400">Map and verify legal age override statuses</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Reset all compliance checklist statuses, notes, and recordings?")) {
                  setScenarios(DEFAULT_SCENARIOS);
                  localStorage.removeItem('storekit_age_scenarios');
                }
              }}
              className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Reset Progress
            </button>
          </div>

          {/* Scrollable List container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 pt-4 text-left">
            
            {/* Standard Scenarios */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age Assurance Results</h3>
              </div>
              <div className="space-y-2">
                {standardScenarios.map((scen) => {
                  const isActive = scen.id === activeScenarioId;
                  return (
                    <div
                      key={scen.id}
                      onClick={() => setActiveScenarioId(scen.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-left flex flex-col gap-2 ${
                        isActive 
                          ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-100/50' 
                          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                          {scen.name}
                        </h4>
                        
                        <select
                          value={scen.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(scen.id, e.target.value as TestScenario['status'])}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shrink-0 ${
                            scen.status === 'Pass' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : scen.status === 'Fail' 
                                ? 'bg-red-50 text-red-700' 
                                : scen.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <option value="Not Started">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>

                      {/* Info badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                        <span className="bg-slate-50 px-1 py-0.5 rounded border border-slate-100">Ages: {scen.minAge}-{scen.maxAge}</span>
                        <span className="bg-slate-50 px-1 py-0.5 rounded border border-slate-100 capitalize">{scen.verificationType}</span>
                        {scen.videoUrl && (
                          <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-sans font-semibold flex items-center gap-0.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            Video Proof
                          </span>
                        )}
                      </div>

                      {/* Collapsible notes editor when active */}
                      {isActive && (
                        <div onClick={(e) => e.stopPropagation()} className="pt-2 border-t border-slate-100 space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Audit Log Notes:</label>
                          <textarea
                            rows={2}
                            value={scen.notes || ''}
                            onChange={(e) => handleUpdateNotes(scen.id, e.target.value)}
                            className="w-full text-[10px] p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 leading-normal"
                            placeholder="Add compliance notes or observation logs..."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consent Revoked Scenarios */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age Assurance with Consent Revoked</h3>
              </div>
              <div className="space-y-2">
                {revokedScenarios.map((scen) => {
                  const isActive = scen.id === activeScenarioId;
                  return (
                    <div
                      key={scen.id}
                      onClick={() => setActiveScenarioId(scen.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-left flex flex-col gap-2 ${
                        isActive 
                          ? 'bg-purple-50/30 border-purple-200 ring-1 ring-purple-100/50' 
                          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2">
                          {scen.name}
                        </h4>
                        
                        <select
                          value={scen.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(scen.id, e.target.value as TestScenario['status'])}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shrink-0 ${
                            scen.status === 'Pass' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : scen.status === 'Fail' 
                                ? 'bg-red-50 text-red-700' 
                                : scen.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <option value="Not Started">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>

                      {/* Info badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                        <span className="bg-slate-50 px-1 py-0.5 rounded border border-slate-100">Ages: {scen.minAge}-{scen.maxAge}</span>
                        <span className="bg-slate-50 px-1 py-0.5 rounded border border-slate-100 capitalize">{scen.verificationType}</span>
                        {scen.videoUrl && (
                          <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-sans font-semibold flex items-center gap-0.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            Video Proof
                          </span>
                        )}
                      </div>

                      {/* Collapsible notes editor when active */}
                      {isActive && (
                        <div onClick={(e) => e.stopPropagation()} className="pt-2 border-t border-slate-100 space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Audit Log Notes:</label>
                          <textarea
                            rows={2}
                            value={scen.notes || ''}
                            onChange={(e) => handleUpdateNotes(scen.id, e.target.value)}
                            className="w-full text-[10px] p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400 leading-normal"
                            placeholder="Add compliance notes or observation logs..."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Stats & Export JSON */}
          <div className="pt-4 border-t border-slate-100 shrink-0 space-y-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-bold text-slate-800">{scenarios.filter(s => s.status === 'Pass').length} / 12 Pass</span>
              </div>
              <div className="flex justify-between">
                <span>With Video:</span>
                <span className="font-bold text-slate-800">{scenarios.filter(s => s.videoUrl).length} / 12 Linked</span>
              </div>
            </div>
            <button
              onClick={handleExportJSONReport}
              className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit Compliance JSON
            </button>
          </div>
        </section>

        {/* ================= COLUMN 2: SEAMLESS RECORDER (xl:col-span-5) ================= */}
        <section className="xl:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-600" />
                Seamless Screen Recorder
              </h2>
              <p className="text-[11px] text-slate-400">Zero third-party dependencies or mirroring tools required</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
            
            {/* Active Test Target Summary card */}
            <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                  Active Audit Target
                </span>
                <span className="text-[10px] font-mono text-slate-400">Scenario: {activeScenario.id}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 mt-2">{activeScenario.name}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-normal">{activeScenario.description}</p>
              
              {/* Expected compliance behaviors checklist */}
              <div className="mt-3.5 pt-3.5 border-t border-blue-100/50 space-y-2">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Required Compliance Verification Checklist:</h4>
                <div className="space-y-1.5">
                  {activeScenario.expectedBehavior.map((behavior, idx) => {
                    const key = `${activeScenario.id}_chk_${idx}`;
                    const isChecked = !!checklistProgress[key];
                    return (
                      <label 
                        key={idx}
                        className={`flex items-start gap-2.5 p-1.5 rounded text-[11px] leading-snug cursor-pointer select-none transition-colors ${
                          isChecked ? 'bg-emerald-50/40 text-emerald-800' : 'text-slate-600 hover:bg-slate-100/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setChecklistProgress(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }));
                          }}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{behavior}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recording Workspace Canvas */}
            <div className="border border-slate-200/80 rounded-xl bg-slate-50/40 p-5 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
              
              {recordingState === 'idle' && (
                <div className="text-center space-y-4 max-w-[340px]">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100/40">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Record Connected Screen or Window</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Mirror your physical device or simulator onto your screen. Click below, choose that window, perform the test, and link it as compliance proof.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <button
                      onClick={startScreenCapture}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Capture Screen
                    </button>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-all bg-white cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Mp4/WebM
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
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100 animate-pulse">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Capture Ready</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click Start below and evaluate the scenario inside your app.</p>
                  </div>
                  <button
                    onClick={startRecording}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    Start Capturing
                  </button>
                </div>
              )}

              {recordingState === 'recording' && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 animate-pulse">
                    <Square className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-slate-800 tracking-wider">
                      {formatTimer(recordingTimer)}
                    </div>
                    <p className="text-xs text-red-600 font-semibold mt-1">Recording active compliance proof...</p>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Stop & Finish
                  </button>
                </div>
              )}

              {recordingState === 'preview' && (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="w-full max-w-[320px] aspect-video bg-black rounded-lg overflow-hidden border border-slate-100 shadow-sm relative">
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-slate-800">Preview Compliance Video</h4>
                    <p className="text-[10px] text-slate-400">Save to store it directly under this scenario's evidence folder.</p>
                  </div>
                  <div className="flex gap-2 w-full max-w-[280px]">
                    <button
                      onClick={handleSaveCapture}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Save & Link
                    </button>
                    <button
                      onClick={() => {
                        setRecordingState('idle');
                        setStream(null);
                      }}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded text-xs font-medium cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Display active scenario's saved compliance video if one exists */}
            {activeScenario.videoUrl && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-left min-w-0">
                  <Film className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-emerald-800">Saved Video Compliance Proof</h4>
                    <p className="text-[10px] font-mono text-emerald-600 truncate break-all">{activeScenario.videoName}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <a 
                    href={activeScenario.videoUrl} 
                    download={activeScenario.videoName}
                    className="p-1.5 bg-white border border-emerald-200 hover:bg-emerald-100/50 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                    title="Download recorded clip"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleDiscardVideo(activeScenario.id)}
                    className="p-1.5 bg-white border border-emerald-200 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Discard proof"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Regulatory renaming mask block */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-left space-y-2">
              <div className="flex items-start gap-2.5">
                <Settings className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="space-y-1 w-full min-w-0">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apple Sandbox Compliance Naming Mask</h4>
                  <div className="bg-white p-2 rounded border border-slate-200/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-800 break-all select-all">{videoFilename}</span>
                    <button
                      onClick={() => handleCopyScript(videoFilename)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 shrink-0 transition-colors cursor-pointer"
                      title="Copy filename mask"
                    >
                      {scriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal pt-1">
                    Ensures video proof meets regulatory guidelines for App Store compliance submissions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= COLUMN 3: AUTOMATION SCRIPT (xl:col-span-3) ================= */}
        <section className="xl:col-span-3 bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
          <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 shrink-0">
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-600" />
                Automation Script
              </h2>
              <p className="text-[11px] text-slate-400">Generate target script templates on-the-fly</p>
            </div>
            
            {/* Simple tab buttons */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-lg">
              {(['maestro', 'bash', 'xctest'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveScriptTab(tab)}
                  className={`py-1 text-[10px] font-bold rounded-md capitalize transition-all cursor-pointer ${
                    activeScriptTab === tab 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'xctest' ? 'XCTest' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Script Content Area */}
          <div className="flex-1 flex flex-col space-y-4 pt-4 overflow-hidden min-h-0 text-left">
            
            {/* Brief active tab description */}
            <div className="p-2.5 bg-blue-50/20 border border-blue-100/30 rounded-lg text-[10px] text-slate-600 leading-relaxed shrink-0">
              {activeScriptTab === 'maestro' && "Maestro triggers the native sandbox sheet and captures screenshots programmatically."}
              {activeScriptTab === 'bash' && "Bash utility spins up simctl background video capturing on physical and booted devices."}
              {activeScriptTab === 'xctest' && "Native iOS XCTest UI Automation. Asserts the StoreKit layout and stores success logs."}
            </div>

            {/* Codeblock */}
            <div className="flex-1 bg-slate-900 border border-slate-950 rounded-lg flex flex-col overflow-hidden min-h-[220px]">
              
              {/* Code header */}
              <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-mono text-slate-500">
                  {activeScriptTab === 'maestro' ? 'maestro_test.yml' : activeScriptTab === 'bash' ? 'capture_proof.sh' : 'StoreKitTests.swift'}
                </span>
                
                <button
                  onClick={() => handleCopyScript(getActiveScriptText())}
                  className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold font-mono text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  {scriptCopied ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      COPY
                    </>
                  )}
                </button>
              </div>

              {/* Source pre */}
              <pre className="flex-1 overflow-auto p-3 text-[10px] font-mono text-slate-300 leading-normal select-all select-text">
                <code>{getActiveScriptText()}</code>
              </pre>
            </div>

            {/* Helpful CLI Tip */}
            <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100 text-left space-y-1 shrink-0">
              <h5 className="text-[9px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" />
                iOS Simulator Recording Tip
              </h5>
              <p className="text-[10px] text-slate-600 leading-normal">
                You can record a booted Xcode Simulator at any time via Terminal using:
              </p>
              <code className="block bg-white border border-amber-200 text-[9px] font-mono p-1 rounded text-slate-800 break-all select-all select-text">
                xcrun simctl io booted recordVideo compliance.mp4
              </code>
            </div>

          </div>
        </section>

      </main>

      {/* Help Instructions Slide-over panel */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-end">
            <div className="absolute inset-0" onClick={() => setIsHelpOpen(false)}></div>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-white shadow-xl flex flex-col z-10"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-left">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-800">Quick Testing Instructions</h3>
                </div>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-left space-y-4 text-xs text-slate-700 leading-relaxed">
                <h4 className="font-bold text-slate-900 text-sm">How to capture and link compliance videos:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Select a Scenario:</strong> Choose any of the 12 scenarios on the left panel to set it as the active target. This updates the Expected Behavior Checklist and Script codes.</li>
                  <li><strong>Initialize Screen Sharing:</strong> Click <strong>"Capture Screen"</strong> in the middle panel and select the specific window or screen displaying your game or iOS Simulator.</li>
                  <li><strong>Perform Testing:</strong> Click <strong>"Start Capturing"</strong>, perform the age assurance validation flow in your app, checking off the expected behaviors as you complete them.</li>
                  <li><strong>Save & Link Proof:</strong> Click <strong>"Stop & Finish"</strong>. Review the recorded video in the workspace preview, then click <strong>"Save & Link"</strong> to save the video directly to that scenario.</li>
                  <li><strong>Download Results:</strong> Use the <strong>"Download Audit Compliance JSON"</strong> button on the left to export your complete sign-off results.</li>
                </ol>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600">
                  <h5 className="font-bold text-slate-900 mb-1">Local Files:</h5>
                  If you preferred recording your compliance videos directly on an iOS Device, use the <strong>"Upload Mp4/WebM"</strong> button to drop files in. They will be auto-linked and renamed in compliance with standard regulations!
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-quality minimalist footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-[10px] text-slate-400 shrink-0">
        StoreKit Age Assurance Compliance Companion &bull; Built in alignment with App Store Sandbox Guidelines
      </footer>

    </div>
  );
}
