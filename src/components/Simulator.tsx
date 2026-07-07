import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, ShieldAlert, ShieldCheck, RefreshCw, X, Check, Lock, 
  Unlock, HelpCircle, AlertTriangle, Fingerprint, Calendar, Gamepad2,
  Coins, MessageSquare, Eye, Shield, Users, Sparkles, Send, Radio
} from 'lucide-react';

interface SimulatorProps {
  onScenarioTrigger?: (outcome: string) => void;
}

type GameState = 'locked' | 'under13_strict' | 'under13_approved' | 'teen_pending' | 'teen_approved' | 'adult_unlocked' | 'error_state' | 'fallback_dob';

export default function Simulator({ onScenarioTrigger }: SimulatorProps) {
  // Game App State
  const [appState, setAppState] = useState<GameState>('locked');
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [dobInput, setDobInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>(['[System]: Welcome to Legend Quest Arena!']);
  const [inputText, setInputText] = useState('');
  
  // Custom Age Assurance Simulation States
  const [verificationOutcome, setVerificationOutcome] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1000); 
  const [isScanning, setIsScanning] = useState(false);

  // Triggering the Age Assurance check
  const handleTriggerVerification = () => {
    setIsPromptOpen(true);
    setVerificationOutcome(null);
    setIsScanning(false);
  };

  // Simulating the actual Face ID / ID verification step
  const handleSimulateVerification = (outcome: 'under13_strict' | 'under13_approved' | 'teen_ask_to_buy' | 'adult_unrestricted' | 'consent_cancelled' | 'error' | 'not_supported') => {
    setIsScanning(true);
    setVerificationOutcome(outcome);

    setTimeout(() => {
      setIsScanning(false);
      setIsPromptOpen(false);

      if (onScenarioTrigger) {
        onScenarioTrigger(outcome);
      }

      switch (outcome) {
        case 'adult_unrestricted':
          setAppState('adult_unlocked');
          setChatMessages(prev => [...prev, '[System]: Unrestricted Global Chat Room unlocked!']);
          break;
        case 'under13_strict':
          setAppState('under13_strict');
          setChatMessages(prev => [...prev, '[System]: COPPA compliance activated. Global chat locked.', '[System]: Canned Safe Chat only.']);
          break;
        case 'under13_approved':
          setAppState('under13_approved');
          setChatMessages(prev => [...prev, '[System]: Parental consent verified. Limited Co-op and Cloud Saves active!']);
          break;
        case 'teen_ask_to_buy':
          setAppState('teen_pending');
          break;
        case 'consent_cancelled':
          setAppState('locked');
          alert('StoreKit Simulator Note: User dismissed the sheet. Callback: .notCompleted / cancel.');
          break;
        case 'error':
          setErrorMessage('StoreKit Session Error: Failed to secure cryptographic token from Sandbox server.');
          setAppState('error_state');
          break;
        case 'not_supported':
          setAppState('fallback_dob');
          break;
      }
    }, simulationSpeed);
  };

  const handleDobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dobInput) return;
    
    // Calculate Age
    const birthDate = new Date(dobInput);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      setAppState('adult_unlocked');
      if (onScenarioTrigger) onScenarioTrigger('adult_unrestricted');
    } else if (age >= 13) {
      setAppState('teen_approved');
      if (onScenarioTrigger) onScenarioTrigger('teen_ask_to_buy');
    } else {
      setAppState('under13_strict');
      if (onScenarioTrigger) onScenarioTrigger('under13_strict');
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    setChatMessages(prev => [...prev, `[Player]: ${inputText}`]);
    setInputText('');
  };

  const handleSendCanned = (msg: string) => {
    setChatMessages(prev => [...prev, `[Player]: ${msg}`]);
  };

  const handleSimulateParentApproval = () => {
    setAppState('teen_approved');
    if (onScenarioTrigger) {
      onScenarioTrigger('teen_ask_to_buy');
    }
    setChatMessages(prev => [...prev, '[System]: StoreKit transaction approved by parent! Item delivered.']);
  };

  const resetSimulator = () => {
    setAppState('locked');
    setIsPromptOpen(false);
    setDobInput('');
    setErrorMessage('');
    setVerificationOutcome(null);
    setIsScanning(false);
    setChatMessages(['[System]: Welcome to Legend Quest Arena!']);
    setInputText('');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 shadow-inner w-full">
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">StoreKit 2 Sandbox Device Emulator</h3>
          <p className="text-xs text-gray-500 font-medium">Test actual in-game compliance responses</p>
        </div>
        <button 
          onClick={resetSimulator}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all cursor-pointer border border-slate-200/60"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Game
        </button>
      </div>

      {/* Outer Phone Frame */}
      <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[48px] shadow-2xl border-[11px] border-slate-800 flex flex-col overflow-hidden select-none">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3.5 h-3.5 bg-gray-900 rounded-full absolute left-4"></div>
          <div className="w-2.5 h-2.5 bg-blue-950 rounded-full absolute right-6"></div>
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1.2 bg-white/40 rounded-full z-50"></div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 bg-slate-900 flex flex-col relative pt-10 pb-6 overflow-hidden text-slate-100 font-sans">
          
          {/* Simulated Game Header */}
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/95 backdrop-blur z-10">
            <span className="font-bold text-xs tracking-tight text-amber-500 flex items-center gap-1">
              <Gamepad2 className="w-4 h-4" />
              Legend Quest
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">v3.4-QA</span>
          </div>

          {/* Main App Screens */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col">
            
            {/* LOCKED / INITIAL STATE */}
            {appState === 'locked' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-4"
              >
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-md shadow-amber-500/5">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Multiplayer Lobby Gated</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[190px] mx-auto leading-relaxed">
                    Verify legal age constraints to access global multiplayer battles and the crystals loot box depot.
                  </p>
                </div>

                <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-left space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Age Assurance Requirements:</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>COPPA strict safety for &lt;13s</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Ask-to-Buy overrides for Teens</span>
                  </div>
                </div>

                <button
                  onClick={handleTriggerVerification}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-950" />
                  Evaluate StoreKit Age
                </button>
              </motion.div>
            )}

            {/* UNDER 13 STRICT COPPA MODE */}
            {appState === 'under13_strict' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col space-y-3"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    COPPA Restricted Mode
                  </span>
                  <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-950/80 px-1.5 rounded">&lt;13 Child</span>
                </div>

                {/* Gated Shop Visual */}
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-2 z-10">
                    <Lock className="w-5 h-5 text-red-500 mb-1" />
                    <span className="text-[10px] font-bold text-red-400">Microtransactions Blocked</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">COPPA rules restrict real-money crystal packages.</p>
                  </div>
                  <div className="opacity-30 space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span>💎 500 crystals</span>
                      <span className="font-bold font-mono">$4.99</span>
                    </div>
                  </div>
                </div>

                {/* Safe Chat visual */}
                <div className="flex-1 bg-slate-950/40 border border-slate-800 rounded-xl flex flex-col p-2 min-h-[140px]">
                  <div className="text-[9px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-800 mb-1.5">Safe Global Lobby Chat</div>
                  <div className="flex-1 space-y-1 text-[10px] overflow-y-auto max-h-[80px]">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className="break-words text-slate-300 font-medium">{m}</div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <button 
                      onClick={() => handleSendCanned("Good luck! 👍")}
                      className="p-1 text-[9px] bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center cursor-pointer"
                    >
                      Good luck! 👍
                    </button>
                    <button 
                      onClick={() => handleSendCanned("Let's team up!")}
                      className="p-1 text-[9px] bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center cursor-pointer"
                    >
                      Let's team up!
                    </button>
                  </div>
                </div>

                {/* Tracker Visual */}
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Behavioral Profiling (IDFA)</span>
                  <span className="font-mono text-red-400 font-bold">DISABLED</span>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Return to Main Gate
                </button>
              </motion.div>
            )}

            {/* UNDER 13 SIGNIFICANT CHANGE APPROVED */}
            {appState === 'under13_approved' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col space-y-3"
              >
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Parent Override Verified
                  </span>
                  <span className="text-[9px] font-mono text-blue-500 font-bold bg-blue-950/80 px-1.5 rounded">Significant Change OK</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Parent-Unlocked Features</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-200">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Co-op Raid Battles: <strong className="text-emerald-400">UNLOCKED</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Secure Cloud Character Saves: <strong className="text-emerald-400">ACTIVE</strong></span>
                  </div>
                </div>

                {/* Shop is still restricted */}
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between">
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-center z-10">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Real-Money purchases restricted
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">💎 Crystal Gacha</span>
                  <span className="text-[10px] font-bold font-mono text-slate-500">$9.99</span>
                </div>

                <div className="flex-1 bg-slate-950/40 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-[9px] font-mono text-slate-500">Multiplayer Server Feed:</span>
                  <div className="text-[10px] text-slate-300 mt-1.5 italic">
                    "Syncing secure co-op character logs... Parental approval payload is JWS verified."
                  </div>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer"
                >
                  Return to Main Gate
                </button>
              </motion.div>
            )}

            {/* TEEN PENDING - ASK TO BUY */}
            {appState === 'teen_pending' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-4"
              >
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/30 animate-pulse">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Transaction Pending</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                    "Ask to Buy" alert dispatched to Parent's iCloud account. Purchase will complete once approved.
                  </p>
                </div>

                {/* Gacha Drop rates shown (Legally mandatory) */}
                <div className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-left space-y-1.5">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">Mandatory Drop Rate Probabilities:</div>
                  <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-300 font-mono">
                    <div className="p-1 bg-slate-900 rounded text-center">Epic: <strong className="text-purple-400">5%</strong></div>
                    <div className="p-1 bg-slate-900 rounded text-center">Rare: <strong className="text-blue-400">25%</strong></div>
                    <div className="p-1 bg-slate-900 rounded text-center">Common: <strong className="text-slate-400">70%</strong></div>
                  </div>
                </div>

                <div className="space-y-2 w-full pt-2">
                  <button
                    onClick={handleSimulateParentApproval}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Simulate Parent Approval (Sandbox)
                  </button>
                  <button
                    onClick={() => setAppState('locked')}
                    className="w-full py-1.5 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </motion.div>
            )}

            {/* TEEN APPROVED */}
            {appState === 'teen_approved' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col space-y-3"
              >
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    Teen Store Active
                  </span>
                  <span className="text-[9px] font-mono text-blue-400 font-bold bg-blue-950/80 px-1.5 rounded">Age 13-17</span>
                </div>

                {/* Lootbox active */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">💎 Premium Gacha Pack</span>
                    <span className="text-xs font-bold font-mono text-slate-300">$9.99</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    Contains random loot. Drop Rates: Legendary (5%), Epic (25%), Common (70%).
                  </p>
                  <button 
                    onClick={() => alert("Simulating a teen gacha roll! (Ask-to-Buy bypassed since currently parentally approved)")}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Purchase Pack
                  </button>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex-1 text-[10px] space-y-1">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Compliance State:</div>
                  <div className="text-slate-300">Ask-to-Buy Gated: <strong className="text-emerald-400">YES</strong></div>
                  <div className="text-slate-300">Loot Box Disclosures: <strong className="text-emerald-400">SHOWN</strong></div>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer"
                >
                  Return to Main Gate
                </button>
              </motion.div>
            )}

            {/* ADULT UNLOCKED */}
            {appState === 'adult_unlocked' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col space-y-3"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" />
                    Adult Unrestricted Active
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 rounded">18+ Verified</span>
                </div>

                {/* Active crystal store */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold flex items-center gap-1 text-slate-100">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      💎 Vault of Crystals
                    </span>
                    <span className="font-bold font-mono text-emerald-400">$49.99</span>
                  </div>
                  <button 
                    onClick={() => alert("Simulating adult checkout. No parent verification required!")}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-[10px] text-white rounded-lg cursor-pointer"
                  >
                    Buy Crystals Instantly
                  </button>
                </div>

                {/* Free Text Chat */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col min-h-[120px]">
                  <div className="text-[9px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-800 mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-emerald-400" /> Unrestricted Global Chat
                  </div>
                  <div className="flex-1 space-y-1 text-[10px] overflow-y-auto max-h-[75px] scrollbar-thin">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className="break-words font-medium text-slate-200">{m}</div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1 pt-1.5 border-t border-slate-800">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder="Type a custom message..."
                      className="flex-1 text-[10px] px-2 py-1 bg-slate-900 border border-slate-850 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleSendText}
                      className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-[9px] text-slate-400">
                  <span>Ad Personalization & Profiling</span>
                  <span className="font-mono text-emerald-400 font-semibold">ACTIVE (IDFA OK)</span>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1 text-[10px] text-slate-500 hover:text-slate-400 transition-all cursor-pointer text-center"
                >
                  Re-Lock Session
                </button>
              </motion.div>
            )}

            {/* ERROR STATE */}
            {appState === 'error_state' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-6"
              >
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-3 border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">Verification Error</h4>
                <p className="text-[11px] text-slate-400 mt-2 max-w-[190px] leading-relaxed">
                  {errorMessage || 'StoreKit encountered a network error while validating age requirements.'}
                </p>

                <button
                  onClick={handleTriggerVerification}
                  className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl shadow-sm transition-all border border-slate-700 cursor-pointer"
                >
                  Retry StoreKit Connection
                </button>
                <button
                  onClick={() => setAppState('locked')}
                  className="mt-3 text-xs text-slate-500 hover:text-slate-400 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {/* FALLBACK MANUAL DOB INPUT */}
            {appState === 'fallback_dob' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col text-slate-200"
              >
                <div className="text-center py-2">
                  <div className="w-11 h-11 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-3 mx-auto border border-blue-500/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">Manual Verification</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Native Apple StoreKit Age Assurance is unavailable. Enter birthdate for COPPA routing.
                  </p>
                </div>

                <form onSubmit={handleDobSubmit} className="mt-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Birth Date</label>
                    <input
                      type="date"
                      required
                      value={dobInput}
                      onChange={(e) => setDobInput(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-[9px] text-slate-400 leading-normal bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                      Your date of birth will be processed locally and securely on-device to enforce children protection regulations.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Verify DOB
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppState('locked')}
                      className="w-full py-2 border border-slate-800 text-slate-400 text-xs font-medium rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      Back to Native
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>

          {/* SIMULATED SYSTEM SHEET: Apple StoreKit Age Assurance Sheet */}
          <AnimatePresence>
            {isPromptOpen && (
              <div className="absolute inset-0 bg-black/60 z-40 flex flex-col justify-end">
                {/* Dismiss backdrop click */}
                <div className="flex-1" onClick={() => handleSimulateVerification('consent_cancelled')}></div>

                {/* Apple System Sheet Drawer */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="bg-slate-900 text-white rounded-t-[32px] p-5 pb-8 relative shadow-2xl border-t border-slate-800 flex flex-col items-center"
                >
                  {/* Pull Indicator */}
                  <div className="w-10 h-1 bg-slate-700 rounded-full mb-4"></div>

                  <div className="w-full flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold"></div>
                      <span className="text-xs font-semibold text-slate-400">StoreKit Sandbox Age Sheet</span>
                    </div>
                    <button 
                      onClick={() => handleSimulateVerification('consent_cancelled')}
                      className="text-slate-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  {isScanning ? (
                    <div className="py-10 flex flex-col items-center text-center">
                      <motion.div 
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/30"
                      >
                        <Fingerprint className="w-8 h-8 animate-pulse" />
                      </motion.div>
                      <span className="text-sm font-semibold text-white mt-4 tracking-tight">Verifying Sandbox Identity...</span>
                      <span className="text-[11px] text-slate-400 mt-1">Connecting to App Store Sandbox overrides</span>
                    </div>
                  ) : (
                    <div className="w-full">
                      <h3 className="text-sm font-bold text-center text-white tracking-tight leading-snug">
                        Verify Sandbox Age Account
                      </h3>
                      <p className="text-[11px] text-slate-400 text-center mt-1 px-4 leading-normal">
                        Apple will securely verify your sandbox player age classification to satisfy children safety audits.
                      </p>

                      {/* Sandbox Testing Choices (Simulates Sandbox User selection) */}
                      <div className="mt-5 space-y-2">
                        <div className="text-[9px] font-mono font-semibold text-amber-500 uppercase tracking-wider mb-2 text-center">
                          Simulate Apple Sandbox Response:
                        </div>

                        {/* Approved Adult 18+ */}
                        <button
                          onClick={() => handleSimulateVerification('adult_unrestricted')}
                          className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-emerald-950/40 hover:border-emerald-500/50 rounded-xl border border-slate-700/60 transition-all text-left cursor-pointer"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Adult 18+ Verified
                            </div>
                            <div className="text-[9px] text-slate-400">Meets adult criteria. Unrestricted play.</div>
                          </div>
                          <span className="text-[9px] font-mono bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded">Outcome 4</span>
                        </button>

                        {/* Under 13 COPPA Restricted */}
                        <button
                          onClick={() => handleSimulateVerification('under13_strict')}
                          className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-red-950/40 hover:border-red-500/50 rounded-xl border border-slate-700/60 transition-all text-left cursor-pointer"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              Under 13 - Strict COPPA Gate
                            </div>
                            <div className="text-[9px] text-slate-400">Disables microtransactions, tracking, & text chat.</div>
                          </div>
                          <span className="text-[9px] font-mono bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded">Outcome 1</span>
                        </button>

                        {/* Under 13 Significant Change Approved */}
                        <button
                          onClick={() => handleSimulateVerification('under13_approved')}
                          className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-blue-950/40 hover:border-blue-500/50 rounded-xl border border-slate-700/60 transition-all text-left cursor-pointer"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Under 13 - Significant Change Approved
                            </div>
                            <div className="text-[9px] text-slate-400">Parent overrides restrictions. Unlocks co-op & saves.</div>
                          </div>
                          <span className="text-[9px] font-mono bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded">Outcome 2</span>
                        </button>

                        {/* Teen Ask to Buy */}
                        <button
                          onClick={() => handleSimulateVerification('teen_ask_to_buy')}
                          className="w-full flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-amber-950/40 hover:border-amber-500/50 rounded-xl border border-slate-700/60 transition-all text-left cursor-pointer"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                              <Radio className="w-3 h-3" />
                              Teen - Ask to Buy Required
                            </div>
                            <div className="text-[9px] text-slate-400">Shows loot box rates. Suspends buy till approved.</div>
                          </div>
                          <span className="text-[9px] font-mono bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded">Outcome 3</span>
                        </button>

                        {/* Action buttons grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSimulateVerification('error')}
                            className="p-2 bg-slate-800/80 hover:bg-amber-950/30 hover:border-amber-500/40 rounded-xl border border-slate-700/60 transition-all text-left cursor-pointer"
                          >
                            <div className="text-[10px] font-bold text-amber-500">Simulation Error</div>
                            <div className="text-[8.5px] text-slate-400">Test failure fallbacks.</div>
                          </button>

                          <button
                            onClick={() => handleSimulateVerification('not_supported')}
                            className="p-2 bg-slate-800/80 hover:bg-slate-950 hover:border-slate-600 rounded-xl border border-slate-700/60 transition-all text-left cursor-pointer"
                          >
                            <div className="text-[10px] font-bold text-slate-300">Unsupported Region</div>
                            <div className="text-[8.5px] text-slate-400">DOB manual fallback.</div>
                          </button>
                        </div>

                        <button
                          onClick={() => handleSimulateVerification('consent_cancelled')}
                          className="w-full mt-2 py-2 text-center text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        >
                          Cancel / Dismiss Sheet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Secure Privacy Banner */}
                  <div className="mt-5 pt-3 border-t border-slate-800 w-full flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    Apple Secure Sandbox Age Verification (StoreKit 2)
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
