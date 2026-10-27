/**
 * School Competition Points & Leaderboard Calculator
 * Dynamic Row Generation, Real-Time Calculations, Ranking, Chart.js,
 * Firebase Cloud Firestore History, 71 Sri Lankan Schools Directory & Official PDF Generation
 */

import { 
  saveCalculationHistory, 
  fetchCalculationHistory, 
  deleteCalculationHistory 
} from "./firebase.js";

import { SRI_LANKAN_SCHOOLS } from "./schoolsData.js";

// Initial default sample data with realistic engagement numbers
const DEFAULT_SCHOOLS = [
  { id: 'sch_1', name: 'Royal College', likes: 1420, comments: 650, shares: 380, whatsapp: 2150 },
  { id: 'sch_2', name: 'Ananda College', likes: 1680, comments: 720, shares: 410, whatsapp: 1980 },
  { id: 'sch_3', name: 'Visakha Vidyalaya', likes: 1530, comments: 810, shares: 450, whatsapp: 1890 },
  { id: 'sch_4', name: 'Musaeus College', likes: 1250, comments: 530, shares: 290, whatsapp: 1720 },
  { id: 'sch_5', name: 'D.S. Senanayake College', likes: 1100, comments: 480, shares: 320, whatsapp: 1640 },
  { id: 'sch_6', name: 'Mahanama College', likes: 980, comments: 390, shares: 240, whatsapp: 1420 }
];

// User specified point weights: Like: 15, Comment: 10, Share: 10, WhatsApp Vote: 25
const DEFAULT_WEIGHTS = {
  likes: 15,
  comments: 10,
  shares: 10,
  whatsapp: 25
};

// Application State
let state = {
  schools: [],
  weights: { ...DEFAULT_WEIGHTS },
  chartType: 'bar-grouped', // 'bar-grouped' | 'bar-stacked' | 'bar-totals'
  searchQuery: '',
  lastLeaderId: null,
  cachedHistory: [],
  bulkSelectedSchools: new Set()
};

// DOM Elements
const tableBody = document.getElementById('tableBody');
const btnAddRow = document.getElementById('btnAddRow');
const btnAdd5Rows = document.getElementById('btnAdd5Rows');
const btnAddRowBottom = document.getElementById('btnAddRowBottom');
const btnSortRanks = document.getElementById('btnSortRanks');
const btnResetData = document.getElementById('btnResetData');
const btnClearAll = document.getElementById('btnClearAll');
const btnExportCSV = document.getElementById('btnExportCSV');
const btnExportPDF = document.getElementById('btnExportPDF');
const searchInput = document.getElementById('searchInput');

// School Selector DOM Elements
const quickSchoolInput = document.getElementById('quickSchoolInput');
const btnQuickAddSchool = document.getElementById('btnQuickAddSchool');
const btnOpenBulkPicker = document.getElementById('btnOpenBulkPicker');
const btnAddAll71Schools = document.getElementById('btnAddAll71Schools');
const customSuggestionsDropdown = document.getElementById('customSuggestionsDropdown');
const btnClearQuickSearch = document.getElementById('btnClearQuickSearch');
const quickChipsContainer = document.getElementById('quickChipsContainer');
const customSearchContainer = document.getElementById('customSearchContainer');

// Bulk School Picker Modal Elements
const bulkSchoolModal = document.getElementById('bulkSchoolModal');
const btnCloseBulkSchoolModal = document.getElementById('btnCloseBulkSchoolModal');
const btnCancelBulkPicker = document.getElementById('btnCancelBulkPicker');
const btnConfirmBulkAdd = document.getElementById('btnConfirmBulkAdd');
const bulkSearchInput = document.getElementById('bulkSearchInput');
const btnSelectAllSchools = document.getElementById('btnSelectAllSchools');
const btnDeselectAllSchools = document.getElementById('btnDeselectAllSchools');
const bulkSelectedCounter = document.getElementById('bulkSelectedCounter');
const schoolsChecklistContainer = document.getElementById('schoolsChecklistContainer');

// Cloud & History DOM Elements
const btnSaveCloud = document.getElementById('btnSaveCloud');
const btnViewHistory = document.getElementById('btnViewHistory');
const historyCountBadge = document.getElementById('historyCountBadge');

// Save Modal Elements
const saveModal = document.getElementById('saveModal');
const btnCloseSaveModal = document.getElementById('btnCloseSaveModal');
const btnCancelSave = document.getElementById('btnCancelSave');
const btnConfirmSave = document.getElementById('btnConfirmSave');
const inpSaveTitle = document.getElementById('inpSaveTitle');
const previewSaveDate = document.getElementById('previewSaveDate');
const previewSaveSchools = document.getElementById('previewSaveSchools');
const previewSaveLeader = document.getElementById('previewSaveLeader');
const previewSaveTotal = document.getElementById('previewSaveTotal');

// History Modal Elements
const historyModal = document.getElementById('historyModal');
const btnCloseHistoryModal = document.getElementById('btnCloseHistoryModal');
const btnCloseHistoryFooter = document.getElementById('btnCloseHistoryFooter');
const btnRefreshHistory = document.getElementById('btnRefreshHistory');
const historyListContainer = document.getElementById('historyListContainer');

// Rules Modal Elements
const rulesModal = document.getElementById('rulesModal');
const btnOpenRulesModal = document.getElementById('btnOpenRulesModal');
const btnCloseRulesModal = document.getElementById('btnCloseRulesModal');
const btnCloseRulesFooter = document.getElementById('btnCloseRulesFooter');
const btnCopyRules = document.getElementById('btnCopyRules');
const rulesCodeText = document.getElementById('rulesCodeText');

// Stats DOM Elements
const totalSchoolsCount = document.getElementById('totalSchoolsCount');
const grandTotalPoints = document.getElementById('grandTotalPoints');
const topLeaderSchool = document.getElementById('topLeaderSchool');
const footerSchoolCount = document.getElementById('footerSchoolCount');

// Totals Footer Elements
const sumLikesEl = document.getElementById('sumLikes');
const sumCommentsEl = document.getElementById('sumComments');
const sumSharesEl = document.getElementById('sumShares');
const sumWhatsappEl = document.getElementById('sumWhatsapp');
const sumTotalEl = document.getElementById('sumTotal');

// Podium Elements
const podium1Name = document.getElementById('podium1Name');
const podium1Score = document.getElementById('podium1Score');
const podium1Detail = document.getElementById('podium1Detail');

const podium2Name = document.getElementById('podium2Name');
const podium2Score = document.getElementById('podium2Score');
const podium2Detail = document.getElementById('podium2Detail');

const podium3Name = document.getElementById('podium3Name');
const podium3Score = document.getElementById('podium3Score');
const podium3Detail = document.getElementById('podium3Detail');

// Weights Modal Elements
const weightsModal = document.getElementById('weightsModal');
const btnWeightsModal = document.getElementById('btnWeightsModal');
const btnEditMultipliersLink = document.getElementById('btnEditMultipliersLink');
const btnCloseWeights = document.getElementById('btnCloseWeights');
const btnCancelWeights = document.getElementById('btnCancelWeights');
const btnSaveWeights = document.getElementById('btnSaveWeights');
const inpWeightLikes = document.getElementById('inpWeightLikes');
const inpWeightComments = document.getElementById('inpWeightComments');
const inpWeightShares = document.getElementById('inpWeightShares');
const inpWeightWhatsapp = document.getElementById('inpWeightWhatsapp');
const presetCompetition = document.getElementById('presetCompetition');
const presetEqual = document.getElementById('presetEqual');

