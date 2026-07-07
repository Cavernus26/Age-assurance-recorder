import { TestScenario } from './types';

export const DEFAULT_SCENARIOS: TestScenario[] = [
  {
    id: 'under13_strict',
    name: 'Scenario 1: Under 13 - Strict COPPA / GDPR-K restrictions (Default)',
    code: 'under13_strict',
    description: 'Simulates a child player under 13 with no parental override. In accordance with COPPA & GDPR-K regulations, games must strictly block in-app purchases, disable social/multiplayer chat, disable behavioral tracking (IDFA), and present a child-safe UI.',
    sandboxSetup: '1. Create a Sandbox Tester account in App Store Connect with age set to Under 13 (or region equivalent).\n2. In App Store Connect > Sandbox Testers, ensure "Age Assurance Override" is set to "Restricted / Under 13".\n3. On your physical iPhone/iPad connected to the PC, sign in to this sandbox account under Settings > App Store.',
    expectedBehavior: [
      'In-game purchase shop is disabled or completely hidden.',
      'Multiplayer global chat is disabled, or restricted to pre-approved canned words (safe dictionary).',
      'No behavioral analytics, personalized ads, or profiling is active.',
      'A child-friendly home screen is displayed.'
    ],
    swiftSnippet: `import StoreKit

// Check age assurance category for gaming compliance (COPPA/GDPR-K)
async function evaluateGameSafety() {
    do {
        // Query native age classification via StoreKit 2 Age Assurance API
        let status = try await AppStore.showAgeAssurance(for: .eighteenPlus)
        
        switch status {
        case .underage, .restricted:
            print("🚨 Kid User Detected (<13). Activating Strict COPPA Mode.")
            await configureCOPPACompliance()
            
        case .verified:
            print("✅ Adult Verified (18+). Enabling unrestricted multiplayer & store.")
            await unlockFullGameStore()
            
        case .notCompleted:
            print("⚠️ Consent dismissed. Keeping game in Safe Default state.")
            await activateSafeDefaultState()
            
        @unknown default:
            await activateSafeDefaultState()
        }
    } catch {
        print("❌ Error fetching compliance state: \(error.localizedDescription)")
        await activateSafeDefaultState() // Fail secure
    }
}

private func configureCOPPACompliance() async {
    self.isStoreEnabled = false
    self.isGlobalChatEnabled = false
    self.isTrackingAllowed = false
    self.gameUIMode = .childFriendly
    self.displayCannedChatOnly = true
}`,
    status: 'Not Started',
    notes: ''
  },
  {
    id: 'under13_approved',
    name: 'Scenario 2: Under 13 - Significant Change Approved (Parental Consent)',
    code: 'under13_approved',
    description: 'Simulates a user under 13 whose parent or guardian has explicitly verified their identity and approved a "significant change" (e.g. granting parental consent for limited profile saving, cloud saves, or restricted cooperative multiplayer).',
    sandboxSetup: '1. Open App Store Connect > Users and Access > Sandbox Testers.\n2. Select your Under 13 tester account.\n3. Scroll down to the "Age Assurance & Consents Override" options and set it to "Approved / Significant Change Approved".\n4. Trigger the check on your connected iOS device.',
    expectedBehavior: [
      'The game detects the authorized "Significant Change" payload from StoreKit.',
      'Limited multiplayer cooperative gameplay is enabled.',
      'Parental consent is verified, allowing cloud profile sync.',
      'In-game shop remains locked (or gated behind direct Ask-to-Buy parental overrides).'
    ],
    swiftSnippet: `import StoreKit

// Handling verified parental override/significant change for under-13s
async function handleChildConsentChange() {
    do {
        // Query specific parental consent indicators or age assurance outcomes
        let verificationResult = try await AppStore.showAgeAssurance(for: .kidsParentalConsent)
        
        if verificationResult == .verified {
            print("👤 Parent Verified: Unlocking Cloud Saves & Co-op Mode for Child.")
            await unlockCloudSavesForChild()
            await enableCoopMultiplayer()
        } else {
            print("❌ Parental consent not verified or withdrawn.")
            await lockChildAccountToOfflineLocalMode()
        }
    } catch {
        print("❌ Error verifying parent override: \(error.localizedDescription)")
    }
}`,
    status: 'Not Started',
    notes: ''
  },
  {
    id: 'teen_ask_to_buy',
    name: 'Scenario 3: Teen (13-17) - Ask to Buy & Loot Box Probability Disclosure',
    code: 'teen_ask_to_buy',
    description: 'Simulates a teen player (e.g., age 14) who triggers an in-app transaction. For compliance (PEGI/ESRB), the game MUST show prominent randomized item disclosures (loot box percentage drop rates) prior to billing, and simulate Apple’s "Ask to Buy" parental review.',
    sandboxSetup: '1. Configure a Sandbox Tester with age 14 and toggle "Ask to Buy" status to Active in App Store Connect.\n2. Trigger a virtual item or gacha purchase in your game on your physical device.\n3. Verify the native transaction suspends with "Ask to Buy" pending, then simulate parent approval.',
    expectedBehavior: [
      'Prior to purchase, game renders explicit, non-obscured Loot Box drop rates (e.g., Common 80%, Epic 5%).',
      'The purchase triggers a StoreKit 2 transaction which returns a .pending status.',
      'The UI shows a non-blocking "Ask Sent to Parent" loader, allowing the player to continue playing in-game.',
      'When the parent approves in Sandbox, the game handles transaction listener update and delivers the item.'
    ],
    swiftSnippet: `import StoreKit

// Trigger a StoreKit 2 transaction with Ask-to-Buy safety and PEGI loot disclosures
async function purchaseLootBox() {
    // 1. Mandatory compliance disclosure
    self.showLootBoxProbabilityOverlay = true
    
    do {
        let product = try await Product.products(for: ["com.gamestudio.gempack"]).first!
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await deliverItems(transaction)
            await transaction.finish()
            
        case .pending:
            // This is triggered for minors with "Ask to Buy" active
            print("👶 Ask to Buy pending. Presenting compliant parent notification.")
            await presentAskToBuyNotification()
            
        case .userCancelled:
            print("❌ User cancelled the purchase.")
            
        @unknown default:
            break
        }
    } catch {
        print("❌ Transaction failed: \(error.localizedDescription)")
    }
}`,
    status: 'Not Started',
    notes: ''
  },
  {
    id: 'adult_unrestricted',
    name: 'Scenario 4: Age Verified 18+ (Fully Approved & Unrestricted Games)',
    code: 'adult_unrestricted',
    description: 'Simulates an adult player (18+). The native StoreKit verification returns Approved. Unlocks full in-game shops, real-money microtransactions, unrestricted open global multiplayer chat, custom profile uploads, and personalized advertising.',
    sandboxSetup: '1. In App Store Connect > Sandbox Testers, set the Age Assurance response to "Verified / 18+".\n2. Alternatively, in Xcode open your .storekit file, go to Editor > Sandbox Options > Age Assurance and select "Approved (18+)".\n3. Tap verification in your game.',
    expectedBehavior: [
      'Verification completes with fully signed verified status.',
      'Full, unrestricted game storefront / coin store is unlocked.',
      'Uncensored global chat rooms are fully accessible.',
      'IDFA tracking permissions request is allowed (personalized analytics enabled).'
    ],
    swiftSnippet: `import StoreKit

// Fully verified adult unlock
async function handleAdultVerified() {
    print("🔓 Adult 18+ Verified. Unlocking full game marketplace.")
    self.isAdultStoreUnlocked = true
    self.isUnrestrictedChatActive = true
    self.canEnablePersonalizedAds = true
    
    // Request tracking permission safely
    await requestIDFALegalTrackingPermission()
}`,
    status: 'Not Started',
    notes: ''
  },
  {
    id: 'consent_cancelled',
    name: 'Scenario 5: Consent Cancelled / Denied (Graceful Fallback Mode)',
    code: 'consent_cancelled',
    description: 'Simulates the user or parent cancelling the verification sheet (dismissing it or pressing Cancel). The game must NOT crash or lock up; it must gracefully return the player to the standard offline/safe gameplay area.',
    sandboxSetup: '1. Configure your Sandbox Tester response or Xcode Sandbox options to "Not Completed / Dismissed".\n2. Trigger the verification, and press "Cancel" or swipe down the sheet on your physical iOS device.',
    expectedBehavior: [
      'StoreKit API returns .notCompleted or user-cancelled exception.',
      'The game closes the loader and returns to the standard lobby.',
      'Gated features remain securely locked.',
      'The user is allowed to retry verification later (the verify button remains interactive).'
    ],
    swiftSnippet: `// Standard safety fallback for dismissed sheets
switch result {
case .notCompleted:
    print("⚠️ User dismissed the verification. Keeping gates active.")
    self.showingVerificationModal = false
    self.statusHUDMessage = "Age confirmation is required for adult features. You can try again anytime."
    self.isPremiumContentGated = true
default:
    break
}`,
    status: 'Not Started',
    notes: ''
  }
];
