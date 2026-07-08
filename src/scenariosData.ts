import { TestScenario } from './types';

export const DEFAULT_SCENARIOS: TestScenario[] = [
  // 1. Under 13, significant change approved
  {
    id: 'under13_approved',
    name: 'Under 13, significant change approved',
    code: 'under13_approved',
    description: 'Simulates a player under 13 with parental consent verified via App Store Connect Sandbox.',
    minAge: '—',
    maxAge: '12',
    verificationType: 'guardianDeclared',
    significantChange: 'True',
    decision: 'approve',
    consentRevoked: false,
    sandboxSetup: 'In App Store Connect > Sandbox Testers:\n1. Select under-13 child tester.\n2. In Age Assurance Overrides, select "Guardian Declared" with "Significant Change" flag enabled.\n3. Configure Sandbox approval decision to "Approve / Allow".',
    expectedBehavior: [
      'StoreKit 2 status returns .verified / .approved.',
      'Game unlocks parental approved features (cloud saves & co-op mode).',
      'Direct real-money microtransactions remain restricted/gated to comply with COPPA.'
    ],
    swiftSnippet: `import StoreKit

// Handling verified parent-approved significant changes
async function evaluateCompliance() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .kidsParentalConsent)
        if case .verified(let payload) = result, payload.significantChangeApproved {
            print("👤 Parent Verified (guardianDeclared). Unlocking limited Co-op & Cloud Saves.")
            await unlockCoopAndCloudSaves()
        } else {
            print("🚨 Restricting account to Strict Child Mode.")
            await lockToOfflineMode()
        }
    } catch {
        print("❌ Age evaluation failed: \\(error)")
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 2. 13 - 15, significant change approved
  {
    id: 'teen13_15_approved',
    name: '13 - 15, significant change approved',
    code: 'teen13_15_approved',
    description: 'Simulates a young teen (13-15) where a significant compliance or consent change has been approved.',
    minAge: '13',
    maxAge: '15',
    verificationType: 'guardianDeclared',
    significantChange: 'True',
    decision: 'approve',
    consentRevoked: false,
    sandboxSetup: 'In App Store Connect > Sandbox Testers:\n1. Choose a teenager tester (age 14).\n2. Set Age Assurance to "Guardian Declared".\n3. Enable "Significant Change" and set the Sandbox response to "Approve".',
    expectedBehavior: [
      'StoreKit returns positive verified payload with Teen category.',
      'Game renders mandatory Loot Box drop rates disclosure before transaction.',
      'Enables standard multiplayer chat rooms with safe filters active.'
    ],
    swiftSnippet: `import StoreKit

async function checkTeenAssurance() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .teenConsent)
        if case .verified(let payload) = result {
            print("✅ Teen 13-15 Verified. Ensuring loot box drop rates are visible.")
            self.mustShowLootBoxPercentages = true
            await enableFilteredChat()
        }
    } catch {
        await lockToOfflineMode()
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 3. 16 - 17, significant change declined
  {
    id: 'teen16_17_declined',
    name: '16 - 17, significant change declined',
    code: 'teen16_17_declined',
    description: 'Simulates an older teen (16-17) where the parent or guardian declined the requested consent.',
    minAge: '16',
    maxAge: '17',
    verificationType: 'guardianDeclared',
    significantChange: 'True',
    decision: 'decline',
    consentRevoked: false,
    sandboxSetup: 'In App Store Connect > Sandbox Testers:\n1. Select a teenager tester (age 16).\n2. Set Verification Type to "Guardian Declared" with "Significant Change" requested.\n3. Configure Sandbox response to "Decline / Deny".',
    expectedBehavior: [
      'StoreKit returns .denied / .restricted or a declined decision payload.',
      'Multiplayer network features are locked down.',
      'Personalized tracking (IDFA) remains disabled.'
    ],
    swiftSnippet: `import StoreKit

async function evaluateOlderTeen() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .teenConsent)
        switch result {
        case .restricted, .underage:
            print("🚨 Guardian declined consent. Restricting multiplayer access.")
            await restrictSocialFeatures()
        default:
            break
        }
    } catch {
        print("❌ Verification error: \\(error)")
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 4. 18+, age not confirmed, significant change not applicable
  {
    id: 'adult_unconfirmed',
    name: '18+, age not confirmed, significant change not applicable',
    code: 'adult_unconfirmed',
    description: 'Simulates a self-declared adult whose verification is not fully confirmed. StoreKit returns notAvailable error.',
    minAge: '18',
    maxAge: '—',
    verificationType: 'selfDeclared',
    significantChange: 'False',
    decision: 'AskError.notAvailable',
    consentRevoked: false,
    sandboxSetup: 'In App Store Connect > Sandbox Testers:\n1. Choose an adult account with age set to 18+.\n2. Set Age Assurance status to "Self Declared" with unconfirmed state.\n3. Sandbox throws AskError.notAvailable to simulate fallback.',
    expectedBehavior: [
      'StoreKit throws AskError.notAvailable or returns .unconfirmed.',
      'Game presents graceful manual Date of Birth fallback dialog.',
      'Locks adult store options until manual input is successfully processed.'
    ],
    swiftSnippet: `import StoreKit

async function evaluateAdultUnconfirmed() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .eighteenPlus)
        // If unconfirmed or throws notAvailable
    } catch AskError.notAvailable {
        print("⚠️ StoreKit Age Assurance is not available. Presenting manual DOB picker.")
        await showManualDatePicker()
    } catch {
        await showManualDatePicker()
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 5. 18+, age confirmed, significant change not applicable
  {
    id: 'adult_confirmed_na',
    name: '18+, age confirmed, significant change not applicable',
    code: 'adult_confirmed_na',
    description: 'Simulates a verified adult (18+) with standard confirmation. Significant changes do not apply to adults.',
    minAge: '18',
    maxAge: '—',
    verificationType: 'confirmed',
    significantChange: 'False',
    decision: 'AskError.notAvailable',
    consentRevoked: false,
    sandboxSetup: 'In App Store Connect > Sandbox Testers:\n1. Choose adult tester.\n2. Set verification response to "Confirmed / 18+".\n3. Significant change remains False.',
    expectedBehavior: [
      'StoreKit returns .verified for eighteenPlus query.',
      'Game unlocks unrestricted global multiplayer chat.',
      'Enables full real-money storefront and allows IDFA tracking options.'
    ],
    swiftSnippet: `import StoreKit

async function handleConfirmedAdult() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .eighteenPlus)
        if result == .verified {
            print("🔓 Adult confirmed. Unlocking unrestricted global chat & full shop.")
            await unlockAdultGaming()
        }
    } catch {
        print("❌ Error: \\(error)")
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 6. 18+, age confirmed, significant change applicable
  {
    id: 'adult_confirmed_applicable',
    name: '18+, age confirmed, significant change applicable',
    code: 'adult_confirmed_applicable',
    description: 'Simulates a verified adult under an active regulatory change policy where significant change verification is applicable and approved.',
    minAge: '18',
    maxAge: '—',
    verificationType: 'confirmed',
    significantChange: 'True',
    decision: 'approve',
    consentRevoked: false,
    sandboxSetup: 'In App Store Connect > Sandbox Testers:\n1. Choose adult tester.\n2. Select "Confirmed" with "Significant Change" flag active.\n3. Configure response to "Approve".',
    expectedBehavior: [
      'StoreKit returns .verified with significant change payload approved.',
      'Game logs the successful legal payload and opens unrestricted adult features.'
    ],
    swiftSnippet: `import StoreKit

async function handleAdultSignificantChange() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .eighteenPlus)
        if case .verified(let payload) = result, payload.significantChangeApproved {
            print("✅ Unrestricted play approved under significant compliance policy.")
            await unlockAdultGaming()
        }
    } catch {
        print("❌ Error: \\(error)")
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 7. Under 13, significant change approved (Consent Revoked)
  {
    id: 'under13_approved_revoked',
    name: 'Under 13, significant change approved (Consent Revoked)',
    code: 'under13_approved_revoked',
    description: 'Simulates a player under 13 whose previously approved parental consent has been revoked.',
    minAge: '—',
    maxAge: '12',
    verificationType: 'guardianDeclared',
    significantChange: 'True',
    decision: 'approve',
    consentRevoked: true,
    sandboxSetup: '1. In iCloud / App Store settings, the parent revokes previously granted permissions.\n2. On next query, StoreKit returns a revoked status or throws a consentRevoked error.',
    expectedBehavior: [
      'StoreKit API returns .notCompleted or a revoked consent payload.',
      'Game immediately locks previously unlocked co-op levels & cloud storage.',
      'Restores strict offline COPPA sandbox mode.'
    ],
    swiftSnippet: `import StoreKit

// Handling revocation of child parental consent
async function monitorConsentStatus() {
    for await update in AppStore.ageAssuranceUpdates {
        if update.isConsentRevoked {
            print("🚨 Parental consent revoked! Lock co-op and cloud data immediately.")
            await lockToOfflineMode()
        }
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 8. 13 - 15, significant change approved (Consent Revoked)
  {
    id: 'teen13_15_approved_revoked',
    name: '13 - 15, significant change approved (Consent Revoked)',
    code: 'teen13_15_approved_revoked',
    description: 'Simulates a young teen whose previously verified significant change consent has been revoked.',
    minAge: '13',
    maxAge: '15',
    verificationType: 'guardianDeclared',
    significantChange: 'True',
    decision: 'approve',
    consentRevoked: true,
    sandboxSetup: '1. Select active teen sandbox account.\n2. Simulate parental revocation of app permissions in iCloud Family Sharing panel.',
    expectedBehavior: [
      'StoreKit returns revoked error payload.',
      'Locks global chat room access.',
      'Disables any active transactional capabilities.'
    ],
    swiftSnippet: `import StoreKit

async function checkTeenRevocation() {
    do {
        let result = try await AppStore.showAgeAssurance(for: .teenConsent)
        if result == .notCompleted || result == .restricted {
            print("⚠️ Consent revoked or restricted. Restoring strict privacy walls.")
            await disableFilteredChat()
        }
    } catch {
        await disableFilteredChat()
    }
}`,
    status: 'Not Started',
    notes: ''
  },

  // 9. 16 - 17, significant change declined (Consent Revoked)
  {
    id: 'teen16_17_declined_revoked',
    name: '16 - 17, significant change declined (Consent Revoked)',
    code: 'teen16_17_declined_revoked',
    description: 'Simulates a revoked consent scenario for a declined teen request.',
    minAge: '16',
    maxAge: '17',
    verificationType: 'guardianDeclared',
    significantChange: 'True',
    decision: 'decline',
    consentRevoked: true,
    sandboxSetup: '1. Select 16-17 teen account.\n2. Trigger a revoked state to audit offline compliance flow.',
    expectedBehavior: [
      'Game ensures all multiplayer, social, and tracking capabilities are strictly deactivated.'
    ],
    swiftSnippet: `// Standard compliance check ensuring absolute deactivation upon revocation
await disableAllSocialFeatures()`,
    status: 'Not Started',
    notes: ''
  },

  // 10. 18+, age not confirmed, significant change not applicable (Consent Revoked)
  {
    id: 'adult_unconfirmed_revoked',
    name: '18+, age not confirmed, significant change not applicable (Consent Revoked)',
    code: 'adult_unconfirmed_revoked',
    description: 'Simulates a self-declared adult with revoked application consent.',
    minAge: '18',
    maxAge: '—',
    verificationType: 'selfDeclared',
    significantChange: 'False',
    decision: 'AskError.notAvailable',
    consentRevoked: true,
    sandboxSetup: '1. Choose self-declared adult account.\n2. Trigger in-app revoke simulation or privacy toggle.',
    expectedBehavior: [
      'Standard safe offline default configuration is enforced.'
    ],
    swiftSnippet: `await activateSafeDefaultState()`,
    status: 'Not Started',
    notes: ''
  },

  // 11. 18+, age confirmed, significant change not applicable (Consent Revoked)
  {
    id: 'adult_confirmed_na_revoked',
    name: '18+, age confirmed, significant change not applicable (Consent Revoked)',
    code: 'adult_confirmed_na_revoked',
    description: 'Simulates a verified adult whose general application consent or personalization permission is revoked.',
    minAge: '18',
    maxAge: '—',
    verificationType: 'confirmed',
    significantChange: 'False',
    decision: 'AskError.notAvailable',
    consentRevoked: true,
    sandboxSetup: '1. Verified adult account.\n2. Revoke App Store personalization or general licensing consent.',
    expectedBehavior: [
      'Restricts advertising options (forces non-personalized ads).',
      'Limits global sync but maintains basic adult chat access.'
    ],
    swiftSnippet: `import StoreKit

async function handleAdultConsentRevocation() {
    print("⚠️ Adult consent revoked. Restricting personalization tracking (IDFA).")
    self.canEnablePersonalizedAds = false
    await disableTrackingAdProfiles()
}`,
    status: 'Not Started',
    notes: ''
  },

  // 12. 18+, age confirmed, significant change applicable (Consent Revoked)
  {
    id: 'adult_confirmed_applicable_revoked',
    name: '18+, age confirmed, significant change applicable (Consent Revoked)',
    code: 'adult_confirmed_applicable_revoked',
    description: 'Simulates a confirmed adult with regulatory significant change policy where permission was approved but subsequently revoked.',
    minAge: '18',
    maxAge: '—',
    verificationType: 'confirmed',
    significantChange: 'True',
    decision: 'approve',
    consentRevoked: true,
    sandboxSetup: '1. Verified adult account under significant change policy.\n2. Parent or user revokes consent under legal options panel.',
    expectedBehavior: [
      'Game immediately deactivates targeted personalization and restricts access until re-approval.'
    ],
    swiftSnippet: `print("🚨 Adult policy consent revoked. Locking sensitive tracking.")
await disableTrackingAdProfiles()`,
    status: 'Not Started',
    notes: ''
  }
];