// Multiplier Label Elements
const lblWeightLikes = document.getElementById('lblWeightLikes');
const lblWeightComments = document.getElementById('lblWeightComments');
const lblWeightShares = document.getElementById('lblWeightShares');
const lblWeightWhatsapp = document.getElementById('lblWeightWhatsapp');

// Chart elements & instance
const chartCanvas = document.getElementById('schoolsChart');
let chartInstance = null;
const btnChartGrouped = document.getElementById('btnChartGrouped');
const btnChartStacked = document.getElementById('btnChartStacked');
const btnChartTotals = document.getElementById('btnChartTotals');

// Storage keys
const STORAGE_KEY_DATA = 'school_calc_data_v2';
const STORAGE_KEY_WEIGHTS = 'school_calc_weights_v2';

// Security Gate Access Passcode & Session Keys
const ACCESS_PASSCODE = '2008326';
const STORAGE_KEY_AUTH = 'competition_auth_session_v1';

// Passcode Gate Elements
const passcodeGateOverlay = document.getElementById('passcodeGateOverlay');
const passcodeCard = document.getElementById('passcodeCard');
const passcodeForm = document.getElementById('passcodeForm');
const inpPasscode = document.getElementById('inpPasscode');
const btnTogglePasscode = document.getElementById('btnTogglePasscode');
const passcodeErrorMsg = document.getElementById('passcodeErrorMsg');
const chkRemember3Days = document.getElementById('chkRemember3Days');
const btnLogoutLock = document.getElementById('btnLogoutLock');

/* ==========================================================================
   Security Gate Operations (Passcode: 2008326, 3-Day Remember)
   ========================================================================== */
function initPasscodeGate() {
  if (!passcodeGateOverlay) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.authenticated && session.expiresAt > Date.now()) {
        passcodeGateOverlay.classList.add('hidden');
        return;
      }
    }
  } catch (e) {
    console.warn('Auth check failed:', e);
  }

  passcodeGateOverlay.classList.remove('hidden');
  setTimeout(() => {
    if (inpPasscode) inpPasscode.focus();
  }, 120);
}

function handlePasscodeSubmit(e) {
  e.preventDefault();
  const entered = inpPasscode.value.trim();

  if (entered === ACCESS_PASSCODE) {
    if (passcodeErrorMsg) passcodeErrorMsg.classList.remove('show');
    passcodeCard.classList.remove('shake');
    passcodeCard.classList.add('unlocking');

    // 3 days in ms: 3 * 24 * 60 * 60 * 1000 = 259,200,000 ms
    const is3Days = chkRemember3Days ? chkRemember3Days.checked : true;
    const duration = is3Days ? (3 * 24 * 60 * 60 * 1000) : (4 * 60 * 60 * 1000);
    const session = {
      authenticated: true,
      expiresAt: Date.now() + duration,
      remembered3Days: is3Days
    };

    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(session));

    setTimeout(() => {
      passcodeGateOverlay.classList.add('hidden');
      passcodeCard.classList.remove('unlocking');
      showToast(is3Days ? '🔓 Unlocked! This device is remembered for 3 days.' : '🔓 Unlocked! Active session started.', 'success');
    }, 380);
  } else {
    passcodeCard.classList.remove('shake');
    void passcodeCard.offsetWidth; // re-trigger animation
    passcodeCard.classList.add('shake');
    if (passcodeErrorMsg) {
      passcodeErrorMsg.textContent = '❌ Incorrect passcode! Enter 2008326 to access.';
      passcodeErrorMsg.classList.add('show');
    }
    inpPasscode.select();
  }
}

function handleLockLogout() {
  localStorage.removeItem(STORAGE_KEY_AUTH);
  if (passcodeGateOverlay) {
    passcodeGateOverlay.classList.remove('hidden');
    if (inpPasscode) {
      inpPasscode.value = '';
      inpPasscode.focus();
    }
    if (passcodeErrorMsg) passcodeErrorMsg.classList.remove('show');
    showToast('🔒 Calculator locked. Passcode required.', 'info');
  }
}

function togglePasscodeVisibility() {
  if (!inpPasscode) return;
  const isPass = inpPasscode.type === 'password';
  inpPasscode.type = isPass ? 'text' : 'password';
  btnTogglePasscode.innerHTML = isPass 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
}

const POPULAR_SCHOOLS = [
  "Ananda College",
  "Royal College",
  "Visakha Vidyalaya",
  "Musaeus College",
  "D.S. Senanayake College",
  "Mahanama College",
  "Devi Balika Vidyalaya",
  "Thurstan College",
  "Isipathana College",
  "St. Peter's College",
  "Trinity College",
  "Maliyadeva College"
];

/* ==========================================================================
   Initialization
   ========================================================================== */
function init() {
  initPasscodeGate();
  loadData();
  recalculateAll(false);
  renderTable();
  initChart();
  renderQuickChips();
  setupEventListeners();
  updateHistoryBadge();
}

function renderQuickChips() {
  if (!quickChipsContainer) return;
  quickChipsContainer.innerHTML = '';

  POPULAR_SCHOOLS.forEach(schoolName => {
    const isInTable = state.schools.some(s => s.name.toLowerCase() === schoolName.toLowerCase());
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `quick-chip ${isInTable ? 'is-in-table' : ''}`;
    chip.innerHTML = isInTable ? `✓ ${escapeHtml(schoolName)}` : `+ ${escapeHtml(schoolName)}`;
    chip.title = isInTable ? `${schoolName} is already in the table` : `Click to add ${schoolName}`;

    chip.addEventListener('click', () => {
      addSchoolByName(schoolName);
    });

    quickChipsContainer.appendChild(chip);
  });
}

function showCustomSuggestions(filterText = '') {
  if (!customSuggestionsDropdown) return;
  const query = filterText.trim().toLowerCase();

  const matches = SRI_LANKAN_SCHOOLS.filter(name => 
    !query || name.toLowerCase().includes(query)
  ).slice(0, 15);

  if (btnClearQuickSearch) {
    btnClearQuickSearch.style.display = filterText ? 'flex' : 'none';
  }

  if (matches.length === 0) {
    customSuggestionsDropdown.innerHTML = `
      <div class="no-suggestions-found">
        No schools found matching "<b>${escapeHtml(filterText)}</b>"
      </div>
    `;
    customSuggestionsDropdown.classList.add('open');
    return;
  }

  customSuggestionsDropdown.innerHTML = '';
  matches.forEach((schoolName, idx) => {
    const isInTable = state.schools.some(s => s.name.toLowerCase() === schoolName.toLowerCase());
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.dataset.index = idx;
    item.dataset.name = schoolName;

    // Highlight matching portion
    let highlightedName = escapeHtml(schoolName);
    if (query) {
      const reg = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedName = highlightedName.replace(reg, '<mark>$1</mark>');
    }

    item.innerHTML = `
      <div class="suggestion-left">
        <span class="suggestion-icon">🏫</span>
        <span class="suggestion-name">${highlightedName}</span>
      </div>
      ${isInTable ? '<span class="suggestion-status">In Table</span>' : ''}
    `;

    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      addSchoolByName(schoolName);
      hideCustomSuggestions();
    });

    customSuggestionsDropdown.appendChild(item);
  });

  customSuggestionsDropdown.classList.add('open');
}

function hideCustomSuggestions() {
  if (customSuggestionsDropdown) {
    customSuggestionsDropdown.classList.remove('open');
  }
}

/* ==========================================================================
   Data Persistence
   ========================================================================== */
