import React from 'react';
import { 
  FileCheck, Shield, Clipboard, CheckCircle2, XCircle, AlertCircle, 
  Download, Printer, FileSpreadsheet, Calendar, User, Settings2
} from 'lucide-react';
import { TestScenario, AutomationConfig } from '../types';

interface ReportExportProps {
  scenarios: TestScenario[];
  config: AutomationConfig;
  onChangeConfig: (config: AutomationConfig) => void;
}

export default function ReportExport({ scenarios, config, onChangeConfig }: ReportExportProps) {
  
  // Calculate statistics
  const total = scenarios.length;
  const passed = scenarios.filter(s => s.status === 'Pass').length;
  const failed = scenarios.filter(s => s.status === 'Fail').length;
  const pending = scenarios.filter(s => s.status === 'Not Started' || s.status === 'In Progress').length;
  const withVideo = scenarios.filter(s => s.videoUrl).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    // Generate JSON report configuration
    const reportData = {
      reportType: "StoreKit Age Assurance Compliance Report",
      generatedAt: new Date().toISOString(),
      tester: config.testerName,
      appVersion: config.appVersion,
      bundleId: config.bundleId,
      device: config.deviceName,
      summary: {
        totalScenarios: total,
        passed,
        failed,
        pending,
        videoCount: withVideo
      },
      scenarios: scenarios.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        notes: s.notes || 'None provided.',
        hasVideoProof: !!s.videoUrl,
        videoFileName: s.videoName || 'No video linked.'
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `StoreKit_AgeAssurance_ComplianceReport_${config.appVersion}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col space-y-6">
      
      {/* QA Configuration Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-blue-500" />
            Tester Name
          </label>
          <input
            type="text"
            value={config.testerName}
            onChange={(e) => onChangeConfig({ ...config, testerName: e.target.value })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5 text-blue-500" />
            App Version
          </label>
          <input
            type="text"
            value={config.appVersion}
            onChange={(e) => onChangeConfig({ ...config, appVersion: e.target.value })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="v1.2.0-QA"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            App Bundle ID
          </label>
          <input
            type="text"
            value={config.bundleId}
            onChange={(e) => onChangeConfig({ ...config, bundleId: e.target.value })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="com.company.safepass"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Test Target Device
          </label>
          <input
            type="text"
            value={config.deviceName}
            onChange={(e) => onChangeConfig({ ...config, deviceName: e.target.value })}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="iPhone 15 Simulator (iOS 18)"
          />
        </div>
      </div>

      {/* Main Statistics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
          <div className="text-xl font-bold text-gray-800 font-mono">{total}</div>
          <div className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Total Cases</div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/60 text-center">
          <div className="text-xl font-bold text-emerald-700 font-mono">{passed}</div>
          <div className="text-[10px] text-emerald-600 font-semibold uppercase mt-0.5">Passed</div>
        </div>

        <div className="p-4 bg-red-50 rounded-xl border border-red-100/60 text-center">
          <div className="text-xl font-bold text-red-700 font-mono">{failed}</div>
          <div className="text-[10px] text-red-600 font-semibold uppercase mt-0.5">Failed</div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/60 text-center">
          <div className="text-xl font-bold text-amber-700 font-mono">{pending}</div>
          <div className="text-[10px] text-amber-600 font-semibold uppercase mt-0.5">Incomplete</div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 bg-blue-50/60 rounded-xl border border-blue-100/60 text-center">
          <div className="text-xl font-bold text-blue-700 font-mono">{withVideo} / {total}</div>
          <div className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">Video Proofs</div>
        </div>
      </div>

      {/* Compliance Overview Summary card */}
      <div className="p-5 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5 text-blue-400">
            <Shield className="w-4 h-4 text-blue-400" />
            Compliance Status Summary
          </h4>
          <p className="text-[11px] text-slate-300 max-w-xl leading-relaxed">
            {passed === total 
              ? "🎉 Outstanding! All 5 regulatory Age Assurance testing conditions are verified and passing with fully-documented, custom-named video logs ready for App Store Review compliance." 
              : `⚠️ Compliance status pending. Currently ${passed} of ${total} scenarios have been verified. Ensure all cases are thoroughly simulated and video proof is cataloged.`}
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-100 font-semibold text-xs rounded-lg transition-all border border-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF Report
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON Suite
          </button>
        </div>
      </div>

      {/* Printable Report Preview */}
      <div id="compliance-printable-area" className="border border-slate-200/80 rounded-xl p-5 bg-white/50 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100/60 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xs">QA</div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Apple StoreKit 2 Compliance Sheet</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Verified Sandbox Age Verification Audit Ledger</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500">Date: {new Date().toLocaleDateString()}</span>
            <div className="text-[10px] font-mono font-bold text-blue-600 mt-0.5">STATE: {passed === total ? 'CERTIFIED' : 'PENDING'}</div>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-semibold">
              <th className="py-2.5">Scenario Description</th>
              <th className="py-2.5 text-center">Status</th>
              <th className="py-2.5">Linked Video File Proof</th>
              <th className="py-2.5">Audit Logs / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {scenarios.map((s) => (
              <tr key={s.id} className="text-xs">
                <td className="py-3 font-semibold text-gray-800 max-w-xs leading-normal">
                  {s.name}
                </td>
                <td className="py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === 'Pass' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : s.status === 'Fail' 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.status === 'Pass' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : s.status === 'Fail' ? <XCircle className="w-3 h-3 text-red-500" /> : <AlertCircle className="w-3 h-3 text-gray-400" />}
                    {s.status}
                  </span>
                </td>
                <td className="py-3 font-mono text-[9px] text-gray-500 max-w-[160px] truncate">
                  {s.videoUrl ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      📹 {s.videoName || 'proof_video.webm'}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not recorded</span>
                  )}
                </td>
                <td className="py-3 text-[10px] text-gray-600 max-w-xs leading-normal">
                  {s.notes || <span className="text-gray-400 italic">No notes logged.</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
