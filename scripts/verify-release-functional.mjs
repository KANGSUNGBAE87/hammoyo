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
const baseFileUrl = pathToFileURL(resolve("docs/release/index.html")).href;
const privacyFileUrl = pathToFileURL(resolve("docs/release/privacy.html")).href;
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

async function assertStickyCtaDoesNotCoverBody(page, message) {
  const result = await page.evaluate(() => {
    const screenBody = document.querySelector(".screenBody");
    const cta = document.querySelector(".StickyBottomCTA");
    if (!screenBody || !cta) return { ok: false, reason: "missing screen body or CTA" };
    window.scrollTo(0, document.documentElement.scrollHeight);
    const bodyRect = screenBody.getBoundingClientRect();
    const ctaRect = cta.getBoundingClientRect();
    return {
      ok: bodyRect.bottom <= ctaRect.top - 8,
      bodyBottom: Math.round(bodyRect.bottom),
      ctaTop: Math.round(ctaRect.top),
    };
  });
  assert(result.ok, `${message}: ${JSON.stringify(result)}`);
}

async function main() {
  const launchOptions = { headless: true };
  if (process.env.HAMMOYEO_PLAYWRIGHT_CHROME_PATH) {
    launchOptions.executablePath = process.env.HAMMOYEO_PLAYWRIGHT_CHROME_PATH;
  }
  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    viewport: { width: 390, height: 740 },
  });
  await context.addInitScript(() => {
    window.__HAMMOYEO_SHARED_PAYLOADS = [];
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload) => {
        window.__HAMMOYEO_SHARED_PAYLOADS.push(payload);
      },
    });
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
  assert(cleanEntryText.includes("아직 만든 모임이 없어요"), "clean entry should explain that no room exists yet");
  assert(cleanEntryText.includes("현재 상태"), "entry should show a concise current status card");
  assert(!cleanEntryText.includes("EN") && !cleanEntryText.includes("앱 준비"), "entry should not expose language or app-ready pills");
  const cleanEntryStorage = await page.evaluate(() => localStorage.getItem("hammoyo:release:v1"));
  assert(cleanEntryStorage === null, "clean entry should not persist a placeholder room");
  assert((await page.locator('[data-testid="settings-button"]').count()) === 0, "topbar should not expose a duplicate settings button");
  assert((await page.locator('[data-testid="topbar-home-button"]').count()) === 0, "topbar should not expose a duplicate home button");
  assert((await page.locator('[data-testid="start-create-room"]').count()) === 0, "home should not expose a duplicate create CTA");
  assert((await page.locator('[data-testid="open-host-dashboard-button"]').count()) === 0, "home should not expose a duplicate my-meetups CTA");
  assert(await page.getByTestId("bottom-nav-settings").isVisible(), "entry should expose settings through bottom navigation");
  assert((await page.getByTestId("bottom-nav-create").innerText()).includes("모임"), "bottom create tab should use a readable create label");
  assert((await page.locator('[data-testid="language-toggle-button"]').count()) === 0, "entry should not expose a language switcher");

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(baseFileUrl, { waitUntil: "load" });
  assert(!(await page.locator(".tabsPanel").isVisible()), "desktop debug screen panel should be hidden by default");
  const defaultDesktopPhone = await page.locator(".phone").boundingBox();
  assert(defaultDesktopPhone?.width >= 980, "default desktop product shell should fill the available viewport instead of staying capped at 430px");
  await page.goto(`${baseFileUrl}?debug=1`, { waitUntil: "load" });
  assert(await page.locator(".tabsPanel").isVisible(), "desktop debug screen panel should be visible only with debug=1");
  const debugDesktopPhone = await page.locator(".phone").boundingBox();
  assert(debugDesktopPhone?.width <= 432, "debug desktop preview should keep the constrained phone frame");
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto(pageUrl, { waitUntil: "load" });

  const algorithmChecks = await page.evaluate(() => {
    const api = window.HAMMOYEO_APP_TESTS;
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
        { alias: "E", preferences: { "slot-1": "available", "slot-2": "prefer", "slot-3": "available" } },
      ],
    });
    const ranked = api.rankCandidates(room);
    const hardNoConstraintRoom = api.createDemoRoom({
      expectedCount: 5,
      candidates: [
        { id: "slot-1", label: "7.5 토요일", time: "18:30", note: "강남역" },
        { id: "slot-2", label: "7.6 일요일", time: "17:00", note: "잠실" },
        { id: "slot-3", label: "7.7 월요일", time: "19:00", note: "홍대" },
      ],
      responses: [
        { alias: "A", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "hardNo" } },
        { alias: "B", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "hardNo" } },
        { alias: "C", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "hardNo" } },
        { alias: "D", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "hardNo" } },
        { alias: "E", preferences: { "slot-1": "hardNo", "slot-2": "adjustable", "slot-3": "hardNo" } },
      ],
    });
    const constrained = api.rankCandidates(hardNoConstraintRoom);
    const sameDayTieRoom = api.createDemoRoom({
      expectedCount: 3,
      candidates: [
        { id: "slot-1", date: "2026-07-05", label: "7.5 토요일", time: "20:00", note: "강남역" },
        { id: "slot-2", date: "2026-07-05", label: "7.5 토요일", time: "18:00", note: "잠실" },
        { id: "slot-3", date: "2026-07-06", label: "7.6 일요일", time: "19:00", note: "홍대" },
      ],
      responses: [
        { alias: "A", preferences: { "slot-1": "available", "slot-2": "available", "slot-3": "hardNo" } },
        { alias: "B", preferences: { "slot-1": "available", "slot-2": "available", "slot-3": "hardNo" } },
        { alias: "C", preferences: { "slot-1": "available", "slot-2": "available", "slot-3": "hardNo" } },
      ],
    });
    const sameDayTie = api.rankCandidates(sameDayTieRoom);
    return {
      threshold: api.minimumResponses(7),
      topId: ranked.top?.candidate.id,
      confidence: ranked.confidence,
      excluded: ranked.items.filter((item) => item.excluded).map((item) => item.candidate.id),
      constraintTopId: constrained.top?.candidate.id,
      constraintExcluded: constrained.items.filter((item) => item.excluded).map((item) => item.candidate.id),
      sameDayTieTopId: sameDayTie.top?.candidate.id,
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

  assert(algorithmChecks !== null, "window.HAMMOYEO_APP_TESTS API is missing");
  if (algorithmChecks) {
    assert(algorithmChecks.threshold === 5, "minimum response threshold should be 5 for 7 expected participants");
    assert(algorithmChecks.topId === "slot-1", "ranking should choose slot-1 for the deterministic fixture");
    assert(algorithmChecks.confidence === "medium", "fixture should produce medium confidence at 5/7 responses");
    assert(algorithmChecks.excluded.includes("slot-3"), "candidate with any hard-no response should be excluded");
    assert(algorithmChecks.constraintTopId === "slot-2", "a single hard-no should make a candidate ineligible even when its score is high");
    assert(algorithmChecks.constraintExcluded.includes("slot-1"), "hard-no constrained candidate should be marked excluded");
    assert(algorithmChecks.sameDayTieTopId === "slot-2", "same-day tied candidates should use the earlier time before host order");
    assert(
      algorithmChecks.shareCopy.includes("6.29 토요일 18:30"),
      "share copy should include the recommended date and time",
    );
    assert(algorithmChecks.copyTexts !== null, "copy text builder should be exposed for verification");
    assert(
      algorithmChecks.copyTexts?.invite.includes("screen=scr-00-entry") &&
        algorithmChecks.copyTexts?.invite.includes("join="),
      "invite copy should include a home invite share link",
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

  await page.getByTestId("bottom-nav-create").click();
  assert((await page.locator('input[type="date"], input[type="time"]').count()) === 0, "host setup should not expose browser-native date/time pickers");
  assert(await page.getByTestId("bottom-nav-create").isVisible(), "release shell should expose bottom create tab");
  assert(await page.getByTestId("bottom-nav-home").evaluate((node) => node.closest(".BottomNav") !== null), "bottom nav should use the BottomNav shell");
  await page.getByTestId("bottom-nav-meetups").click();
  await page.waitForSelector("#scr-08-my-meetups");
  await page.getByTestId("bottom-nav-create").click();
  await page.waitForSelector("#scr-01-host-room");
  await page.getByTestId("room-title-input").fill("금요일 저녁 모임");
  await page.getByTestId("expected-count-select").selectOption("7");
  assert(await page.getByTestId("expected-count-select").evaluate((node) => node.closest(".selectShell") !== null), "expected count should use an iOS-like select shell");
  await page.waitForSelector('[data-testid="participant-name-input-6"]');
  assert((await page.locator('[data-testid^="participant-name-input-"]').count()) === 7, "host setup should require one participant name field per expected person");
  await page.getByTestId("create-room-button").click();
  assert((await page.getByTestId("host-form-error").innerText()).includes("참여자"), "host setup should block sharing until participant names are filled");
  const participantNames = ["성배", "민지", "준호", "수연", "지훈", "하린", "도윤"];
  for (const [index, name] of participantNames.entries()) {
    await page.getByTestId(`participant-name-input-${index}`).fill(name);
  }
  assert(await page.getByTestId("candidate-calendar-trigger-0").evaluate((node) => node.closest(".IPhoneCalendarPicker") !== null), "candidate dates should use the iPhone-like calendar picker");
  assert(await page.getByTestId("candidate-time-wheel-0").evaluate((node) => node.closest(".ReleaseTimeWheel") !== null), "candidate times should use the alarm-style wheel");
  assert((await page.getByTestId("candidate-calendar-sheet-0").isVisible()) === false, "candidate calendar should stay closed until the date button is pressed");
  await page.getByTestId("candidate-calendar-trigger-0").click();
  assert(await page.getByTestId("candidate-calendar-sheet-0").isVisible(), "candidate calendar should open as an overlay sheet from the date button");
  await page.getByTestId("candidate-calendar-day-0-2026-07-05").click();
  assert((await page.getByTestId("candidate-calendar-sheet-0").isVisible()) === false, "candidate calendar should close after selecting a date");
  await page.getByTestId("candidate-time-hour-0-18").click();
  await page.getByTestId("candidate-time-minute-0-30").click();
  await page.getByTestId("candidate-note-input-0").fill("강남역 근처");
  await page.getByTestId("candidate-calendar-trigger-1").click();
  await page.getByTestId("candidate-calendar-day-1-2026-07-06").click();
  await page.getByTestId("candidate-time-hour-1-17").click();
  await page.getByTestId("candidate-time-minute-1-00").click();
  await page.getByTestId("candidate-note-input-1").fill("잠실");
  await page.getByTestId("add-candidate-button").click();
  await page.getByTestId("candidate-calendar-trigger-3").click();
  assert(await page.getByTestId("candidate-calendar-day-3-2026-07-07").isVisible(), "host should be able to add a fourth candidate slot");
  await page.getByTestId("candidate-calendar-day-3-2026-07-07").click();
  await page.getByTestId("candidate-time-hour-3-19").click();
  await page.getByTestId("candidate-time-minute-3-30").click();
  await page.getByTestId("candidate-note-input-3").fill("성수");
  await page.getByTestId("remove-candidate-2").click();
  assert((await page.locator("[data-testid^='candidate-date-control-']").count()) === 3, "host should be able to remove a candidate slot");
  await page.getByTestId("create-room-button").click();

  const createdRoom = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(createdRoom?.room?.title === "금요일 저녁 모임", "created room should be persisted in localStorage");
  assert(createdRoom?.room?.participants?.length === 7, "created room should persist the required participant roster");
  assert(createdRoom?.room?.participants?.every((participant) => participant.name), "created participant roster should keep each required name");
  assert(createdRoom?.room?.status === "collecting", "created room should enter collecting status");
  assert(createdRoom?.room?.shareUrl?.includes("join="), "created room should persist a general share link");
  assert(createdRoom?.hostRooms?.length === 1, "created room should be listed in my meetups");
  assert(createdRoom?.room?.candidates?.[0]?.date === "2026-07-05", "date picker value should be persisted on the candidate");
  assert(createdRoom?.room?.candidates?.[0]?.label.includes("7.5"), "date picker value should be formatted for display");
  const afterCreateText = await page.locator("body").innerText();
  assert(afterCreateText.includes("응답이 조금 더 필요해요"), "host create CTA should land on invite-copy ready state");
  assert(afterCreateText.includes("공유 준비됨"), "host create result should show the share-ready card");
  assert(afterCreateText.includes("친구한테 공유하기"), "host create result should expose friend-share wording");
  const generalShareLink = await page.getByTestId("general-share-link").inputValue();
  assert(generalShareLink.includes("join=") && generalShareLink.includes("screen=scr-00-entry"), "general share link should open the shared home invite screen");
  await page.getByTestId("bottom-nav-respond").click();
  await page.waitForSelector('[data-testid="response-inbox-list"]');
  const responseInboxText = await page.getByTestId("response-inbox-list").innerText();
  assert(responseInboxText.includes("받은 초대"), "response tab should show received invitations before the response form");
  assert(/0\s*\/\s*7/.test(responseInboxText), "response inbox should show progress like 0/7");
  await page.getByTestId("response-inbox-open-0").click();
  await page.waitForSelector("#scr-02-participant-input");
  await page.waitForFunction(() => new URLSearchParams(window.location.search).get("response") === "detail");
  assert(await page.getByTestId("participant-picker-list").isVisible(), "respondent should choose their name from the host roster before answering");
  await page.getByTestId("participant-picker-민지").click();
  assert((await page.getByTestId("participant-name-input").inputValue()) === "민지", "participant picker should fill the selected respondent name");
  await page.goBack();
  await page.waitForSelector('[data-testid="response-inbox-list"]');
  await page.waitForFunction(() => new URLSearchParams(window.location.search).get("response") === "inbox");
  await page.getByTestId("response-inbox-open-0").click();
  await page.waitForSelector("#scr-02-participant-input");
  await page.waitForFunction(() => new URLSearchParams(window.location.search).get("response") === "detail");
  await page.getByTestId("bottom-nav-meetups").click();
  await page.waitForSelector("[data-testid='my-meetups-screen']");
  await page.getByTestId("open-room-status-0").click();
  await page.waitForSelector("#scr-04-insufficient-response");
  const inviteContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  const invitePage = await inviteContext.newPage();
  invitePage.setDefaultTimeout(5000);
  await invitePage.goto(generalShareLink, { waitUntil: "load" });
  const inviteHomeText = await invitePage.locator("body").innerText();
  assert(inviteHomeText.includes("초대가 도착했어요"), "incoming invite link should land on the home UI with an invite card");
  assert(inviteHomeText.includes("초대 응답하기"), "incoming invite home should expose a response CTA");
  await invitePage.getByTestId("respond-to-invite-button").click();
  await invitePage.waitForSelector('[data-testid="response-inbox-list"]');
  const inviteInboxText = await invitePage.getByTestId("response-inbox-list").innerText();
  assert(inviteInboxText.includes("받은 초대"), "incoming invite CTA should open the received-invites list before the response form");
  assert(/0\s*\/\s*7/.test(inviteInboxText), "incoming invite inbox should expose response progress before entering detail");
  await invitePage.getByTestId("response-inbox-open-0").click();
  await invitePage.waitForSelector("#scr-02-participant-input");
  await invitePage.waitForFunction(() => new URLSearchParams(window.location.search).get("response") === "detail");
  assert(await invitePage.getByTestId("participant-picker-list").isVisible(), "shared invite response should ask the respondent to choose a roster name");
  await invitePage.getByTestId("participant-picker-준호").click();
  assert((await invitePage.getByTestId("participant-name-input").inputValue()) === "준호", "shared invite respondent should select their own name from the roster");
  await inviteContext.close();
  await page.getByTestId("copy-invite-button").click();
  await page.waitForSelector("[data-testid='copy-status']");
  const inviteCopyStatus = await page.getByTestId("copy-status").innerText();
  assert(inviteCopyStatus.includes("공유 화면"), "insufficient response invite action should open the native share sheet");
  const firstSharePayloads = await page.evaluate(() => window.__HAMMOYEO_SHARED_PAYLOADS || []);
  assert(firstSharePayloads.some((payload) => payload?.url?.includes("join=")), "invite action should pass the invite URL to navigator.share");
  await page.getByTestId("bottom-nav-home").click();
  await page.waitForSelector("#scr-00-entry");
  await page.getByTestId("bottom-nav-meetups").click();
  await page.waitForSelector("[data-testid='my-meetups-screen']");
  const dashboardText = await page.locator("body").innerText();
  assert(dashboardText.includes("내가 만든 모임") && dashboardText.includes("금요일 저녁 모임"), "my meetups dashboard should show the created room");
  assert(dashboardText.includes("0명 응답"), "my meetups dashboard should show the current response count");
  assert(dashboardText.includes("미응답 7명"), "my meetups dashboard should summarize unanswered roster members");
  assert((await page.locator('[data-testid="dashboard-create-room-button"]').count()) === 0, "my meetups should not expose duplicate create CTA");
  const firstCardActionGrid = await page.getByTestId("host-card-actions-0").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
  assert(firstCardActionGrid >= 3, "my meetups card actions should use a compact 3+1 layout instead of a single vertical stack");
  await page.getByTestId("edit-host-room-0").click();
  await page.waitForSelector("#scr-01-host-room");
  await page.getByTestId("room-title-input").fill("수정된 금요일 모임");
  await page.getByTestId("expected-count-select").selectOption("9");
  await page.waitForSelector('[data-testid="participant-name-input-8"]');
  await page.getByTestId("participant-name-input-7").fill("서윤");
  await page.getByTestId("participant-name-input-8").fill("태오");
  await page.getByTestId("candidate-calendar-trigger-0").click();
  await page.getByTestId("candidate-calendar-day-0-2026-07-12").click();
  await page.getByTestId("candidate-time-hour-0-20").click();
  await page.getByTestId("candidate-time-minute-0-10").click();
  await page.getByTestId("candidate-note-input-0").fill("성수역 근처");
  await page.getByTestId("create-room-button").click();
  await page.waitForSelector("[data-testid='my-meetups-screen']");
  const editedRoomState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(editedRoomState?.room?.title === "수정된 금요일 모임", "editing a hosted room should update the active room title");
  assert(editedRoomState?.room?.expectedCount === 9, "editing a hosted room should update expected count");
  assert(editedRoomState?.room?.candidates?.[0]?.date === "2026-07-12", "editing a hosted room should update candidate date");
  assert(editedRoomState?.room?.candidates?.[0]?.time === "20:10", "editing a hosted room should update candidate time");
  assert(editedRoomState?.room?.candidates?.[0]?.note === "성수역 근처", "editing a hosted room should update candidate place/note");
  await page.getByTestId("open-room-status-0").click();
  await page.waitForSelector("#scr-04-insufficient-response");
  await page.getByTestId("bottom-nav-home").click();
  await page.waitForSelector("#scr-00-entry");
  await page.getByTestId("bottom-nav-meetups").click();
  await page.waitForSelector("[data-testid='my-meetups-screen']");
  await page.getByTestId("copy-room-link-0").click();
  await page.waitForSelector("[data-testid='copy-status']");
  assert((await page.getByTestId("copy-status").innerText()).includes("공유 화면"), "my meetups dashboard should open the native share sheet");
  await page.getByTestId("delete-room-button-0").click();
  await page.waitForSelector('[data-testid="custom-confirm-modal"]');
  assert((await page.getByTestId("custom-confirm-modal").innerText()).includes("삭제"), "room deletion should ask for custom confirmation");
  await page.getByTestId("confirm-modal-confirm").click();
  await page.waitForSelector("[data-testid='my-meetups-screen']");
  const deletedRoomState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert((deletedRoomState?.hostRooms || []).length === 0, "deleted room should be removed from my meetups");
  assert(deletedRoomState?.room === null, "deleting the active hosted room should clear the active room");
  assert(deletedRoomState?.revokedRoomIds?.length === 1, "deleted room id should be recorded as revoked");
  await page.goto(generalShareLink, { waitUntil: "load" });
  await page.waitForSelector("#scr-05-link-expired");
  const deletedLinkText = await page.locator("body").innerText();
  assert(deletedLinkText.includes("만료") || deletedLinkText.includes("삭제"), "deleted room share link should become unavailable in the current browser state");
  await page.goto(`${baseFileUrl}?reset=1`, { waitUntil: "load" });
  await page.getByTestId("bottom-nav-create").click();
  await page.getByTestId("room-title-input").fill("다시 만든 금요일 모임");
  for (const [index, name] of participantNames.entries()) {
    await page.getByTestId(`participant-name-input-${index}`).fill(name);
  }
  await page.getByTestId("candidate-calendar-trigger-0").click();
  await page.getByTestId("candidate-calendar-day-0-2026-07-05").click();
  await page.getByTestId("candidate-time-hour-0-18").click();
  await page.getByTestId("candidate-time-minute-0-30").click();
  await page.getByTestId("create-room-button").click();
  await page.waitForSelector("#scr-04-insufficient-response");
  await page.getByTestId("bottom-nav-home").click();
  await page.waitForSelector("#scr-00-entry");
  await page.getByTestId("bottom-nav-meetups").click();
  await page.waitForSelector("[data-testid='my-meetups-screen']");
  await page.getByTestId("open-room-status-0").click();
  await page.waitForSelector("#scr-04-insufficient-response");

  await page.goto(`${baseFileUrl}?screen=scr-02-participant-input`, { waitUntil: "load" });
  await page.getByTestId("submit-response-button").click();
  assert((await page.getByTestId("response-form-error").innerText()).includes("명단"), "roster-based response should require choosing my name first");
  await page.getByTestId("participant-picker-성배").click();
  await page.getByTestId("submit-response-button").click();
  const firstRosterResponseState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(
    firstRosterResponseState?.room?.responses?.[0]?.alias === "성배" &&
      firstRosterResponseState?.room?.responses?.[0]?.participantId === "participant-1",
    "selected roster participant should be saved with a stable participant id",
  );
  await page.getByTestId("edit-response-button").click();
  await page.getByTestId("participant-picker-성배").click();
  await page.getByTestId("submit-response-button").click();
  const editedAliasState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(
    editedAliasState?.room?.responses?.length === 1 && editedAliasState.room.responses[0].alias === "성배",
    "editing my response should update the existing roster response instead of adding a new one",
  );
  await page.evaluate(() => {
    const key = "hammoyo:release:v1";
    const state = JSON.parse(localStorage.getItem(key));
    state.currentParticipant = "";
    state.lastResponseId = null;
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.goto(`${baseFileUrl}?screen=scr-02-participant-input`, { waitUntil: "load" });
  await page.getByTestId("participant-picker-민지").click();
  await page.getByTestId("submit-response-button").click();
  const secondRosterState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(
    secondRosterState?.room?.responses?.some((response) => response.alias === "성배") &&
      secondRosterState?.room?.responses?.some((response) => response.alias === "민지") &&
      secondRosterState?.room?.responses?.length === 2,
    "a second roster participant should add a separate response without overwriting another person",
  );
  await page.getByTestId("copy-reminder-button").click();
  await page.waitForSelector("[data-testid='copy-status']");
  const reminderCopyStatus = await page.getByTestId("copy-status").innerText();
  assert(reminderCopyStatus.includes("공유 화면"), "response-complete reminder action should open the native share sheet");

  await page.goto(`${baseFileUrl}?screen=scr-02-participant-input`, { waitUntil: "load" });
  await page.getByTestId("participant-picker-민지").click();
  await page.getByTestId("preference-slot-1-prefer").click();
  await page.getByTestId("preference-slot-2-available").click();
  await page.getByTestId("preference-slot-3-hardNo").click();
  await page.getByTestId("submit-response-button").click();

  const storedAfterResponse = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(
    storedAfterResponse?.room?.responses?.some((response) => response.alias === "민지"),
    "participant response should be saved",
  );

  await page.goto(`${baseFileUrl}?demo=1&screen=scr-02b-response-complete`, { waitUntil: "load" });
  await page.getByTestId("seed-responses-button").click();
  await page.waitForSelector("[data-testid='recommendation-card']");
  const resultText = await page.getByTestId("recommendation-card").innerText();
  assert(resultText.includes("추천 1순위"), "recommendation card should show primary recommendation label");
  assert(resultText.includes("6.29 토요일 18:30"), "recommendation card should show computed top candidate");

  await page.getByTestId("copy-share-button").click();
  await page.waitForSelector("[data-testid='copy-status']");
  const copyStatus = await page.getByTestId("copy-status").innerText();
  assert(copyStatus.includes("공유 화면"), "share action should open the native share sheet");

  await page.getByTestId("close-room-button").click();
  await page.waitForSelector("#scr-06-room-closed");
  const closedState = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:demo:v1")));
  assert(closedState?.room?.status === "closed", "close action should persist closed status");

  await page.goto(`${pageUrl}&screen=scr-06-room-closed`, { waitUntil: "load" });
  const stateAfterClosedDirect = await page.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1") || "null"));
  assert(stateAfterClosedDirect?.room?.status !== "closed", "closed screen direct link should not create a closed room outside demo mode");
  await page.getByTestId("bottom-nav-home").click();
  await page.waitForSelector("#scr-00-entry");
  assert(await page.getByTestId("bottom-nav-settings").isVisible(), "entry should expose settings path through bottom nav");

  await page.goto(`${pageUrl}&demo=1&screen=scr-03-result-recommendation&ai=on`, { waitUntil: "load" });
  const aiLabelText = await page.locator("body").innerText();
  assert(!aiLabelText.includes("AI로 문장을 다듬었어요"), "template-only release product must not claim AI-polished copy");
  assert(aiLabelText.includes("친구한테 공유하기"), "result CTA should match friend-share behavior");
  await assertButtonInInitialViewport(page, "copy-share-button", "result copy CTA should be visible on initial mobile viewport");

  await page.goto(`${pageUrl}&screen=scr-02b-response-complete`, { waitUntil: "load" });
  const responseCompleteText = await page.locator("body").innerText();
  assert(!responseCompleteText.includes("응답을 보냈어요"), "response-complete direct link should not claim success without a submitted response");
  assert(responseCompleteText.includes("아직 만든 모임이 없어요"), "response-complete direct link should fall back to the entry state");

  await page.goto(`${pageUrl}&screen=scr-05-link-expired`, { waitUntil: "load" });
  const expiredState = await page.evaluate(() => localStorage.getItem("hammoyo:release:v1"));
  assert(expiredState === null, "expired preview deep link should not mutate persisted room state");
  assert(await page.getByTestId("bottom-nav-home").isVisible(), "expired screen should expose bottom home path");

  await page.goto(`${baseFileUrl}?screen=scr-02-participant-input`, { waitUntil: "load" });
  const participantDirectText = await page.locator("body").innerText();
  assert(participantDirectText.includes("아직 만든 모임이 없어요"), "participant direct link without a room should not render a fake response form");

  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-05-link-expired`, { waitUntil: "load" });
  await page.goto(`${baseFileUrl}?demo=1&screen=scr-02-participant-input`, { waitUntil: "load" });
  assert(await page.getByTestId("submit-response-button").isDisabled(), "expired demo room should reject participant writes across direct route changes");
  const disabledPreferenceCount = await page.locator(".preferenceOption:disabled").count();
  assert(disabledPreferenceCount >= 12, "expired demo room should disable every preference option");

  const demoIsolationContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  await demoIsolationContext.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {},
    });
  });
  const demoIsolationPage = await demoIsolationContext.newPage();
  demoIsolationPage.setDefaultTimeout(5000);
  await demoIsolationPage.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  await demoIsolationPage.getByTestId("copy-share-button").click();
  await demoIsolationPage.waitForSelector("[data-testid='copy-status']");
  const normalStorageAfterDemo = await demoIsolationPage.evaluate(() => localStorage.getItem("hammoyo:release:v1"));
  assert(normalStorageAfterDemo === null, "demo interactions should not write to the normal release storage key");
  await demoIsolationPage.goto(`${baseFileUrl}?screen=scr-00-entry`, { waitUntil: "load" });
  const normalHomeAfterDemo = await demoIsolationPage.locator("body").innerText();
  assert(!normalHomeAfterDemo.includes("최근 방:"), "demo interactions should not create a normal recent room");
  assert(normalHomeAfterDemo.includes("아직 만든 모임이 없어요"), "normal home should stay empty after demo interactions");
  await demoIsolationContext.close();

  const demoResetContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  const demoResetPage = await demoResetContext.newPage();
  demoResetPage.setDefaultTimeout(5000);
  await demoResetPage.goto(`${baseFileUrl}?reset=1&screen=scr-00-entry`, { waitUntil: "load" });
  await demoResetPage.evaluate(() => {
    localStorage.setItem(
      "hammoyo:release:v1",
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
  const normalAfterDemoReset = await demoResetPage.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(
    normalAfterDemoReset?.room?.title === "보존되어야 하는 일반 모임",
    "demo reset should not delete an existing normal saved room",
  );
  await demoResetPage.goto(`${baseFileUrl}?demo=1&screen=scr-07-settings`, { waitUntil: "load" });
  await demoResetPage.getByTestId("clear-local-data-button").click();
  const normalAfterDemoClear = await demoResetPage.evaluate(() => JSON.parse(localStorage.getItem("hammoyo:release:v1")));
  assert(
    normalAfterDemoClear?.room?.title === "보존되어야 하는 일반 모임",
    "demo privacy clear should not delete an existing normal saved room",
  );
  await demoResetContext.close();

  await page.goto(`${pageUrl}&screen=scr-00-entry`, { waitUntil: "load" });
  await page.getByTestId("bottom-nav-settings").click();
  await page.waitForSelector("[data-testid='settings-screen']");
  const settingsText = await page.locator("body").innerText();
  assert(settingsText.includes("로그인 상태") && settingsText.includes("로그아웃"), "settings screen should expose login status and logout");
  assert(settingsText.includes("개인정보") && settingsText.includes("로컬 데이터 지우기"), "settings screen should explain privacy and deletion");
  assert(!settingsText.includes("홈으로 돌아가기"), "settings screen should not expose a duplicate home CTA");
  assert(settingsText.includes("개인정보처리방침") && settingsText.includes("문의") && settingsText.includes("보관"), "settings screen should include privacy policy, contact, and retention details");
  const privacyHref = await page.getByTestId("privacy-policy-link").getAttribute("href");
  assert(privacyHref?.includes("privacy.html"), "settings screen should link to a privacy policy document");
  const contactHref = await page.getByTestId("contact-link").getAttribute("href");
  assert(contactHref?.includes("contact.html"), "settings screen should expose a contact path");
  const deletionHref = await page.getByTestId("data-deletion-link").getAttribute("href");
  assert(deletionHref?.includes("delete-data.html"), "settings screen should expose a data deletion request path");
  await page.getByTestId("logout-button").click();
  await page.waitForSelector("[data-testid='copy-status']");
  assert((await page.getByTestId("copy-status").innerText()).includes("로그아웃"), "logout action should show status feedback");
  await page.getByTestId("clear-local-data-button").click();
  const storageAfterClear = await page.evaluate(() => localStorage.getItem("hammoyo:release:v1"));
  assert(storageAfterClear === null, "clear local data action should remove release localStorage");

  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(`${pageUrl}&screen=scr-00-entry`, { waitUntil: "load" });
  await assertButtonInInitialViewport(page, "bottom-nav-create", "bottom create tab should stay visible at 320px width");
  await assertButtonInInitialViewport(page, "bottom-nav-settings", "bottom settings tab should remain visible at 320px width");

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  await assertButtonInInitialViewport(page, "copy-share-button", "desktop preview result CTA should stay within the first viewport");

  const failureContext = await browser.newContext({ viewport: { width: 390, height: 740 } });
  await failureContext.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
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

  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`${baseFileUrl}?reset=1&screen=scr-01-host-room`, { waitUntil: "load" });
  await page.getByTestId("room-title-input").fill("작성 중인 모임");
  await page.getByTestId("bottom-nav-home").click();
  await page.waitForSelector('[data-testid="custom-confirm-modal"]');
  assert((await page.getByTestId("custom-confirm-modal").innerText()).includes("작성 중"), "dirty host setup should show a custom exit confirmation from bottom nav");
  await page.getByTestId("confirm-modal-cancel").click();
  assert(await page.locator("#scr-01-host-room").isVisible(), "dismissing dirty exit confirmation should keep the host setup screen");
  await page.getByTestId("bottom-nav-home").click();
  await page.waitForSelector('[data-testid="custom-confirm-modal"]');
  await page.getByTestId("confirm-modal-confirm").click();
  await page.waitForSelector("#scr-00-entry");
  await page.getByTestId("bottom-nav-create").click();
  await page.getByTestId("room-title-input").fill("뒤로가기 작성 중");
  await page.goBack();
  await page.waitForSelector('[data-testid="custom-confirm-modal"]');
  assert((await page.getByTestId("custom-confirm-modal").innerText()).includes("작성 중"), "browser history navigation should guard dirty host setup with a custom modal");
  await page.getByTestId("confirm-modal-cancel").click();
  assert(await page.locator("#scr-01-host-room").isVisible(), "dismissing history dirty confirmation should keep the host setup screen");
  await page.goBack();
  await page.waitForSelector('[data-testid="custom-confirm-modal"]');
  await page.getByTestId("confirm-modal-confirm").click();
  await page.waitForSelector("#scr-00-entry");
  assert(new URLSearchParams(new URL(page.url()).search).get("screen") === "scr-00-entry", "accepting history dirty confirmation should complete the browser back navigation");
  await page.goto(`${baseFileUrl}?reset=1&screen=scr-01-host-room`, { waitUntil: "load" });
  await assertStickyCtaDoesNotCoverBody(page, "host setup mobile CTA should not cover the last input");
  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-02-participant-input`, { waitUntil: "load" });
  const preferenceAria = await page.getByTestId("preference-slot-1-prefer").getAttribute("aria-label");
  assert(preferenceAria?.includes("6.29 토요일") && preferenceAria.includes("가장 좋아요"), "preference buttons should name the candidate and status");
  const scrollBeforePreference = await page.evaluate(() => {
    const body = document.querySelector(".screenBody");
    if (!body) return 0;
    body.scrollTop = body.scrollHeight;
    return body.scrollTop;
  });
  await page.getByTestId("preference-slot-3-available").click();
  const scrollAfterPreference = await page.evaluate(() => document.querySelector(".screenBody")?.scrollTop || 0);
  assert(Math.abs(scrollAfterPreference - scrollBeforePreference) <= 8, "preference selection should not jump the response screen back to the top");
  await assertStickyCtaDoesNotCoverBody(page, "participant mobile CTA should not cover preference controls");
  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-02b-response-complete`, { waitUntil: "load" });
  await assertStickyCtaDoesNotCoverBody(page, "response-complete mobile CTA should not cover status content");
  await page.goto(`${baseFileUrl}?reset=1&demo=1&screen=scr-03-result-recommendation`, { waitUntil: "load" });
  await assertStickyCtaDoesNotCoverBody(page, "recommendation mobile CTA should not cover trust content");
  await page.goto(`${baseFileUrl}?reset=1&screen=scr-07-settings`, { waitUntil: "load" });
  await assertStickyCtaDoesNotCoverBody(page, "settings mobile CTA should not cover policy links");

  const readyReminderText = await page.evaluate(() => {
    const api = window.HAMMOYEO_APP_TESTS;
    const room = api.createDemoRoom({
      expectedCount: 3,
      responses: [
        { alias: "A", preferences: { "slot-1": "prefer", "slot-2": "available", "slot-3": "hardNo" } },
        { alias: "B", preferences: { "slot-1": "available", "slot-2": "prefer", "slot-3": "hardNo" } },
        { alias: "C", preferences: { "slot-1": "prefer", "slot-2": "adjustable", "slot-3": "available" } },
      ],
    });
    return api.buildCopyTextForAction(room, "copy-reminder", api.rankCandidates(room));
  });
  assert(!readyReminderText.includes("0명"), "ready reminder copy should not mention zero remaining responses");
  assert(readyReminderText.includes("충분히"), "ready reminder copy should switch to a ready-state message");

  const privacyDocument = readFileSync(resolve("docs/release/privacy.html"), "utf8");
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