function loadData() {
  try {
    const savedWeights = localStorage.getItem(STORAGE_KEY_WEIGHTS);
    if (savedWeights) {
      state.weights = JSON.parse(savedWeights);
    } else {
      state.weights = { ...DEFAULT_WEIGHTS };
    }
  } catch (e) {
    state.weights = { ...DEFAULT_WEIGHTS };
  }

  try {
    const savedData = localStorage.getItem(STORAGE_KEY_DATA) || localStorage.getItem('school_calc_data_v1');
    if (savedData) {
      state.schools = JSON.parse(savedData);
    } else {
      state.schools = JSON.parse(JSON.stringify(DEFAULT_SCHOOLS));
    }
  } catch (e) {
    state.schools = JSON.parse(JSON.stringify(DEFAULT_SCHOOLS));
  }

  updateMultiplierBanner();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(state.schools));
  localStorage.setItem(STORAGE_KEY_WEIGHTS, JSON.stringify(state.weights));
}

function updateMultiplierBanner() {
  if (lblWeightLikes) lblWeightLikes.textContent = `${state.weights.likes} pts`;
  if (lblWeightComments) lblWeightComments.textContent = `${state.weights.comments} pts`;
  if (lblWeightShares) lblWeightShares.textContent = `${state.weights.shares} pts`;
  if (lblWeightWhatsapp) lblWeightWhatsapp.textContent = `${state.weights.whatsapp} pts`;
}

/* ==========================================================================
   Calculations & Ranking Logic
   ========================================================================== */
function recalculateAll(triggerConfettiOnNewLeader = true) {
  // 1. Calculate each school's total points based on weights
  state.schools.forEach(school => {
    const likes = Number(school.likes) || 0;
    const comments = Number(school.comments) || 0;
    const shares = Number(school.shares) || 0;
    const whatsapp = Number(school.whatsapp) || 0;

    const total = 
      (likes * state.weights.likes) +
      (comments * state.weights.comments) +
      (shares * state.weights.shares) +
      (whatsapp * state.weights.whatsapp);

    school.total = Math.round(total * 100) / 100;
  });

  // 2. Compute rankings (dense / standard competition ranking)
  const sorted = [...state.schools].sort((a, b) => b.total - a.total);

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total < sorted[i - 1].total) {
      currentRank = i + 1;
    }
    const match = state.schools.find(s => s.id === sorted[i].id);
    if (match) {
      match.place = currentRank;
    }
  }

  // 3. Fire celebratory confetti when #1 changes
  if (sorted.length > 0 && sorted[0].total > 0) {
    const leader = sorted[0];
    if (state.lastLeaderId && state.lastLeaderId !== leader.id && triggerConfettiOnNewLeader) {
      fireCelebration();
      showToast(`🎉 New #1 Champion: ${leader.name || 'Unnamed School'}!`, 'success');
    }
    state.lastLeaderId = leader.id;
  }

  // 4. Update Summary Stats & Podium
  updateSummaryStats(sorted);
  saveData();
}

function formatRankBadge(rank) {
  if (rank === 1) return '<span class="rank-badge rank-1-badge">🥇 1st</span>';
  if (rank === 2) return '<span class="rank-badge rank-2-badge">🥈 2nd</span>';
  if (rank === 3) return '<span class="rank-badge rank-3-badge">🥉 3rd</span>';
  if (rank > 3) return `<span class="rank-badge rank-other-badge">#${rank}</span>`;
  return '<span class="rank-badge rank-other-badge">-</span>';
}

function updateSummaryStats(sorted) {
  const totalSchools = state.schools.length;
  totalSchoolsCount.textContent = totalSchools;
  footerSchoolCount.textContent = totalSchools;

  let grandSumLikes = 0;
  let grandSumComments = 0;
  let grandSumShares = 0;
  let grandSumWhatsapp = 0;
  let grandSumTotal = 0;

  state.schools.forEach(s => {
    grandSumLikes += Number(s.likes) || 0;
    grandSumComments += Number(s.comments) || 0;
    grandSumShares += Number(s.shares) || 0;
    grandSumWhatsapp += Number(s.whatsapp) || 0;
    grandSumTotal += Number(s.total) || 0;
  });

  // Footer totals showing both count and calculated marks
  sumLikesEl.innerHTML = `
    <div class="footer-sum-breakdown">
      <span>${grandSumLikes.toLocaleString()}</span>
      <span class="footer-pts-sub">${(grandSumLikes * state.weights.likes).toLocaleString()} pts</span>
    </div>
  `;
  sumCommentsEl.innerHTML = `
    <div class="footer-sum-breakdown">
      <span>${grandSumComments.toLocaleString()}</span>
      <span class="footer-pts-sub">${(grandSumComments * state.weights.comments).toLocaleString()} pts</span>
    </div>
  `;
  sumSharesEl.innerHTML = `
    <div class="footer-sum-breakdown">
      <span>${grandSumShares.toLocaleString()}</span>
      <span class="footer-pts-sub">${(grandSumShares * state.weights.shares).toLocaleString()} pts</span>
    </div>
  `;
  sumWhatsappEl.innerHTML = `
    <div class="footer-sum-breakdown">
      <span>${grandSumWhatsapp.toLocaleString()}</span>
      <span class="footer-pts-sub wa-pts">${(grandSumWhatsapp * state.weights.whatsapp).toLocaleString()} pts</span>
    </div>
  `;

  sumTotalEl.textContent = `${grandSumTotal.toLocaleString()} pts`;
  grandTotalPoints.textContent = grandSumTotal.toLocaleString();

  // Top Leader Stat
  if (sorted.length > 0 && sorted[0].total > 0) {
    topLeaderSchool.textContent = sorted[0].name || 'Unnamed';
    topLeaderSchool.title = sorted[0].name;
  } else {
    topLeaderSchool.textContent = '-';
  }

  // Update Podium Cards (1st, 2nd, 3rd)
  if (sorted[0] && sorted[0].total > 0) {
    podium1Name.textContent = sorted[0].name || 'School 1';
    podium1Score.textContent = `${sorted[0].total.toLocaleString()} pts`;
    const waPts = (sorted[0].whatsapp || 0) * state.weights.whatsapp;
    const igPts = (sorted[0].total || 0) - waPts;
    podium1Detail.textContent = `WA: ${waPts.toLocaleString()} pts | IG: ${igPts.toLocaleString()} pts`;
  } else {
    podium1Name.textContent = '-';
    podium1Score.textContent = '0 pts';
    podium1Detail.textContent = 'No data';
  }

  if (sorted[1] && sorted[1].total > 0) {
    podium2Name.textContent = sorted[1].name || 'School 2';
    podium2Score.textContent = `${sorted[1].total.toLocaleString()} pts`;
    const waPts = (sorted[1].whatsapp || 0) * state.weights.whatsapp;
    const igPts = (sorted[1].total || 0) - waPts;
    podium2Detail.textContent = `WA: ${waPts.toLocaleString()} pts | IG: ${igPts.toLocaleString()} pts`;
  } else {
    podium2Name.textContent = '-';
    podium2Score.textContent = '0 pts';
    podium2Detail.textContent = 'No data';
  }

  if (sorted[2] && sorted[2].total > 0) {
    podium3Name.textContent = sorted[2].name || 'School 3';
    podium3Score.textContent = `${sorted[2].total.toLocaleString()} pts`;
    const waPts = (sorted[2].whatsapp || 0) * state.weights.whatsapp;
    const igPts = (sorted[2].total || 0) - waPts;
    podium3Detail.textContent = `WA: ${waPts.toLocaleString()} pts | IG: ${igPts.toLocaleString()} pts`;
  } else {
    podium3Name.textContent = '-';
    podium3Score.textContent = '0 pts';
    podium3Detail.textContent = 'No data';
  }
}

