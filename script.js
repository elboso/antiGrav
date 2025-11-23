// Configuration
const CONFIG = {
    initialCash: 1000,
    initialPrice: 100,
    volatility: 2.0, // Max random change per tick
    trend: -0.5,      // Bias: +0.2 means slight upward trend, -0.5 downward, etc.
    updateInterval: 500, // ms
    maxHistory: 50
};

// Game State
let state = {
    cash: CONFIG.initialCash,
    shares: 0,
    price: CONFIG.initialPrice,
    avgBuyPrice: 0,
    history: [],
    labels: []
};

// ... (DOM Elements skipped, they are fine)

// Helper Functions
function formatMoney(amount) {
    return '$' + amount.toFixed(2);
}

function triggerWinEffect() {
    document.body.classList.add('effect-win');
    setTimeout(() => document.body.classList.remove('effect-win'), 500);
}

function triggerLossEffect() {
    document.body.classList.add('effect-loss');
    setTimeout(() => document.body.classList.remove('effect-loss'), 500);
}

function updateUI() {
    elCash.textContent = formatMoney(state.cash);
    elShares.textContent = state.shares;
    elPrice.textContent = formatMoney(state.price);

    // Update Chart
    chart.data.labels = state.labels;
    chart.data.datasets[0].data = state.history;
    chart.update();

    // Update buttons state
    btnBuy.disabled = state.cash < state.price;
    btnSell.disabled = state.shares <= 0;

    // Opacity for disabled state
    btnBuy.style.opacity = btnBuy.disabled ? 0.5 : 1;
    btnSell.style.opacity = btnSell.disabled ? 0.5 : 1;
}

// ... (updatePrice and gameLoop skipped)

// Actions
btnBuy.addEventListener('click', () => {
    if (state.cash >= state.price) {
        // Update average buy price
        const totalValue = (state.shares * state.avgBuyPrice) + state.price;
        state.cash -= state.price;
        state.shares += 1;
        state.avgBuyPrice = totalValue / state.shares;

        updateUI();
    }
});

btnSell.addEventListener('click', () => {
    if (state.shares > 0) {
        const profit = state.price - state.avgBuyPrice;

        if (profit > 0) {
            triggerWinEffect();
        } else if (profit < 0) {
            triggerLossEffect();
        }

        state.cash += state.price;
        state.shares -= 1;

        // If no shares left, reset avg buy price
        if (state.shares === 0) {
            state.avgBuyPrice = 0;
        }

        updateUI();
    }
});

// Settings Logic
const modal = document.getElementById('settings-modal');
const btnSettings = document.getElementById('btn-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');

const inpInitialCash = document.getElementById('inp-initial-cash');
const inpVolatility = document.getElementById('inp-volatility');
const inpTrend = document.getElementById('inp-trend');
const inpInterval = document.getElementById('inp-interval');

let gameInterval;

function openSettings() {
    inpInitialCash.value = CONFIG.initialCash;
    inpVolatility.value = CONFIG.volatility;
    inpTrend.value = CONFIG.trend;
    inpInterval.value = CONFIG.updateInterval;
    modal.showModal();
}

function closeSettings() {
    modal.close();
}

function saveSettings() {
    CONFIG.initialCash = parseFloat(inpInitialCash.value);
    CONFIG.volatility = parseFloat(inpVolatility.value);
    CONFIG.trend = parseFloat(inpTrend.value);
    CONFIG.updateInterval = parseInt(inpInterval.value);

    closeSettings();
    resetGame();
}

function resetGame() {
    // Clear existing interval
    clearInterval(gameInterval);

    // Reset State
    state.cash = CONFIG.initialCash;
    state.shares = 0;
    state.price = CONFIG.initialPrice;
    state.history = [];
    state.labels = [];

    // Re-init history
    for (let i = 0; i < CONFIG.maxHistory; i++) {
        state.history.push(CONFIG.initialPrice);
        state.labels.push('');
    }

    // Update UI elements that might have changed from config
    elTrend.textContent = CONFIG.trend > 0 ? '+' + CONFIG.trend : CONFIG.trend;
    elVol.textContent = CONFIG.volatility;

    updateUI();

    // Restart Loop
    gameInterval = setInterval(gameLoop, CONFIG.updateInterval);
}

btnSettings.addEventListener('click', openSettings);
btnCloseSettings.addEventListener('click', closeSettings);
btnSaveSettings.addEventListener('click', saveSettings);

// Init
function init() {
    // Fill initial history
    for (let i = 0; i < CONFIG.maxHistory; i++) {
        state.history.push(CONFIG.initialPrice);
        state.labels.push('');
    }

    elTrend.textContent = CONFIG.trend > 0 ? '+' + CONFIG.trend : CONFIG.trend;
    elVol.textContent = CONFIG.volatility;

    updateUI();
    gameInterval = setInterval(gameLoop, CONFIG.updateInterval);
}

init();
