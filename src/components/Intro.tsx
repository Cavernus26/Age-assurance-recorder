import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Apple, 
  ExternalLink, 
  Info, 
  FileText, 
  Smartphone, 
  Laptop, 
  Video, 
  Gamepad2, 
  HelpCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Intro() {
  const [activeTab, setActiveTab] = useState<'device' | 'regulations'>('device');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/60 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">StoreKit 2 Age Assurance Companion for Games</h2>
            <p className="text-xs text-slate-500">Physical iOS device connection and mobile game regulatory testing workbook</p>
          </div>
        </div>

        {/* Tabs within the Intro guide */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('device')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'device' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Connect & Record Device
          </button>
          <button
            onClick={() => setActiveTab('regulations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'regulations' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Game Safety Regulations
          </button>
        </div>
      </div>

      {activeTab === 'device' && (
        <div className="space-y-5">
          {/* Quick Explainer Banner */}
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/30 flex items-start gap-3">
            <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              To test real age assurance sheets, you must run the build on a <strong>physical iPhone or iPad</strong> connected to your PC. Below is the industry-standard workflow used by game QA teams to mirror and record device screen behavior directly on a PC browser.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* macOS Mirroring Guide */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4">
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-800" />
                <span className="text-xs font-bold text-slate-800">macOS: QuickTime USB Mirroring (Zero Latency)</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">1</span>
                  <span>Connect your iPhone or iPad to your Mac using a lightning or USB-C cable.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">2</span>
                  <span>Open the native <strong>QuickTime Player</strong> app on your Mac.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">3</span>
                  <span>Go to <strong>File &gt; New Movie Recording</strong> from the top menu bar.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">4</span>
                  <span>Click the small arrow next to the red Record button and select your <strong>iPhone / iPad</strong> as the Camera source. Your physical device screen is now mirrored on your Mac.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">5</span>
                  <span>In our <strong>Sandbox Video Capture Hub</strong> (second tab above), click <strong>Initialize Recorder</strong> and select either your whole screen or just the <strong>QuickTime Player Window</strong> to record the real iOS gameplay!</span>
                </li>
              </ul>
            </div>

            {/* Windows Mirroring Guide */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-800" />
                <span className="text-xs font-bold text-slate-800">Windows: Mirroring Software & AirPlay</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">1</span>
                  <span>Install an iOS receiver tool like <strong>Reflector 4</strong>, <strong>LonelyScreen</strong>, <strong>ApowerMirror</strong>, or use Apple's developer tools.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">2</span>
                  <span>Connect your iOS device and Windows PC to the same Wi-Fi network (or connect via USB if the tool supports it).</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">3</span>
                  <span>Swipe down on your iPad or iPhone to open Control Center, tap <strong>Screen Mirroring</strong>, and select your PC name.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">4</span>
                  <span>The device is now displayed as a window on your PC.</span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">5</span>
                  <span>In our <strong>Sandbox Video Capture Hub</strong>, click <strong>Initialize Recorder</strong> and select that specific mirrored app window. Record, stop, and download automatically named compliance video proof!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Setup tips */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/40 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Sandbox Login Trick</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              On your iOS test device, do NOT sign out of your main iCloud account. Instead, go to <strong>Settings &gt; App Store</strong>, scroll down to the bottom, and sign in exclusively under the <strong>Sandbox Account</strong> section. This prevents messing up your personal iCloud while letting you test game compliance scenarios.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'regulations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* COPPA Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">COPPA & GDPR-K Compliance</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Children under 13 must not have their data collected, tracked, or sold. For games, this means you MUST lock down chat logs, hide behavioral advertisements, and disable real-money microtransactions unless explicit parental consent is provided.
              </p>
            </div>

            {/* Significant Change Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Significant Changes</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                When a parent overrides standard child restrictions, StoreKit 2 emits a verified parental override status. Games are permitted to unlock certain cooperative social functions (such as cloud game saves or co-op matchmaking) under strict local regulations.
              </p>
            </div>

            {/* Loot Boxes Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Loot Box Drop Disclosures</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                App Store Review Guideline 3.1.1 mandates that any games offering randomized virtual items for purchase must disclose the odds of receiving those items (drop rate percentages) clearly and legibly before presenting the StoreKit payment sheets.
              </p>
            </div>

          </div>

          <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Info className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800 font-mono">StoreKit 2 Testing App Store Overrides</div>
                <div className="text-[10px] text-blue-600 font-medium">Verify your games support safe, age-gated states before App Store submissions</div>
              </div>
            </div>
            <a 
              href="https://developer.apple.com/documentation/storekit/testing-age-assurance-in-sandbox" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 shrink-0"
            >
              Open Apple Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