/* ==========================================================================
   Table Rendering
   ========================================================================== */
function renderTable() {
  tableBody.innerHTML = '';

  const query = state.searchQuery.trim().toLowerCase();
  const visibleSchools = query
    ? state.schools.filter(s => (s.name || '').toLowerCase().includes(query))
    : state.schools;

  if (visibleSchools.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No schools found. Select a school above or click <b>"Add School Row"</b>.
        </td>
      </tr>
    `;
    return;
  }

  visibleSchools.forEach(school => {
    const tr = document.createElement('tr');
    tr.id = `row-${school.id}`;
    if (school.place === 1) tr.classList.add('row-rank-1');
    else if (school.place === 2) tr.classList.add('row-rank-2');
    else if (school.place === 3) tr.classList.add('row-rank-3');

    const likePts = (school.likes || 0) * state.weights.likes;
    const commentPts = (school.comments || 0) * state.weights.comments;
    const sharePts = (school.shares || 0) * state.weights.shares;
    const waPts = (school.whatsapp || 0) * state.weights.whatsapp;

    tr.innerHTML = `
      <td class="text-center col-place">
        ${formatRankBadge(school.place)}
      </td>
      <td class="col-school">
        <input 
          type="text" 
          class="input-school-name" 
          data-field="name" 
          data-id="${school.id}" 
          list="schoolListDatalist"
          value="${escapeHtml(school.name)}" 
          placeholder="Enter school name..." 
        />
      </td>
      <td class="col-metric">
        <div class="metric-cell-wrap">
          <input 
            type="number" 
            class="input-metric" 
            data-field="likes" 
            data-id="${school.id}" 
            value="${school.likes || 0}" 
            min="0" 
          />
          <span class="metric-calc-pts" id="pts-likes-${school.id}">
            ${likePts.toLocaleString()} pts
          </span>
        </div>
      </td>
      <td class="col-metric">
        <div class="metric-cell-wrap">
          <input 
            type="number" 
            class="input-metric" 
            data-field="comments" 
            data-id="${school.id}" 
            value="${school.comments || 0}" 
            min="0" 
          />
          <span class="metric-calc-pts" id="pts-comments-${school.id}">
            ${commentPts.toLocaleString()} pts
          </span>
        </div>
      </td>
      <td class="col-metric">
        <div class="metric-cell-wrap">
          <input 
            type="number" 
            class="input-metric" 
            data-field="shares" 
            data-id="${school.id}" 
            value="${school.shares || 0}" 
            min="0" 
          />
          <span class="metric-calc-pts" id="pts-shares-${school.id}">
            ${sharePts.toLocaleString()} pts
          </span>
        </div>
      </td>
      <td class="col-metric">
        <div class="metric-cell-wrap">
          <input 
            type="number" 
            class="input-metric wa-input" 
            data-field="whatsapp" 
            data-id="${school.id}" 
            value="${school.whatsapp || 0}" 
            min="0" 
          />
          <span class="metric-calc-pts wa-calc-pts" id="pts-whatsapp-${school.id}">
            ${waPts.toLocaleString()} pts
          </span>
        </div>
      </td>
      <td class="col-total">
        <div class="total-cell-wrap">
          <span class="cell-total-value ${school.place === 1 ? 'is-top' : ''}" id="total-val-${school.id}">
            ${school.total.toLocaleString()} pts
          </span>
        </div>
      </td>
      <td class="col-actions">
        <div class="row-actions">
          <button class="btn-icon-danger btn-delete-row" data-id="${school.id}" title="Remove row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ==========================================================================
   Row Operations (Add, Delete, Sort)
   ========================================================================== */
function addNewRow(autoFocus = true) {
  const newId = 'sch_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const newSchool = {
    id: newId,
    name: `School ${state.schools.length + 1}`,
    likes: 0,
    comments: 0,
    shares: 0,
    whatsapp: 0,
    total: 0,
    place: state.schools.length + 1
  };

  state.schools.push(newSchool);
  recalculateAll(false);
  renderTable();
  updateChart();

  if (autoFocus) {
    const inputEl = document.querySelector(`input[data-id="${newId}"][data-field="name"]`);
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }

  showToast('Added 1 school row', 'info');
}

function addSchoolByName(schoolName) {
  const name = schoolName.trim();
  if (!name) {
    showToast('Please type or select a school name first', 'info');
    return;
  }

  // Check if school already exists in table
  const existing = state.schools.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    const rowEl = document.getElementById(`row-${existing.id}`);
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      rowEl.classList.add('row-highlight-pulse');
      setTimeout(() => rowEl.classList.remove('row-highlight-pulse'), 2200);
      showToast(`"${name}" is already in the table (highlighted)`, 'info');
      quickSchoolInput.value = '';
      return;
    }
  }

  const newId = 'sch_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  state.schools.push({
    id: newId,
    name: name,
    likes: 0,
    comments: 0,
    shares: 0,
    whatsapp: 0,
    total: 0,
    place: state.schools.length + 1
  });

  recalculateAll(false);
  renderTable();
  updateChart();
  renderQuickChips();

  quickSchoolInput.value = '';
  showToast(`Added "${name}" to table!`, 'success');

  // Focus likes input for newly added school
  setTimeout(() => {
    const likeInput = document.querySelector(`input[data-id="${newId}"][data-field="likes"]`);
    if (likeInput) {
      likeInput.focus();
      likeInput.select();
    }
  }, 100);
}

function addMultipleRows(count = 5) {
  for (let i = 0; i < count; i++) {
    const newId = 'sch_' + Date.now() + '_' + i;
    state.schools.push({
      id: newId,
      name: `School ${state.schools.length + 1}`,
      likes: 0,
      comments: 0,
      shares: 0,
      whatsapp: 0,
      total: 0,
      place: state.schools.length + 1
    });
  }

  recalculateAll(false);
  renderTable();
  updateChart();
  renderQuickChips();
  showToast(`Added ${count} school rows`, 'info');
}

function deleteRow(schoolId) {
  state.schools = state.schools.filter(s => s.id !== schoolId);
  recalculateAll(false);
  renderTable();
  updateChart();
  renderQuickChips();
  showToast('School row removed', 'info');
}

function sortByRank() {
  state.schools.sort((a, b) => b.total - a.total);
  renderTable();
  updateChart();
  showToast('Leaderboard sorted by Rank!', 'success');
}

/* ==========================================================================
   Bulk School Picker Modal Logic
   ========================================================================== */
function openBulkPicker() {
  bulkSchoolModal.classList.add('open');
  bulkSearchInput.value = '';
  state.bulkSelectedSchools.clear();
  renderBulkChecklist();
}

