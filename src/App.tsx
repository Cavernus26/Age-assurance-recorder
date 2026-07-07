import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Smartphone, Video, FileText, ClipboardList, BookOpen, 
  Terminal, CheckCircle, HelpCircle, Save, Download, AlertTriangle, Play, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Types
import { TestScenario, AutomationConfig } from './types';
import { DEFAULT_SCENARIOS } from './scenariosData';

// Import Custom Modular Components
import Intro from './components/Intro';
import Simulator from './components/Simulator';
import Recorder from './components/Recorder';
import ScriptGenerator from './components/ScriptGenerator';
import ReportExport from './components/ReportExport';

export default function App() {
  // Scenarios State - load from localStorage or fall back to default data
  const [scenarios, setScenarios] = useState<TestScenario[]>(() => {
    const saved = localStorage.getItem('storekit_age_scenarios');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure blobs are reconstructed if needed, but standard URLs are preserved
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved scenarios, loading defaults", e);
      }
    }
    return DEFAULT_SCENARIOS;
  });

  // Selected Active Scenario
  const [activeScenarioId, setActiveScenarioId] = useState<string>('under13_strict');

  // Automation & Reporting Config
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
      testerName: 'Senior Game QA Lead',
      appVersion: 'v3.4.0-Beta'
    };
  });

  // Tab State: 'guide' | 'simulator' | 'recorder' | 'scripts' | 'report'
  const [activeTab, setActiveTab] = useState<'guide' | 'simulator' | 'recorder' | 'scripts' | 'report'>('guide');

  // Sync state to local storage to preserve test progress
  useEffect(() => {
    localStorage.setItem('storekit_age_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    localStorage.setItem('storekit_automation_config', JSON.stringify(config));
  }, [config]);

  // Handle status update of a scenario
  const handleUpdateStatus = (id: string, status: TestScenario['status']) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, status, lastTested: new Date().toISOString() } : s));
  };

  // Handle notes update
  const handleUpdateNotes = (id: string, notes: string) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, notes } : s));
  };

  // Link recorded video blob and metadata to scenario
  const handleVideoCaptured = (scenarioId: string, videoBlob: Blob, videoName: string, url: string) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === scenarioId) {
        return {
          ...s,
          videoUrl: url,
          videoName,
          status: 'Pass', // Auto-promote to Pass upon successful video linking!
          lastTested: new Date().toISOString()
        };
      }
      return s;
    }));
    alert(`Success: Video proof linked to "${scenarioId.toUpperCase()}" scenario!`);
  };

  // Discard a linked video
  const handleDeleteVideo = (scenarioId: string) => {
    if (window.confirm("Are you sure you want to remove this video recording?")) {
      setScenarios(prev => prev.map(s => s.id === scenarioId ? { ...s, videoUrl: undefined, videoName: undefined } : s));
    }
  };

  // Handle simulation trigger callback (from inside iOS Simulator tool)
  const handleSimulatorScenarioResult = (outcome: string) => {
    // Determine status mapping
    let resultStatus: TestScenario['status'] = 'Pass';
    if (outcome === 'error') resultStatus = 'Fail';
    if (outcome === 'cancelled') resultStatus = 'In Progress';

    // Highlight the active scenario and prompt user to document it
    const targetScenario = scenarios.find(s => s.id === outcome) || scenarios.find(s => s.id === activeScenarioId);
    if (targetScenario) {
      setScenarios(prev => prev.map(s => {
        if (s.id === targetScenario.id) {
          return {
            ...s,
            status: resultStatus,
            notes: s.notes || `Simulated with device emulator. Outcome: ${outcome.toUpperCase()}`,
            lastTested: new Date().toISOString()
          };
        }
        return s;
      }));
    }
  };

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* Top Banner Branding Header */}
      <header className="bg-slate-950 text-white px-6 py-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-400/30">
            <ShieldCheck className="w-6 h-6 text-blue-50" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">StoreKit Age Assurance Sandbox Workspace</h1>
            <p className="text-xs text-slate-400">Official StoreKit 2 regulatory testing, screen recording companion, and compliance audit companion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 bg-slate-900 text-blue-400 border border-slate-800 rounded-lg flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Compliance Hub Active
          </span>
        </div>
      </header>

      {/* Main Container Dashboard */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive Test Registry (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Compliance Audit Registry</h3>
                <p className="text-[11px] text-slate-400">Map and verify legal requirements</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm("Reset all test statuses, notes, and video configurations?")) {
                    setScenarios(DEFAULT_SCENARIOS);
                    localStorage.removeItem('storekit_age_scenarios');
                  }
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear Progress
              </button>
            </div>

            {/* Scenarios Checklist Cards */}
            <div className="space-y-3">
              {scenarios.map((scenario) => {
                const isActive = scenario.id === activeScenarioId;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => {
                      setActiveScenarioId(scenario.id);
                      // If user clicks scenario, let's open guide or recorder
                      if (activeTab === 'guide' || activeTab === 'simulator') {
                        // keep active tab
                      } else {
                        setActiveTab('recorder');
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col space-y-2.5 ${
                      isActive 
                        ? 'bg-blue-50/40 border-blue-200/80 shadow-sm ring-1 ring-blue-100/50' 
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/60 hover:border-slate-300/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          SCENARIO {scenario.id.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                          {scenario.name.split(':')[1]?.trim() || scenario.name}
                        </h4>
                      </div>
                      
                      {/* Status pill selector dropdown */}
                      <select
                        value={scenario.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdateStatus(scenario.id, e.target.value as TestScenario['status'])}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                          scenario.status === 'Pass' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : scenario.status === 'Fail' 
                              ? 'bg-red-50 text-red-700' 
                              : scenario.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <option value="Not Started">Pending</option>
                        <option value="In Progress">Testing</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>

                    {/* Mini details: Video presence + Notes preview */}
                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-gray-100/60">
                      <span className="flex items-center gap-1">
                        {scenario.videoUrl ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50/60 px-1.5 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Video Linked
                          </span>
                        ) : (
                          <span className="text-gray-400">No Video Proof</span>
                        )}
                      </span>

                      {scenario.lastTested && (
                        <span className="text-gray-400 font-mono">
                          Tested: {new Date(scenario.lastTested).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Inline notes text area */}
                    {isActive && (
                      <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onClick={(e) => e.stopPropagation()}
                      className="pt-2 space-y-1.5 border-t border-blue-100/40"
                    >
                      <label className="text-[9px] font-bold text-slate-500 uppercase">QA Audit Notes & Errors</label>
                      <textarea
                        rows={2}
                        value={scenario.notes}
                        onChange={(e) => handleUpdateNotes(scenario.id, e.target.value)}
                        className="w-full text-[10px] p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-700 leading-normal"
                        placeholder="Log compliance exceptions, device logs or test details..."
                      />
                    </motion.div>
                  )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick-Stats Compliant Card */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-sm space-y-3.5 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Compliance Audit Check</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Audit Scenarios</span>
                <span className="font-mono font-bold">5 Scenarios</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Proof Video Coverage</span>
                <span className="font-mono font-bold text-emerald-400">
                  {scenarios.filter(s => s.videoUrl).length} / 5 Logged
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Passing Rate</span>
                <span className="font-mono font-bold text-blue-400">
                  {Math.round((scenarios.filter(s => s.status === 'Pass').length / 5) * 100)}% Passed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Workspace Panels (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Main Navigation Tabs */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm w-full">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'guide' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              1. Setup Guide
            </button>
            
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'simulator' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              2. Device Simulator
            </button>

            <button
              onClick={() => setActiveTab('recorder')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'recorder' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Video className="w-4 h-4" />
              3. Screen Recorder
            </button>

            <button
              onClick={() => setActiveTab('scripts')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'scripts' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              4. Automation Scripts
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'report' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              5. Audit Report
            </button>
          </div>

          {/* Tab Workspaces */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'guide' && (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Intro />
                </motion.div>
              )}

              {activeTab === 'simulator' && (
                <motion.div
                  key="simulator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  {/* Left Column: Simulator Controls */}
                  <div className="md:col-span-5 flex justify-center">
                    <Simulator onScenarioTrigger={handleSimulatorScenarioResult} />
                  </div>

                  {/* Right Column: Code integration reference for active scenario */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">Active Sandbox Case</h4>
                        <h3 className="text-sm font-bold text-slate-800 mt-0.5">{activeScenario.name}</h3>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regulatory Sandbox Setup:</h5>
                        <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 leading-relaxed font-medium">
                          {activeScenario.sandboxSetup}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Compliance UI Checkpoints:</h5>
                        <ul className="space-y-1.5">
                          {activeScenario.expectedBehavior.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-950 text-slate-300 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold">StoreKit 2 Swift API Implementation</span>
                        <span className="text-[9px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-800 rounded">SwiftUI</span>
                      </div>
                      <pre className="text-[11px] font-mono overflow-x-auto text-slate-200 bg-slate-900 p-4 rounded-xl max-h-[220px]">
                        <code>{activeScenario.swiftSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'recorder' && (
                <motion.div
                  key="recorder"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  {/* Left Column: Recording component */}
                  <div className="md:col-span-7">
                    <Recorder 
                      scenarios={scenarios}
                      activeScenarioId={activeScenarioId}
                      config={config}
                      onVideoCaptured={handleVideoCaptured}
                    />
                  </div>

                  {/* Right Column: Video Manager and Playback logs */}
                  <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Archive & Proof Library</h3>
                    <p className="text-[11px] text-slate-400">Review your compiled compliance recordings for audit export.</p>
                    
                    <div className="space-y-3 pt-2">
                      {scenarios.map(s => (
                        <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCENARIO: {s.id.toUpperCase()}</div>
                            <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                              {s.videoName || "No recording captured yet"}
                            </div>
                          </div>

                          {s.videoUrl ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a 
                                href={s.videoUrl} 
                                download={s.videoName} 
                                className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-all"
                                title="Download video"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button 
                                onClick={() => handleDeleteVideo(s.id)}
                                className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-all"
                                title="Remove video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">PENDING</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'scripts' && (
                <motion.div
                  key="scripts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ScriptGenerator 
                    config={config}
                    activeScenarioId={activeScenarioId}
                  />
                </motion.div>
              )}

              {activeTab === 'report' && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ReportExport 
                    scenarios={scenarios}
                    config={config}
                    onChangeConfig={setConfig}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-[10px] text-slate-400 mt-auto">
        StoreKit Sandbox Age Assurance Companion &bull; Powered by Google AI Studio
      </footer>

    </div>
  );
}
