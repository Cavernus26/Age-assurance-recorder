export interface TestScenario {
  id: string;
  name: string;
  code: string;
  description: string;
  sandboxSetup: string;
  expectedBehavior: string[];
  swiftSnippet: string;
  status: 'Not Started' | 'In Progress' | 'Pass' | 'Fail';
  notes: string;
  videoUrl?: string;
  videoName?: string;
  videoBlob?: Blob;
  lastTested?: string;
  minAge?: string;
  maxAge?: string;
  verificationType?: string;
  significantChange?: string;
  decision?: string;
  consentRevoked?: boolean;
}

export interface AutomationConfig {
  bundleId: string;
  deepLink: string;
  deviceName: string;
  triggerButtonId: string;
  approveButtonId: string;
  denyButtonId: string;
  testerName: string;
  appVersion: string;
}