function renderBulkChecklist(filterText = '') {
  schoolsChecklistContainer.innerHTML = '';
  const query = filterText.trim().toLowerCase();

  const filtered = SRI_LANKAN_SCHOOLS.filter(name => 
    !query || name.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    schoolsChecklistContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-muted);">
        No matching schools found for "${escapeHtml(filterText)}"
      </div>
    `;
    updateBulkCounter();
    return;
  }

  filtered.forEach(schoolName => {
    const isInTable = state.schools.some(s => s.name.toLowerCase() === schoolName.toLowerCase());
    const isChecked = state.bulkSelectedSchools.has(schoolName);

    const card = document.createElement('label');
    card.className = `school-check-card ${isChecked ? 'is-selected' : ''} ${isInTable ? 'already-added' : ''}`;

    card.innerHTML = `
      <input type="checkbox" value="${escapeHtml(schoolName)}" ${isChecked ? 'checked' : ''} />
      <span class="school-check-name" title="${escapeHtml(schoolName)}">${escapeHtml(schoolName)}</span>
      ${isInTable ? '<span class="school-added-badge">In Table</span>' : ''}
    `;

    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.bulkSelectedSchools.add(schoolName);
        card.classList.add('is-selected');
      } else {
        state.bulkSelectedSchools.delete(schoolName);
        card.classList.remove('is-selected');
      }
      updateBulkCounter();
    });

    schoolsChecklistContainer.appendChild(card);
  });

  updateBulkCounter();
}

function updateBulkCounter() {
  bulkSelectedCounter.textContent = `${state.bulkSelectedSchools.size} selected`;
}

function handleSelectAllBulk() {
  const query = bulkSearchInput.value.trim().toLowerCase();
  const visible = SRI_LANKAN_SCHOOLS.filter(name => !query || name.toLowerCase().includes(query));
  visible.forEach(name => state.bulkSelectedSchools.add(name));
  renderBulkChecklist(bulkSearchInput.value);
}

function handleDeselectAllBulk() {
  state.bulkSelectedSchools.clear();
  renderBulkChecklist(bulkSearchInput.value);
}

function handleConfirmBulkAdd() {
  if (state.bulkSelectedSchools.size === 0) {
    showToast('No schools selected', 'info');
    return;
  }

  let addedCount = 0;
  state.bulkSelectedSchools.forEach(name => {
    const newId = 'sch_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    state.schools.push({
      id: newId,
      name: name,
      likes: 0,
      comments: 0,
      shares: 0,
      whatsapp: 0,
      total: 0,
      place: state.schools.length + 1
    });
    addedCount++;
  });

  recalculateAll(false);
  renderTable();
  updateChart();
  renderQuickChips();
  bulkSchoolModal.classList.remove('open');
  showToast(`Added ${addedCount} schools to the table!`, 'success');
}

function handleAddAll71Schools() {
  const existingNames = new Set(state.schools.map(s => s.name.toLowerCase()));
  const missing = SRI_LANKAN_SCHOOLS.filter(name => !existingNames.has(name.toLowerCase()));

  if (missing.length === 0) {
    showToast('All 71 Sri Lankan schools are already in the table!', 'info');
    return;
  }

  if (confirm(`Add all ${missing.length} missing schools from the 71 schools directory into the table?`)) {
    missing.forEach(name => {
      const newId = 'sch_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      state.schools.push({
        id: newId,
        name: name,
        likes: 0,
        comments: 0,
        shares: 0,
        whatsapp: 0,
        total: 0,
        place: state.schools.length + 1
      });
    });

    recalculateAll(false);
    renderTable();
    updateChart();
    renderQuickChips();
    showToast(`Loaded all ${missing.length} schools into table!`, 'success');
  }
}

/* ==========================================================================
   Cloud History Operations (Save, Load, Restore, Delete)
   ========================================================================== */
function openSaveModal() {
  const sorted = [...state.schools].sort((a, b) => b.total - a.total);
  const now = new Date();
  
  inpSaveTitle.value = `Round ${now.toLocaleDateString()} - Stage 1`;
  previewSaveDate.textContent = now.toLocaleString();
  previewSaveSchools.textContent = `${state.schools.length} Schools`;
  previewSaveLeader.textContent = (sorted[0] && sorted[0].total > 0) ? `${sorted[0].name} (${sorted[0].total.toLocaleString()} pts)` : 'None';

  let grandTotal = 0;
  state.schools.forEach(s => grandTotal += (s.total || 0));
  previewSaveTotal.textContent = `${grandTotal.toLocaleString()} pts`;

  saveModal.classList.add('open');
}

async function handleConfirmSave() {
  btnConfirmSave.disabled = true;
  btnConfirmSave.innerHTML = `<span>Saving...</span>`;

  const sorted = [...state.schools].sort((a, b) => b.total - a.total);
  let grandTotal = 0;
  state.schools.forEach(s => grandTotal += (s.total || 0));

  const historyRecord = {
    title: inpSaveTitle.value.trim() || `Competition Round - ${new Date().toLocaleDateString()}`,
    weights: { ...state.weights },
    schools: JSON.parse(JSON.stringify(state.schools)),
    grandTotal: grandTotal,
    winner: sorted[0] ? { name: sorted[0].name, score: sorted[0].total } : { name: '-', score: 0 }
  };

  const res = await saveCalculationHistory(historyRecord);
  btnConfirmSave.disabled = false;
  btnConfirmSave.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
    <span>Save to Firebase</span>
  `;

  saveModal.classList.remove('open');

  if (res.source === 'firestore') {
    showToast(`☁️ Saved to Firebase Cloud successfully!`, 'success');
  } else {
    showToast(`💾 Saved locally (${res.warning || 'Check Rules'})`, 'info');
  }

  updateHistoryBadge();
}

async function openHistoryModal() {
  historyModal.classList.add('open');
  await renderHistoryList();
}

