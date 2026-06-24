import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    const candidatePaths = [
      "/Users/kangsungbae/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
      "/Users/kangsungbae/Library/Application Support/com.openai.codex.app/node_modules/playwright",
    ];
    for (const bundledPath of candidatePaths) {
      try {
        return require(bundledPath);
      } catch {
        // Try the next known Codex runtime path.
      }
    }
    throw error;
  }
}

const { chromium } = loadPlaywright();
const baseFileUrl = pathToFileURL(resolve("docs/mvp/index.html")).href;
const privacyFileUrl = pathToFileURL(resolve("docs/mvp/privacy.html")).href;
const pageUrl = `${baseFileUrl}?reset=1`;

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth - documentElement.clientWidth;
  });
  assert(overflow <= 1, `horizontal overflow detected: ${overflow}px`);
}

async function visibleButtonLabels(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((button) => {
        const rect = button.getBoundingClientRect();
        const style = getComputedStyle(button);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      })
      .map((button) => button.innerText.replace(/\s+/g, " ").trim())
      .filter(Boolean),
  );
}

async function assertButtonInInitialViewport(page, testId, message) {
  const result = await page.getByTestId(testId).evaluate((button) => {
    const rect = button.getBoundingClientRect();
    return {
      visible: rect.width > 0 && rect.height > 0,
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
    };
  });
  assert(result.visible && result.top >= 0 && result.bottom <= result.viewportHeight, message);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 740 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(pageUrl, { waitUntil: "load" });

  const cleanEntryText = await page.locator("body").innerText();
  assert(!cleanEntryText.includes("최근 방:"), "clean entry should not expose a fake recent room");
  assert(cleanEntryText.includes("저장된 모임이 아직 없어요"), "clean entry should explain that no room exists yet");
  const cleanEntryStorage = await page.evaluate(() => localStorage.getItem("hammoyo:mvp:v1"));
  assert(cleanEntryStorage === null, "clean entry should not persist a placeholder room");
  assert(await page.getByTestId("language-toggle-button").isVisible(), "entry should expose a language switcher");

  const algorithmChecks = await page.evaluate(() => {
    const api = window.HAMMOYEO_MVP_TESTS;
    if (!api) return null;
    const room = api.createDemoRoom({
      expectedCount: 7,
      candidates: [
        { id: "slot-1", label: "6.29 토요일", time: "18:30", note: "강남역" },
        { id: "slot-2", label: "6.30 일요일", time: "17:00", note: "잠실" },
        { id: "slot-3", label: "7.1 월요일", time: "19:00", note: "홍대" },
      ],
      responses: [
        { alias: "A", preferences: { "slot-1": "prefer", "slot-2": "available", "slot-3": "hardNo" } },
        { alias: "B", preferences: { "slot-1": "available", "slot-2": "prefer", "slot-3": "hardNo" } },
        { alias: "C", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "available" } },
        { alias: "D", preferences: { "slot-1": "available", "slot-2": "adjustable", "slot-3": "available" } },
      ],
    });
    const ranked = api.rankCandidates(room);
    return {
      threshold: api.minimumResponses(7),
      topId: ranked.top?.candidate.id,
      confidence: ranked.confidence,
      excluded: ranked.items.filter((item) => item.excluded).map((item) => item.candidate.id),
      shareCopy: api.buildShareText(room, ranked),
      copyTexts: api.buildCopyTextForAction
        ? {
            invite: api.buildCopyTextForAction(room, "copy-invite", ranked),
            recommendation: api.buildCopyTextForAction(room, "copy-share", ranked),
            confirmed: api.buildCopyTextForAction(
              { ...room, status: "closed", selectedCandidateId: ranked.top?.candidate.id },
              "copy-share",
              ranked,
            ),
          }
        : null,
    };
  });

  assert(algorithmChecks !== null, "window.HAMMOYEO_MVP_TESTS API is missing");
  if (algorithmChecks) {
    assert(algorithmChecks.threshold === 4, "minimum response threshold should be 4 for 7 expected participants");
    assert(algorithmChecks.topId === "slot-1", "ranking should choose slot-1 for the deterministic fixture");
    assert(algorithmChecks.confidence === "high", "fixture should produce high confidence");
    assert(algorithmChecks.excluded.includes("slot-3"), "candidate with two hard-no responses should be excluded");
    assert(
      algorithmChecks.shareCopy.includes("6.29 토요일 18:30"),
      "share copy should include the recommended date and time",
    );
    assert(algorithmChecks.copyTexts !== null, "copy text builder should be exposed for verification");
    assert(
      algorithmChecks.copyTexts?.invite.includes("preview 전용") &&
        !algorithmChecks.copyTexts?.invite.includes("screen=scr-02-participant-input") &&
        !algorithmChecks.copyTexts?.invite.includes("room="),
      "invite copy should not promise a real participant URL before ShareAdapter/backend exist",
    );
    assert(
      algorithmChecks.copyTexts?.recommendation.includes("가장 현실적인 약속안"),
      "recommendation copy should keep recommendation wording",
    );
    assert(
      algorithmChecks.copyTexts?.confirmed.includes("확정됐어요") &&
        !algorithmChecks.copyTexts?.confirmed.includes("가장 현실적인 약속안"),
      "confirmed copy should be distinct from recommendation copy",
    );
  }

  await page.getByTestId("start-create-room").click();
  await page.getByTestId("room-title-input").fill("금요일 저녁 모임");
  await page.getByTestId("expected-count-input").fill("7");
  await page.getByTestId("candidate-label-input-0").fill("6.29 토요일");
  await page.getByTestId("candidate-time-input-0").fill("18:30");
  await page.getByTestId("candidate-note-input-0").fill("강남역 근처");
  await page.getByTestId("candidate-label-input-1").fill("6.30 일요일");
  await page.getByTestId("candidate-time-input-1").fill("17:00");
  await page.getByTestId("candidate-note-input-1").fill("잠실");
  await page.getByTestId("create-room-button").click();

  const createdRoom = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:mvp:v1")));
  assert(createdRoom?.room?.title === "금요일 저녁 모임", "created room should be persisted in localStorage");
  assert(createdRoom?.room?.status === "collecting", "created room should enter collecting status");
  const afterCreateText = await page.locator("body").innerText();
  assert(afterCreateText.includes("응답이 조금 더 필요해요"), "host create CTA should land on invite-copy ready state");
  await page.getByTestId("copy-invite-button").click();
  await page.waitForSelector("[data-testid='copy-status']");
  const inviteCopyStatus = await page.getByTestId("copy-status").innerText();
  assert(inviteCopyStatus.includes("복사했어요"), "insufficient response invite copy should show copy feedback");

  await page.goto(`${baseFileUrl}?screen=scr-02-participant-input`, { waitUntil: "load" });
  await page.getByTestId("participant-name-input").fill("민지");
  await page.getByTestId("preference-slot-1-prefer").click();
  await page.getByTestId("preference-slot-2-available").click();
  await page.getByTestId("preference-slot-3-hardNo").click();
  await page.getByTestId("submit-response-button").click();

  const storedAfterResponse = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:mvp:v1")));
  assert(storedAfterResponse?.room?.responses?.length === 1, "participant response should be saved");

  await page.goto(`${baseFileUrl}?demo=1&screen=scr-02b-response-complete`, { waitUntil: "load" });
  await page.getByTestId("seed-responses-button").click();
  await page.waitForSelector("[data-testid='recommendation-card']");
  const resultText = await page.getByTestId("recommendation-card").innerText();
  assert(resultText.includes("추천 1순위"), "recommendation card should show primary recommendation label");
  assert(resultText.includes("6.29 토요일 18:30"), "recommendation card should show computed top candidate");

  await page.getByTestId("copy-share-button").click();
  await page.waitForSelector("[data-testid='copy-status']");
  const copyStatus = await page.getByTestId("copy-status").innerText();
  assert(copyStatus.includes("복사했어요"), "share copy action should show copied status");

  await page.getByTestId("close-room-button").click();
  await page.waitForSelector("#scr-06-room-closed");
  const closedState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:mvp:demo:v1")));
  assert(closedState?.room?.status === "closed", "close action should persist closed status");

  await page.goto(`${pageUrl}&screen=scr-06-room-closed`, { waitUntil: "load" });
  const stateAfterClosedDirect = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:mvp:v1") || "null"));
  assert(stateAfterClosedDirect?.room?.status !== "closed", "closed screen direct link should not create a closed room outside demo mode");
  await page.getByTestId("topbar-home-button").click();
  await page.waitForSelector("#scr-00-entry");
  assert(await page.getByTestId("privacy-settings-button").isVisible(), "entry should expose privacy/settings path");

  await page.goto(`${pageUrl}&demo=1&screen=scr-03-result-recommendation&ai=on`, { waitUntil: "load" });
  const aiLabelText = await page.locator("body").innerText();
  assert(!aiLabelText.includes("AI로 문장을 다듬었어요"), "template-only MVP must not claim AI-polished copy");
  assert(aiLabelText.includes("공유 문구 복사하기"), "result CTA should match clipboard-copy behavior");
  await assertButtonInInitialViewport(page, "copy-share-button", "result copy CTA should be visible on initial mobile viewport");

  await page.goto(`${pageUrl}&screen=scr-02b-response-complete`, { waitUntil: "load" });
  const responseCompleteText = await page.locator("body").innerText();
  assert(!responseCompleteText.includes("응답을 보냈어요"), "response-complete direct link should not claim success without a submitted response");
  assert(responseCompleteText.includes("저장된 모임이 아직 없어요"), "response-complete direct link should fall back to the entry state");

  await page.goto(`${pageUrl}&screen=scr-05-link-expired`, { waitUntil: "load" });
  const expiredState = await page.evaluate(() => localStorage.getItem("hammoyo:mvp:v1"));
  assert(expiredState === null, "expired preview deep link should not mutate persisted room state");
  assert(await page.getByTestId("topbar-home-button").isVisible(), "expired screen should expose topbar home path");

  await page.goto(`${baseFileUrl}?screen=scr-02-participant-input`, { waitUntil: "load" });
  const participantDirectText = await page.locator("body").innerText();
  assert(participantDirectText.includes("저장된 모임이 아직 없어요"), "participant direct link without a room should not render a fake response form");

  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-05-link-expired`, { waitUntil: "load" });
  await page.goto(`${baseFileUrl}?demo=1&screen=scr-02-participant-input`, { waitUntil: "load" });
  assert(await page.getByTestId("submit-response-button").isDisabled(), "expired demo room should reject participant writes across direct route changes");
  const disabledPreferenceCount = await page.locator(".preferenceOption:disabled").count();
  assert(disabledPreferenceCount >= 12, "expired demo room should disable every preference option");

  const demoIsolationContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  const demoIsolationPage = await demoIsolationContext.newPage();
  demoIsolationPage.setDefaultTimeout(5000);
  await demoIsolationPage.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  await demoIsolationPage.getByTestId("copy-share-button").click();
  await demoIsolationPage.waitForSelector("[data-testid='copy-status']");
  const normalStorageAfterDemo = await demoIsolationPage.evaluate(() => localStorage.getItem("hammoyo:mvp:v1"));
  assert(normalStorageAfterDemo === null, "demo interactions should not write to the normal MVP storage key");
  await demoIsolationPage.goto(`${baseFileUrl}?screen=scr-00-entry`, { waitUntil: "load" });
  const normalHomeAfterDemo = await demoIsolationPage.locator("body").innerText();
  assert(!normalHomeAfterDemo.includes("최근 방:"), "demo interactions should not create a normal recent room");
  assert(normalHomeAfterDemo.includes("저장된 모임이 아직 없어요"), "normal home should stay empty after demo interactions");
  await demoIsolationContext.close();

  const demoResetContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  const demoResetPage = await demoResetContext.newPage();
  demoResetPage.setDefaultTimeout(5000);
  await demoResetPage.goto(`${baseFileUrl}?reset=1&screen=scr-00-entry`, { waitUntil: "load" });
  await demoResetPage.evaluate(() => {
    localStorage.setItem(
      "hammoyo:mvp:v1",
      JSON.stringify({
        version: 1,
        room: {
          id: "normal-room",
          title: "보존되어야 하는 일반 모임",
          expectedCount: 4,
          deadlineLabel: "오늘 22:00",
          candidates: [
            { id: "slot-1", label: "7.1 수요일", time: "19:00", note: "강남" },
            { id: "slot-2", label: "7.2 목요일", time: "19:00", note: "잠실" },
            { id: "slot-3", label: "7.3 금요일", time: "19:00", note: "홍대" },
          ],
          responses: [],
          status: "collecting",
          selectedCandidateId: null,
          createdAt: new Date().toISOString(),
          closedAt: null,
        },
        draftPreferences: {},
        currentParticipant: "",
        copyStatus: "",
        lastSubmittedAt: null,
      }),
    );
  });
  await demoResetPage.goto(`${baseFileUrl}?demo=1&reset=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  const normalAfterDemoReset = await demoResetPage.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:mvp:v1")));
  assert(
    normalAfterDemoReset?.room?.title === "보존되어야 하는 일반 모임",
    "demo reset should not delete an existing normal saved room",
  );
  await demoResetPage.goto(`${baseFileUrl}?demo=1&screen=scr-07-settings`, { waitUntil: "load" });
  await demoResetPage.getByTestId("clear-local-data-button").click();
  const normalAfterDemoClear = await demoResetPage.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:mvp:v1")));
  assert(
    normalAfterDemoClear?.room?.title === "보존되어야 하는 일반 모임",
    "demo privacy clear should not delete an existing normal saved room",
  );
  await demoResetContext.close();

  await page.goto(`${pageUrl}&screen=scr-00-entry`, { waitUntil: "load" });
  await page.getByTestId("privacy-settings-button").click();
  await page.waitForSelector("[data-testid='settings-screen']");
  const settingsText = await page.locator("body").innerText();
  assert(settingsText.includes("개인정보") && settingsText.includes("로컬 데이터 지우기"), "settings screen should explain privacy and deletion");
  assert(settingsText.includes("개인정보처리방침") && settingsText.includes("문의") && settingsText.includes("보관"), "settings screen should include privacy policy, contact, and retention details");
  const privacyHref = await page.getByTestId("privacy-policy-link").getAttribute("href");
  assert(privacyHref?.includes("privacy.html"), "settings screen should link to a privacy policy document");
  await page.getByTestId("clear-local-data-button").click();
  const storageAfterClear = await page.evaluate(() => localStorage.getItem("hammoyo:mvp:v1"));
  assert(storageAfterClear === null, "clear local data action should remove MVP localStorage");

  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(`${pageUrl}&screen=scr-00-entry`, { waitUntil: "load" });
  await assertButtonInInitialViewport(page, "start-create-room", "primary home CTA should stay visible at 320px width");
  const labelsAt320 = await visibleButtonLabels(page);
  assert(labelsAt320.includes("개인정보"), "privacy/settings button should remain visible at 320px width");

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  await assertButtonInInitialViewport(page, "copy-share-button", "desktop preview result CTA should stay within the first viewport");

  const failureContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  await failureContext.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("clipboard denied");
        },
      },
    });
    document.execCommand = () => false;
  });
  const failurePage = await failureContext.newPage();
  failurePage.setDefaultTimeout(5000);
  await failurePage.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  await failurePage.getByTestId("copy-share-button").click();
  await failurePage.waitForSelector("[data-testid='copy-status']");
  const failureCopyStatus = await failurePage.getByTestId("copy-status").innerText();
  assert(failureCopyStatus.includes("복사하지 못했어요"), "copy action should show a failure status when all copy APIs fail");
  await failureContext.close();

  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto(`${baseFileUrl}?reset=1&lang=en`, { waitUntil: "load" });
  assert((await page.locator("html").getAttribute("lang")) === "en", "lang=en should set the document language");
  const englishEntryText = await page.locator("body").innerText();
  assert(englishEntryText.includes("Find a time that works"), "English locale should render entry headline");
  await page.goto(`${baseFileUrl}?reset=1&demo=1&lang=en&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  const englishResultText = await page.locator("body").innerText();
  assert(englishResultText.includes("Copy result copy"), "English result screen should render the localized CTA");
  assert(
    englishResultText.includes("most workable option so far"),
    "English result screen should render localized recommendation copy",
  );
  assert(
    !englishResultText.includes("가장 현실적인 약속안"),
    "English result screen should not expose Korean recommendation copy",
  );
  const englishRecommendationCardText = await page.getByTestId("recommendation-card").innerText();
  assert(
    !/[가-힣]/.test(englishRecommendationCardText),
    "English recommendation card should not mix Korean demo fixture text",
  );
  const englishCopyText = await page.evaluate(() => {
    const api = window.HAMMOYEO_MVP_TESTS;
    const room = api.createDemoRoom({
      responses: [
        { alias: "A", preferences: { "slot-1": "prefer", "slot-2": "available", "slot-3": "hardNo" } },
        { alias: "B", preferences: { "slot-1": "available", "slot-2": "prefer", "slot-3": "hardNo" } },
        { alias: "C", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "available" } },
        { alias: "D", preferences: { "slot-1": "available", "slot-2": "adjustable", "slot-3": "available" } },
      ],
    });
    const ranked = api.rankCandidates(room);
    return api.buildCopyTextForAction(room, "copy-share", ranked);
  });
  assert(englishCopyText.includes("most workable option so far"), "English copy payload should be localized");
  assert(!englishCopyText.includes("가장 현실적인 약속안"), "English copy payload should not include Korean recommendation copy");
  assert(!/[가-힣]/.test(englishCopyText), "English copy payload should not mix Korean demo fixture text");
  await page.goto(`${baseFileUrl}?reset=1&lang=en`, { waitUntil: "load" });
  await page.getByTestId("language-toggle-button").click();
  assert((await page.locator("html").getAttribute("lang")) === "ko", "language toggle should switch back to Korean");

  const privacyDocument = readFileSync(resolve("docs/mvp/privacy.html"), "utf8");
  assert(privacyDocument.includes("English Summary"), "privacy policy should include an English summary");
  assert(
    privacyDocument.includes("data-deletion") && privacyDocument.includes("request URL must be finalized"),
    "privacy policy should keep release-gate deletion URL caveat visible",
  );
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto(privacyFileUrl, { waitUntil: "load" });
    await assertNoHorizontalOverflow(page);
  }

  await assertNoHorizontalOverflow(page);
  assert(consoleErrors.length === 0, `console errors detected: ${consoleErrors.join(" | ")}`);

  await browser.close();

  if (failures.length > 0) {
    console.error("[기능 계약 검증기] 실패");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("[기능 계약 검증기] 통과");
}

main().catch((error) => {
  console.error("[기능 계약 검증기] 실행 실패");
  console.error(error);
  process.exit(1);
});
