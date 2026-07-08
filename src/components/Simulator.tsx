import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, ShieldAlert, ShieldCheck, RefreshCw, X, Check, Lock, 
  Unlock, HelpCircle, AlertTriangle, Fingerprint, Calendar, Gamepad2,
  Coins, MessageSquare, Eye, Shield, Users, Sparkles, Send, Radio
} from 'lucide-react';
import { TestScenario } from '../types';

interface SimulatorProps {
  activeScenario: TestScenario;
  onScenarioTrigger?: (outcome: string) => void;
}

type DeviceAppState = 
  | 'locked' 
  | 'child_strict' 
  | 'child_approved' 
  | 'teen_restricted' 
  | 'adult_unlocked' 
  | 'declined' 
  | 'fallback_dob' 
  | 'consent_revoked'
  | 'error_state';

export default function Simulator({ activeScenario, onScenarioTrigger }: SimulatorProps) {
  // Mobile app state
  const [appState, setAppState] = useState<DeviceAppState>('locked');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [dobInput, setDobInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>(['[System]: Welcome to Legend Quest Arena!']);
  const [inputText, setInputText] = useState('');

  // Reset the simulator state whenever the active scenario changes
  useEffect(() => {
    resetSimulator();
  }, [activeScenario]);

  const resetSimulator = () => {
    setAppState('locked');
    setIsSheetOpen(false);
    setIsScanning(false);
    setDobInput('');
    setChatMessages(['[System]: Welcome to Legend Quest Arena!']);
    setInputText('');
  };

  // Run simulation based on active scenario's official parameters
  const handleTriggerStoreKit = () => {
    setIsSheetOpen(true);
    setIsScanning(false);
  };

  const handleSimulateSandboxResponse = () => {
    setIsScanning(true);

    // Simulate networking delay
    setTimeout(() => {
      setIsScanning(false);
      setIsSheetOpen(false);

      // Report result back to parent dashboard to log the status
      if (onScenarioTrigger) {
        onScenarioTrigger(activeScenario.id);
      }

      // Check if consent is revoked
      if (activeScenario.consentRevoked) {
        setAppState('consent_revoked');
        setChatMessages(prev => [
          ...prev, 
          '[System]: StoreKit 2 update received.',
          '[System]: ⚠️ COMPLIANCE FAULT: Age consent revoked by parent/guardian.',
          '[System]: Social features and purchases disabled.'
        ]);
        return;
      }

      // Check decision
      if (activeScenario.decision === 'decline') {
        setAppState('declined');
        setChatMessages(prev => [
          ...prev, 
          '[System]: StoreKit query completed.',
          '[System]: ❌ ACCESS DECLINED by guardian. Social lobbies restricted.'
        ]);
      } else if (activeScenario.decision === 'AskError.notAvailable') {
        // Fallback to manual date of birth check or error state
        if (activeScenario.id === 'adult_unconfirmed') {
          setAppState('fallback_dob');
          setChatMessages(prev => [
            ...prev, 
            '[System]: StoreKit returned notAvailable.',
            '[System]: Launching mandatory local DOB check.'
          ]);
        } else {
          setAppState('adult_unlocked');
          setChatMessages(prev => [
            ...prev,
            '[System]: StoreKit verification succeeded via default local keys.',
            '[System]: Unrestricted Global Chat unlocked!'
          ]);
        }
      } else if (activeScenario.decision === 'approve') {
        // Evaluate based on age categories
        if (activeScenario.maxAge && activeScenario.maxAge !== '—' && parseInt(activeScenario.maxAge) <= 12) {
          if (activeScenario.significantChange === 'True') {
            setAppState('child_approved');
            setChatMessages(prev => [
              ...prev,
              '[System]: JWS signature verified.',
              '[System]: Parent override approved! Unlocked secure cloud saves & co-op mode!'
            ]);
          } else {
            setAppState('child_strict');
            setChatMessages(prev => [
              ...prev,
              '[System]: strict COPPA child restrictions activated.',
              '[System]: Shop locked. Direct typing disabled.'
            ]);
          }
        } else if (activeScenario.minAge && activeScenario.minAge !== '—' && parseInt(activeScenario.minAge) >= 13 && activeScenario.maxAge && activeScenario.maxAge !== '—' && parseInt(activeScenario.maxAge) <= 17) {
          // Teenager 13-17
          setAppState('teen_restricted');
          setChatMessages(prev => [
            ...prev,
            '[System]: Teenager sandbox profile loaded (13-17).',
            '[System]: Restricted store unlocked. Drop disclosures displayed.'
          ]);
        } else {
          // Adult
          setAppState('adult_unlocked');
          setChatMessages(prev => [
            ...prev,
            '[System]: Unrestricted adult play authorized (18+).',
            '[System]: Unrestricted Global Chat unlocked!'
          ]);
        }
      }
    }, 1200);
  };

  const handleDobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dobInput) return;

    // Local calculation
    const birthDate = new Date(dobInput);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      setAppState('adult_unlocked');
      setChatMessages(prev => [...prev, '[System]: Manual DOB approved. Adult mode activated.']);
    } else if (age >= 13) {
      setAppState('teen_restricted');
      setChatMessages(prev => [...prev, '[System]: Manual DOB approved. Teen mode activated.']);
    } else {
      setAppState('child_strict');
      setChatMessages(prev => [...prev, '[System]: COPPA restricted mode activated based on birthdate.']);
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

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-200/60 shadow-sm w-full space-y-4">
      {/* Parameters Header */}
      <div className="w-full bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Active Scenario Parameters</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            activeScenario.consentRevoked 
              ? 'bg-red-50 text-red-600 border border-red-200/40' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/40'
          }`}>
            Consent: {activeScenario.consentRevoked ? 'REVOKED' : 'ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
          <div>
            <div className="text-slate-400 font-medium">Age Target</div>
            <div className="font-semibold text-slate-800 font-mono mt-0.5">
              {activeScenario.minAge !== '—' && activeScenario.maxAge !== '—' 
                ? `${activeScenario.minAge} - ${activeScenario.maxAge} Years`
                : activeScenario.minAge !== '—' 
                  ? `${activeScenario.minAge}+ Years` 
                  : `0 - ${activeScenario.maxAge} Years`
              }
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Verification Type</div>
            <div className="font-semibold text-slate-800 font-mono mt-0.5">{activeScenario.verificationType}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Significant Change</div>
            <div className="font-semibold text-slate-800 font-mono mt-0.5">{activeScenario.significantChange}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Sandbox Decision</div>
            <div className="font-semibold text-slate-800 font-mono mt-0.5 text-blue-600">{activeScenario.decision}</div>
          </div>
          <div className="col-span-2">
            <div className="text-slate-400 font-medium">Scenario Name</div>
            <div className="font-semibold text-slate-700 mt-0.5 truncate" title={activeScenario.name}>{activeScenario.name}</div>
          </div>
        </div>
      </div>

      {/* Outer Phone Frame */}
      <div className="relative w-[310px] h-[610px] bg-slate-950 rounded-[50px] shadow-2xl border-[11px] border-slate-900 flex flex-col overflow-hidden select-none">
        
        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 bg-slate-900 rounded-full absolute left-4"></div>
          <div className="w-2 h-2 bg-blue-950 rounded-full absolute right-6"></div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 bg-slate-900 flex flex-col relative pt-10 pb-4 overflow-hidden text-slate-100 font-sans">
          
          {/* Simulated Game Header */}
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/95 backdrop-blur z-10">
            <span className="font-bold text-xs tracking-tight text-amber-500 flex items-center gap-1">
              <Gamepad2 className="w-4 h-4" />
              Legend Quest
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">v3.4-QA</span>
          </div>

          {/* Phone Main Screen Area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col">
            
            {/* 1. LOCKED / INITIAL GATEWAY */}
            {appState === 'locked' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-4"
              >
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Multiplayer Lobby Gated</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[190px] mx-auto leading-relaxed">
                    Verify legal StoreKit age compliance constraints to unlock full co-op battles & premium loot-box items.
                  </p>
                </div>

                <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-left space-y-1.5">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Expected Compliance:</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>COPPA strict safety if &lt;13</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Ask-to-Buy and disclosure gates for Teens</span>
                  </div>
                </div>

                <button
                  onClick={handleTriggerStoreKit}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-950" />
                  Evaluate StoreKit Age
                </button>
              </motion.div>
            )}

            {/* 2. CHILD STRICT COPPA MODE */}
            {appState === 'child_strict' && (
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

                {/* Restricted Storefront Display */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 relative overflow-hidden text-center">
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-2 z-10">
                    <Lock className="w-5 h-5 text-red-500 mb-1" />
                    <span className="text-[10px] font-bold text-red-400">Microtransactions Blocked</span>
                    <p className="text-[8.5px] text-slate-500 mt-0.5">COPPA compliance disables real-money gem packages.</p>
                  </div>
                  <div className="opacity-25 space-y-1 text-xs">
                    <div>💎 Gem pack — $4.99</div>
                    <div>💎 Vault of Gems — $19.99</div>
                  </div>
                </div>

                {/* System logs or text chat simulation */}
                <div className="flex-1 bg-slate-950/40 border border-slate-800 rounded-xl p-2.5 flex flex-col">
                  <div className="text-[9px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-800 mb-1.5">Safe Predefined Chat Only</div>
                  <div className="flex-1 space-y-1 text-[10px] overflow-y-auto max-h-[80px]">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className="break-words text-slate-300 font-medium">{m}</div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <button 
                      onClick={() => handleSendCanned("Good game! 🎮")}
                      className="p-1 text-[9px] bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center cursor-pointer"
                    >
                      Good game! 🎮
                    </button>
                    <button 
                      onClick={() => handleSendCanned("Nice match!")}
                      className="p-1 text-[9px] bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center cursor-pointer"
                    >
                      Nice match!
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-[9px]">
                  <span className="text-slate-400">Ad Personalization (IDFA)</span>
                  <span className="font-mono text-red-400 font-bold">STRICTLY DISABLED</span>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer"
                >
                  Return to Gate
                </button>
              </motion.div>
            )}

            {/* 3. CHILD APPROVED OVERRIDE */}
            {appState === 'child_approved' && (
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
                  <span className="text-[9px] font-mono text-blue-400 font-bold bg-blue-950/80 px-1.5 rounded">Significant Change OK</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Authorized Safe Features:</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-200">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Co-op Raid Battles: <strong className="text-emerald-400">UNLOCKED</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Secure Cloud Game Sync: <strong className="text-emerald-400">ACTIVE</strong></span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/70 border border-slate-850 rounded-xl relative overflow-hidden flex items-center justify-between">
                  <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-center z-10">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Real-Money Shop Gated
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">💎 Crystal Box</span>
                  <span className="text-[10px] font-bold font-mono text-slate-500">$9.99</span>
                </div>

                <div className="flex-1 bg-slate-950/30 border border-slate-850 rounded-xl p-2.5">
                  <span className="text-[9px] font-mono text-slate-500">Live Server Status:</span>
                  <p className="text-[9.5px] text-slate-400 mt-1 italic leading-normal">
                    "Verifying Parental JWS token... Payload signature is compliant."
                  </p>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer"
                >
                  Return to Gate
                </button>
              </motion.div>
            )}

            {/* 4. TEEN RESTRICTED MODE (13-17) */}
            {appState === 'teen_restricted' && (
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

                {/* Mandated disclosures before purchase */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">💎 Premium Gacha Pack</span>
                    <span className="text-xs font-bold font-mono text-slate-300">$9.99</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-850 space-y-1">
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">Mandatory PEGI Drop Disclosures:</div>
                    <div className="grid grid-cols-3 gap-1 text-[8.5px] text-slate-300 font-mono">
                      <div className="bg-slate-950 p-0.5 text-center">Legend: <strong className="text-purple-400">5%</strong></div>
                      <div className="bg-slate-950 p-0.5 text-center">Epic: <strong className="text-blue-400">25%</strong></div>
                      <div className="bg-slate-950 p-0.5 text-center">Common: <strong className="text-slate-400">70%</strong></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert("Simulating transaction request. If 'Ask-to-Buy' is active, a parent approval notification is fired.")}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Purchase Pack
                  </button>
                </div>

                {/* Filtered multiplayer feed */}
                <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 flex flex-col">
                  <div className="text-[9px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-800 mb-1.5">Safe Filtered Multiplayer Chat</div>
                  <div className="flex-1 space-y-1 text-[10px] overflow-y-auto max-h-[70px]">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className="break-words text-slate-300 font-medium">{m}</div>
                    ))}
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder="Type standard filtered chat..."
                      className="flex-1 text-[10px] px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none"
                    />
                    <button 
                      onClick={handleSendText}
                      className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer"
                >
                  Return to Gate
                </button>
              </motion.div>
            )}

            {/* 5. ADULT FULL UNLOCKED */}
            {appState === 'adult_unlocked' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col space-y-3"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" />
                    Adult Unrestricted Play
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 rounded">18+ Verified</span>
                </div>

                {/* Premium Unlimited Store */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold flex items-center gap-1 text-slate-100">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      💎 Vault of 10,000 Crystals
                    </span>
                    <span className="font-bold font-mono text-emerald-400">$49.99</span>
                  </div>
                  <button 
                    onClick={() => alert("Simulating instant checkout. No parental approvals needed!")}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-[10px] text-white rounded-lg cursor-pointer"
                  >
                    Buy Crystals Instantly
                  </button>
                </div>

                {/* Free Text Chat */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col min-h-[110px]">
                  <div className="text-[9px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-800 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-emerald-400" /> Unrestricted Global Chat
                  </div>
                  <div className="flex-1 space-y-1 text-[10px] overflow-y-auto max-h-[70px]">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className="break-words font-medium text-slate-200">{m}</div>
                    ))}
                  </div>
                  <div className="mt-1.5 flex gap-1 pt-1 border-t border-slate-850">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder="Type custom message..."
                      className="flex-1 text-[10px] px-2 py-1 bg-slate-900 border border-slate-850 rounded text-slate-100 focus:outline-none"
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
                  <span>Ad Customization & Profiling</span>
                  <span className="font-mono text-emerald-400 font-semibold">ACTIVE (IDFA OK)</span>
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="w-full py-1 text-[10px] text-slate-500 hover:text-slate-400 transition-all cursor-pointer text-center"
                >
                  Re-Lock Game
                </button>
              </motion.div>
            )}

            {/* 6. DECLINED BY GUARDIAN */}
            {appState === 'declined' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-6"
              >
                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-3 border border-red-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">Consent Declined</h4>
                <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                  Your parent or guardian declined the requested gaming permissions. Advanced social systems are locked.
                </p>

                <button
                  onClick={() => setAppState('locked')}
                  className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl shadow-sm border border-slate-700 cursor-pointer"
                >
                  Return to Gate
                </button>
              </motion.div>
            )}

            {/* 7. CONSENT REVOKED */}
            {appState === 'consent_revoked' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-6"
              >
                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-3 border border-red-500/20 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-red-400">Consent Revoked</h4>
                <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                  StoreKit 2 reported that previous licensing and parental authorizations have been explicitly revoked.
                </p>

                <div className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-left text-[9px] text-slate-500 mt-4 leading-normal">
                  COPPA/GDPR compliance triggers immediate lock down of all cooperative servers.
                </div>

                <button
                  onClick={() => setAppState('locked')}
                  className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl shadow-sm border border-slate-700 cursor-pointer"
                >
                  Return to Gate
                </button>
              </motion.div>
            )}

            {/* 8. MANUAL DOB FALLBACK */}
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
                    Native Apple StoreKit Age Assurance status is notAvailable. Enter Date of Birth below:
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
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Verify Locally
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

          {/* SIMULATED SYSTEM SHEET: Apple StoreKit 2 Age Assurance Drawer */}
          <AnimatePresence>
            {isSheetOpen && (
              <div className="absolute inset-0 bg-black/60 z-40 flex flex-col justify-end">
                {/* Backdrop Click Dismiss */}
                <div className="flex-1" onClick={() => setIsSheetOpen(false)}></div>

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="bg-slate-900 text-white rounded-t-[32px] p-5 pb-8 relative shadow-2xl border-t border-slate-800 flex flex-col items-center"
                >
                  {/* Pull Indicator */}
                  <div className="w-10 h-1 bg-slate-700 rounded-full mb-4"></div>

                  <div className="w-full flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold"></div>
                      <span className="text-xs font-semibold text-slate-400">StoreKit Sandbox Age Sheet</span>
                    </div>
                    <button 
                      onClick={() => setIsSheetOpen(false)}
                      className="text-slate-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  {isScanning ? (
                    <div className="py-12 flex flex-col items-center text-center">
                      <motion.div 
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/30"
                      >
                        <Fingerprint className="w-8 h-8 animate-pulse" />
                      </motion.div>
                      <span className="text-sm font-semibold text-white mt-4 tracking-tight font-sans">Evaluating Sandbox Parameters...</span>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">Verifying Signed JWS Token payload</span>
                    </div>
                  ) : (
                    <div className="w-full">
                      <h3 className="text-sm font-bold text-center text-white tracking-tight leading-snug">
                        Verify Sandbox Age Account
                      </h3>
                      <p className="text-[11px] text-slate-400 text-center mt-1 px-4 leading-normal">
                        Apple will securely verify your sandbox player age classification to satisfy children safety audits.
                      </p>

                      {/* Explicit Sandbox parameters listed inside the simulated sheet */}
                      <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                        <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">Pending Apple Overrides:</div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                          <div>• Target: <span className="text-blue-400">{activeScenario.name}</span></div>
                          <div>• Min/Max Age: <span className="text-blue-400">{activeScenario.minAge}/{activeScenario.maxAge}</span></div>
                          <div>• Sig. Change: <span className="text-blue-400">{activeScenario.significantChange}</span></div>
                          <div>• Decision: <span className="text-amber-400">{activeScenario.decision}</span></div>
                        </div>
                      </div>

                      {/* Simulation Button */}
                      <div className="mt-5 space-y-2">
                        <button
                          onClick={handleSimulateSandboxResponse}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Simulate Apple Sandbox Response
                        </button>

                        <button
                          onClick={() => setIsSheetOpen(false)}
                          className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
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