async function renderHistoryList() {
  historyListContainer.innerHTML = `<div class="history-loading">Fetching saved history records...</div>`;

  const res = await fetchCalculationHistory();
  const list = res.data || [];
  state.cachedHistory = list;
  updateHistoryBadge(list.length);

  if (list.length === 0) {
    historyListContainer.innerHTML = `
      <div class="history-loading">
        No saved competition records found.<br/>
        Click <b>"Save to History (Cloud)"</b> anytime to store competition rounds.
      </div>
    `;
    return;
  }

  historyListContainer.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.id = `history-card-${item.id}`;

    const dateStr = item.localDate || (item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent');
    const winnerName = item.winner?.name || 'School';
    const winnerScore = item.winner?.score || 0;

    card.innerHTML = `
      <div class="history-card-left">
        <div class="history-title-line">
          <span class="history-title">${escapeHtml(item.title)}</span>
          <span class="history-date-badge">📅 ${dateStr}</span>
        </div>
        <div class="history-winner-pill">
          🏆 1st Winner: ${escapeHtml(winnerName)} (${winnerScore.toLocaleString()} pts)
        </div>
        <div class="history-stats-pill">
          <span>🏫 ${item.totalSchools || item.schools?.length || 0} Schools</span>
          <span>•</span>
          <span>⚡ Total: ${(item.grandTotal || 0).toLocaleString()} pts</span>
          <span>•</span>
          <span>Like: ${item.weights?.likes || 15}p | Comm: ${item.weights?.comments || 10}p | Share: ${item.weights?.shares || 10}p | WA: ${item.weights?.whatsapp || 25}p</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-load-history" data-id="${item.id}" title="Restore and open this table in calculator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          <span>Open Table</span>
        </button>
        <button class="btn-pdf-history" data-id="${item.id}" title="Download PDF of this historical session">
          <span>PDF</span>
        </button>
        <button class="btn-icon-danger btn-delete-history" data-id="${item.id}" title="Delete record from history">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;

    historyListContainer.appendChild(card);
  });
}

function restoreHistoricalSession(historyId) {
  const item = state.cachedHistory.find(h => h.id === historyId);
  if (!item || !item.schools) {
    showToast('Record data not found', 'info');
    return;
  }

  if (confirm(`Open and restore "${item.title}" into the calculator? Active table will be replaced.`)) {
    state.schools = JSON.parse(JSON.stringify(item.schools));
    if (item.weights) {
      state.weights = { ...item.weights };
      updateMultiplierBanner();
    }
    recalculateAll(false);
    renderTable();
    updateChart();
    renderQuickChips();
    historyModal.classList.remove('open');
    showToast(`Restored: ${item.title}!`, 'success');
  }
}

async function removeHistoricalSession(historyId) {
  if (confirm('Delete this history record?')) {
    const card = document.getElementById(`history-card-${historyId}`);
    if (card) card.style.opacity = '0.4';

    await deleteCalculationHistory(historyId);
    state.cachedHistory = state.cachedHistory.filter(h => h.id !== historyId);
    updateHistoryBadge(state.cachedHistory.length);
    if (card) card.remove();
    showToast('Record deleted from history', 'info');
  }
}

async function updateHistoryBadge(knownCount) {
  if (typeof knownCount === 'number') {
    historyCountBadge.textContent = knownCount;
    return;
  }
  try {
    const res = await fetchCalculationHistory();
    const count = res.data ? res.data.length : 0;
    historyCountBadge.textContent = count;
  } catch (e) {
    historyCountBadge.textContent = '0';
  }
}

/* ==========================================================================
   Event Listeners & Real-Time Input Sync
   ========================================================================== */
function setupEventListeners() {
  // Security Gate Listeners
  if (passcodeForm) passcodeForm.addEventListener('submit', handlePasscodeSubmit);
  if (btnTogglePasscode) btnTogglePasscode.addEventListener('click', togglePasscodeVisibility);
  if (btnLogoutLock) btnLogoutLock.addEventListener('click', handleLockLogout);

  // Quick Add School & Custom Autocomplete
  btnQuickAddSchool.addEventListener('click', () => {
    addSchoolByName(quickSchoolInput.value);
    hideCustomSuggestions();
  });

  quickSchoolInput.addEventListener('input', (e) => {
    showCustomSuggestions(e.target.value);
  });

  quickSchoolInput.addEventListener('focus', (e) => {
    showCustomSuggestions(e.target.value);
  });

  let activeNavIndex = -1;
  quickSchoolInput.addEventListener('keydown', (e) => {
    const items = customSuggestionsDropdown.querySelectorAll('.suggestion-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!customSuggestionsDropdown.classList.contains('open')) {
        showCustomSuggestions(quickSchoolInput.value);
        return;
      }
      activeNavIndex = (activeNavIndex + 1) % items.length;
      items.forEach((item, idx) => {
        item.classList.toggle('active-nav', idx === activeNavIndex);
      });
      if (items[activeNavIndex]) {
        items[activeNavIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!customSuggestionsDropdown.classList.contains('open')) return;
      activeNavIndex = (activeNavIndex - 1 + items.length) % items.length;
      items.forEach((item, idx) => {
        item.classList.toggle('active-nav', idx === activeNavIndex);
      });
      if (items[activeNavIndex]) {
        items[activeNavIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeNavIndex >= 0 && items[activeNavIndex]) {
        addSchoolByName(items[activeNavIndex].dataset.name);
      } else {
        addSchoolByName(quickSchoolInput.value);
      }
      hideCustomSuggestions();
      activeNavIndex = -1;
    } else if (e.key === 'Escape') {
      hideCustomSuggestions();
      activeNavIndex = -1;
    }
  });

  if (btnClearQuickSearch) {
    btnClearQuickSearch.addEventListener('click', () => {
      quickSchoolInput.value = '';
      btnClearQuickSearch.style.display = 'none';
      hideCustomSuggestions();
      quickSchoolInput.focus();
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (customSearchContainer && !customSearchContainer.contains(e.target)) {
      hideCustomSuggestions();
      activeNavIndex = -1;
    }
  });

  btnOpenBulkPicker.addEventListener('click', openBulkPicker);
  btnCloseBulkSchoolModal.addEventListener('click', () => bulkSchoolModal.classList.remove('open'));
  btnCancelBulkPicker.addEventListener('click', () => bulkSchoolModal.classList.remove('open'));
  btnConfirmBulkAdd.addEventListener('click', handleConfirmBulkAdd);
  btnSelectAllSchools.addEventListener('click', handleSelectAllBulk);
  btnDeselectAllSchools.addEventListener('click', handleDeseAllBulk => handleDeselectAllBulk());
  btnAddAll71Schools.addEventListener('click', handleAddAll71Schools);

  bulkSearchInput.addEventListener('input', (e) => {
    renderBulkChecklist(e.target.value);
  });

  // Add Row Buttons
  btnAddRow.addEventListener('click', () => addNewRow(true));
  btnAddRowBottom.addEventListener('click', () => addNewRow(true));
  btnAdd5Rows.addEventListener('click', () => addMultipleRows(5));

  // Sort by Rank
  btnSortRanks.addEventListener('click', sortByRank);

  // Search filter
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTable();
  });

  // Table Event Delegation for real-time input & delete
  tableBody.addEventListener('input', (e) => {
    const target = e.target;
    const schoolId = target.dataset.id;
    const field = target.dataset.field;

    if (!schoolId || !field) return;

    const school = state.schools.find(s => s.id === schoolId);
    if (!school) return;

    if (field === 'name') {
      school.name = target.value;
      updatePodiumNames();
      updateChartLabels();
    } else {
      school[field] = Math.max(0, parseFloat(target.value) || 0);
      recalculateAll(true);
      
      // Update cell pts badge immediately
      const ptsBadge = document.getElementById(`pts-${field}-${schoolId}`);
      if (ptsBadge) {
        const fieldPts = (school[field] || 0) * (state.weights[field] || 1);
        ptsBadge.textContent = `${fieldPts.toLocaleString()} pts`;
      }

      // Update this row's total display dynamically
      const totalCell = document.getElementById(`total-val-${schoolId}`);
      if (totalCell) {
        totalCell.textContent = `${school.total.toLocaleString()} pts`;
        if (school.place === 1) totalCell.classList.add('is-top');
        else totalCell.classList.remove('is-top');
      }

      // Fast update of badges & chart
      updateRowRankBadges();
      updateChart();
    }
  });

  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete-row');
    if (btn) {
      const id = btn.dataset.id;
      deleteRow(id);
    }
  });

  // Cloud & History Buttons
  btnSaveCloud.addEventListener('click', openSaveModal);
  btnCloseSaveModal.addEventListener('click', () => saveModal.classList.remove('open'));
  btnCancelSave.addEventListener('click', () => saveModal.classList.remove('open'));
  btnConfirmSave.addEventListener('click', handleConfirmSave);

  btnViewHistory.addEventListener('click', openHistoryModal);
  btnCloseHistoryModal.addEventListener('click', () => historyModal.classList.remove('open'));
  btnCloseHistoryFooter.addEventListener('click', () => historyModal.classList.remove('open'));
  btnRefreshHistory.addEventListener('click', renderHistoryList);

  // History Card delegation (Open Table, PDF, Delete)
  historyListContainer.addEventListener('click', (e) => {
    const loadBtn = e.target.closest('.btn-load-history');
    if (loadBtn) {
      restoreHistoricalSession(loadBtn.dataset.id);
      return;
    }
    const pdfBtn = e.target.closest('.btn-pdf-history');
    if (pdfBtn) {
      const item = state.cachedHistory.find(h => h.id === pdfBtn.dataset.id);
      if (item && item.schools) {
        generatePDFDocument(item.schools, item.weights || state.weights, item.title);
      }
      return;
    }
    const delBtn = e.target.closest('.btn-delete-history');
    if (delBtn) {
      removeHistoricalSession(delBtn.dataset.id);
    }
  });

  // Rules Modal
  btnOpenRulesModal.addEventListener('click', () => rulesModal.classList.add('open'));
  btnCloseRulesModal.addEventListener('click', () => rulesModal.classList.remove('open'));
  btnCloseRulesFooter.addEventListener('click', () => rulesModal.classList.remove('open'));

  btnCopyRules.addEventListener('click', () => {
    const text = rulesCodeText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btnCopyRules.textContent = 'Copied! ✓';
      setTimeout(() => btnCopyRules.textContent = 'Copy Code', 2000);
      showToast('Firestore rules copied to clipboard!', 'success');
    });
  });

  // Weights Modal
  const openWeightsModal = () => {
    inpWeightLikes.value = state.weights.likes;
    inpWeightComments.value = state.weights.comments;
    inpWeightShares.value = state.weights.shares;
    inpWeightWhatsapp.value = state.weights.whatsapp;
    weightsModal.classList.add('open');
  };

  btnWeightsModal.addEventListener('click', openWeightsModal);
  btnEditMultipliersLink.addEventListener('click', openWeightsModal);

  const closeWeightsModal = () => weightsModal.classList.remove('open');
  btnCloseWeights.addEventListener('click', closeWeightsModal);
  btnCancelWeights.addEventListener('click', closeWeightsModal);

  if (presetCompetition) {
    presetCompetition.addEventListener('click', () => {
      inpWeightLikes.value = 15;
      inpWeightComments.value = 10;
      inpWeightShares.value = 10;
      inpWeightWhatsapp.value = 25;
    });
  }

  presetEqual.addEventListener('click', () => {
    inpWeightLikes.value = 1;
    inpWeightComments.value = 1;
    inpWeightShares.value = 1;
    inpWeightWhatsapp.value = 1;
  });

  btnSaveWeights.addEventListener('click', () => {
    state.weights.likes = Math.max(0, parseFloat(inpWeightLikes.value) || 15);
    state.weights.comments = Math.max(0, parseFloat(inpWeightComments.value) || 10);
    state.weights.shares = Math.max(0, parseFloat(inpWeightShares.value) || 10);
    state.weights.whatsapp = Math.max(0, parseFloat(inpWeightWhatsapp.value) || 25);

    updateMultiplierBanner();
    recalculateAll(false);
    renderTable();
    updateChart();
    closeWeightsModal();
    showToast('Point Values updated and applied!', 'success');
  });

  // Reset & Clear
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset table data to default sample schools with 15/10/10/25 scoring?')) {
      state.schools = JSON.parse(JSON.stringify(DEFAULT_SCHOOLS));
      state.weights = { ...DEFAULT_WEIGHTS };
      updateMultiplierBanner();
      recalculateAll(false);
      renderTable();
      updateChart();
      renderQuickChips();
      showToast('Reset to default sample data', 'info');
    }
  });

  btnClearAll.addEventListener('click', () => {
    if (confirm('Clear all school rows? This cannot be undone.')) {
      state.schools = [];
      recalculateAll(false);
      renderTable();
      updateChart();
      renderQuickChips();
      showToast('All rows cleared', 'info');
    }
  });

  // Export CSV
  btnExportCSV.addEventListener('click', exportToCSV);

  // Export PDF (current active table)
  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', () => {
      generatePDFDocument(state.schools, state.weights, "Official Leaderboard Results");
    });
  }

  // Chart Type Toggle Buttons
  btnChartGrouped.addEventListener('click', () => switchChartType('bar-grouped'));
  btnChartStacked.addEventListener('click', () => switchChartType('bar-stacked'));
  btnChartTotals.addEventListener('click', () => switchChartType('bar-totals'));
}

function updatePodiumNames() {
  const sorted = [...state.schools].sort((a, b) => b.total - a.total);
  if (sorted[0]) podium1Name.textContent = sorted[0].name;
  if (sorted[1]) podium2Name.textContent = sorted[1].name;
  if (sorted[2]) podium3Name.textContent = sorted[2].name;
  if (sorted[0]) topLeaderSchool.textContent = sorted[0].name;
}

function updateRowRankBadges() {
  state.schools.forEach(school => {
    const row = document.getElementById(`row-${school.id}`);
    if (row) {
      const placeCell = row.querySelector('.col-place');
      if (placeCell) {
        placeCell.innerHTML = formatRankBadge(school.place);
      }
      row.className = '';
      if (school.place === 1) row.classList.add('row-rank-1');
      else if (school.place === 2) row.classList.add('row-rank-2');
      else if (school.place === 3) row.classList.add('row-rank-3');
    }
  });
}

/* ==========================================================================
   Chart.js Visualization
   ========================================================================== */
function initChart() {
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');

  const config = getChartConfig();
  chartInstance = new Chart(ctx, config);
}

function switchChartType(type) {
  state.chartType = type;
  [btnChartGrouped, btnChartStacked, btnChartTotals].forEach(btn => btn.classList.remove('active'));

  if (type === 'bar-grouped') btnChartGrouped.classList.add('active');
  if (type === 'bar-stacked') btnChartStacked.classList.add('active');
  if (type === 'bar-totals') btnChartTotals.classList.add('active');

  if (chartInstance) {
    chartInstance.destroy();
    initChart();
  }
}

function getChartConfig() {
  const labels = state.schools.map(s => s.name || 'Unnamed');

  let datasets = [];

  if (state.chartType === 'bar-totals') {
    datasets = [
      {
        label: 'Total Competition Points',
        data: state.schools.map(s => s.total),
        backgroundColor: state.schools.map(s => s.place === 1 ? '#f59e0b' : '#38bdf8'),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: state.schools.map(s => s.place === 1 ? '#fbbf24' : '#0ea5e9')
      }
    ];
  } else {
    const isStacked = state.chartType === 'bar-stacked';
    datasets = [
      {
        label: `IG Likes (${state.weights.likes} pts)`,
        data: state.schools.map(s => (s.likes || 0) * (isStacked ? state.weights.likes : 1)),
        backgroundColor: '#e1306c',
        borderRadius: 6,
        stack: isStacked ? 'engagement' : undefined
      },
      {
        label: `IG Comments (${state.weights.comments} pts)`,
        data: state.schools.map(s => (s.comments || 0) * (isStacked ? state.weights.comments : 1)),
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
        stack: isStacked ? 'engagement' : undefined
      },
      {
        label: `IG Shares (${state.weights.shares} pts)`,
        data: state.schools.map(s => (s.shares || 0) * (isStacked ? state.weights.shares : 1)),
        backgroundColor: '#ec4899',
        borderRadius: 6,
        stack: isStacked ? 'engagement' : undefined
      },
      {
        label: `WhatsApp Votes (${state.weights.whatsapp} pts)`,
        data: state.schools.map(s => (s.whatsapp || 0) * (isStacked ? state.weights.whatsapp : 1)),
        backgroundColor: '#25d366',
        borderRadius: 6,
        stack: isStacked ? 'engagement' : undefined
      }
    ];
  }

  return {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 20, 35, 0.95)',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const val = context.parsed.y !== null ? context.parsed.y : context.parsed.x;
              return ` ${label}: ${Number(val).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 11 },
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  };
}

function updateChart() {
  if (!chartInstance) return;
  const labels = state.schools.map(s => s.name || 'Unnamed');
  chartInstance.data.labels = labels;

  if (state.chartType === 'bar-totals') {
    chartInstance.data.datasets[0].data = state.schools.map(s => s.total);
    chartInstance.data.datasets[0].backgroundColor = state.schools.map(s => s.place === 1 ? '#f59e0b' : '#38bdf8');
  } else {
    const isStacked = state.chartType === 'bar-stacked';
    chartInstance.data.datasets[0].data = state.schools.map(s => (s.likes || 0) * (isStacked ? state.weights.likes : 1));
    chartInstance.data.datasets[1].data = state.schools.map(s => (s.comments || 0) * (isStacked ? state.weights.comments : 1));
    chartInstance.data.datasets[2].data = state.schools.map(s => (s.shares || 0) * (isStacked ? state.weights.shares : 1));
    chartInstance.data.datasets[3].data = state.schools.map(s => (s.whatsapp || 0) * (isStacked ? state.weights.whatsapp : 1));
  }

  chartInstance.update();
}

function updateChartLabels() {
  if (!chartInstance) return;
  chartInstance.data.labels = state.schools.map(s => s.name || 'Unnamed');
  chartInstance.update('none');
}

/* ==========================================================================
   Official PDF Document Generator
   ========================================================================== */
function generatePDFDocument(schoolsList, weightsObj, customTitle = "School Competition Leaderboard") {
  if (!schoolsList || schoolsList.length === 0) {
    showToast('No school data to export', 'info');
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF generator is initializing, please click again in a second...', 'info');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const sorted = [...schoolsList].sort((a, b) => (b.total || 0) - (a.total || 0));
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // 1. Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${customTitle.toUpperCase()}`, 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Official Results Report • Generated: ${dateStr}`, 14, 19);

    // 2. Point Multipliers Card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 30, 269, 13, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text("POINT VALUES:", 18, 38.5);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `1 Like = ${weightsObj.likes} pts   |   1 Comment = ${weightsObj.comments} pts   |   1 Share = ${weightsObj.shares} pts   |   1 WhatsApp Vote = ${weightsObj.whatsapp} pts`,
      55, 38.5
    );

    // 3. Prepare Table Data with count and marks
    const tableData = sorted.map((s, idx) => {
      const likePts = (s.likes || 0) * weightsObj.likes;
      const commPts = (s.comments || 0) * weightsObj.comments;
      const sharePts = (s.shares || 0) * weightsObj.shares;
      const waPts = (s.whatsapp || 0) * weightsObj.whatsapp;

      let placeText = `#${s.place || (idx + 1)}`;
      if (s.place === 1 || idx === 0) placeText = '1st [WINNER]';
      else if (s.place === 2 || idx === 1) placeText = '2nd Place';
      else if (s.place === 3 || idx === 2) placeText = '3rd Place';

      return [
        placeText,
        s.name || 'Unnamed School',
        `${(s.likes || 0).toLocaleString()}\n(${likePts.toLocaleString()} pts)`,
        `${(s.comments || 0).toLocaleString()}\n(${commPts.toLocaleString()} pts)`,
        `${(s.shares || 0).toLocaleString()}\n(${sharePts.toLocaleString()} pts)`,
        `${(s.whatsapp || 0).toLocaleString()}\n(${waPts.toLocaleString()} pts)`,
        `${(s.total || 0).toLocaleString()} PTS`
      ];
    });

    // Grand Totals Row
    let totalLikes = 0, totalComments = 0, totalShares = 0, totalWa = 0, grandTotal = 0;
    schoolsList.forEach(s => {
      totalLikes += (s.likes || 0);
      totalComments += (s.comments || 0);
      totalShares += (s.shares || 0);
      totalWa += (s.whatsapp || 0);
      grandTotal += (s.total || 0);
    });

    tableData.push([
      'TOTAL',
      `Grand Summary (${schoolsList.length} Schools)`,
      `${totalLikes.toLocaleString()}\n(${(totalLikes * weightsObj.likes).toLocaleString()} pts)`,
      `${totalComments.toLocaleString()}\n(${(totalComments * weightsObj.comments).toLocaleString()} pts)`,
      `${totalShares.toLocaleString()}\n(${(totalShares * weightsObj.shares).toLocaleString()} pts)`,
      `${totalWa.toLocaleString()}\n(${(totalWa * weightsObj.whatsapp).toLocaleString()} pts)`,
      `${grandTotal.toLocaleString()} PTS`
    ]);

    // 4. Render Table with AutoTable
    doc.autoTable({
      startY: 47,
      head: [[
        'Place',
        'School Name',
        `Instagram Likes\n(×${weightsObj.likes} pts)`,
        `Instagram Comments\n(×${weightsObj.comments} pts)`,
        `Instagram Shares\n(×${weightsObj.shares} pts)`,
        `WhatsApp Votes\n(×${weightsObj.whatsapp} pts)`,
        'Total Points\n(මුළු එකතුව)'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 26, valign: 'middle' },
        1: { fontStyle: 'bold', cellWidth: 64, valign: 'middle' },
        2: { halign: 'right', cellWidth: 38, valign: 'middle' },
        3: { halign: 'right', cellWidth: 38, valign: 'middle' },
        4: { halign: 'right', cellWidth: 38, valign: 'middle' },
        5: { halign: 'right', cellWidth: 38, fontStyle: 'bold', textColor: [16, 128, 67], valign: 'middle' },
        6: { halign: 'right', cellWidth: 27, fontStyle: 'bold', textColor: [2, 132, 199], fillColor: [240, 249, 255], valign: 'middle' }
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didParseCell: function(data) {
        // Highlight 1st place row
        if (data.row.index === 0 && data.section === 'body') {
          data.cell.styles.fillColor = [254, 243, 199];
          if (data.column.index === 0) {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Highlight footer totals row
        if (data.row.index === tableData.length - 1 && data.section === 'body') {
          data.cell.styles.fillColor = [226, 232, 240];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [15, 23, 42];
        }
      }
    });

    const safeTitle = customTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const today = new Date().toISOString().slice(0, 10);
    doc.save(`${safeTitle}_${today}.pdf`);
    showToast('📄 PDF Report downloaded successfully!', 'success');
  } catch (err) {
    console.error('PDF export error:', err);
    showToast('Error generating PDF. Please try again.', 'info');
  }
}

/* ==========================================================================
   Export to CSV File
   ========================================================================== */
function exportToCSV() {
  if (state.schools.length === 0) {
    showToast('No data to export', 'info');
    return;
  }

  const sorted = [...state.schools].sort((a, b) => b.total - a.total);

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Place,School Name,Likes Count,Likes Points,Comments Count,Comments Points,Shares Count,Shares Points,WhatsApp Count,WhatsApp Points,Total Points\n";

  sorted.forEach(s => {
    const safeName = `"${(s.name || '').replace(/"/g, '""')}"`;
    const likePts = (s.likes || 0) * state.weights.likes;
    const commPts = (s.comments || 0) * state.weights.comments;
    const sharePts = (s.shares || 0) * state.weights.shares;
    const waPts = (s.whatsapp || 0) * state.weights.whatsapp;

    csvContent += `${s.place},${safeName},${s.likes || 0},${likePts},${s.comments || 0},${commPts},${s.shares || 0},${sharePts},${s.whatsapp || 0},${waPts},${s.total}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  const now = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `School_Voting_Results_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Results exported to CSV successfully!', 'success');
}

/* ==========================================================================
   Celebration & Toast Helpers
   ========================================================================== */
function fireCelebration() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Start application
init();
