// Configuration
const CONFIG = {
    initialCash: 1000,
    initialPrice: 100,
    volatility: 5,
    trend: 0,
    updateInterval: 500,
    maxHistory: 50
};

// Game State
let state = {
    cash: CONFIG.initialCash,
    shares: 0,
    price: CONFIG.initialPrice,
    avgBuyPrice: 0,
    history: [],
    labels: [],
    pointBackgroundColors: [],
    pointRadii: []
};

// DOM Elements
const elCash = document.getElementById('cash-display');
const elShares = document.getElementById('shares-display');
const elPrice = document.getElementById('price-display');
const elFortune = document.getElementById('fortune-display');
const elTrend = document.getElementById('trend-display');
const elVol = document.getElementById('vol-display');
const btnBuy = document.getElementById('btn-buy');
const btnSell = document.getElementById('btn-sell');
const ctx = document.getElementById('marketChart').getContext('2d');

// Initialize Chart
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: state.labels,
        datasets: [{
            label: 'Market Price',
            data: state.history,
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderWidth: 2,
            tension: 0.1, // Low tension for stability
            pointRadius: state.pointRadii,
            pointBackgroundColor: state.pointBackgroundColors,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                beginAtZero: true,
                min: 0,
                max: 200,
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    stepSize: 20,
                    callback: function (value) {
                        return '$' + Math.floor(value);
                    }
                }
            }
        },
        animation: { duration: 0 }
    }
});

// Helper Functions
function formatMoney(amount) {
    return '$' + Math.floor(amount);
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

    // Fortune Calculation
    const fortune = state.cash + (state.shares * state.price);
    elFortune.textContent = formatMoney(fortune);

    if (fortune < CONFIG.initialCash) {
        elFortune.classList.add('text-red');
    } else {
        elFortune.classList.remove('text-red');
    }

    // Update Chart
    chart.data.labels = state.labels;
    chart.data.datasets[0].data = state.history;
    chart.data.datasets[0].pointBackgroundColor = state.pointBackgroundColors;
    chart.data.datasets[0].pointRadius = state.pointRadii;
    chart.update();

    // Update buttons state
    btnBuy.disabled = state.cash < state.price;
    btnSell.disabled = state.shares <= 0;

    // Opacity for disabled state
    btnBuy.style.opacity = btnBuy.disabled ? 0.5 : 1;
    btnSell.style.opacity = btnSell.disabled ? 0.5 : 1;
}

function updatePrice() {
    // Price Logic: Old Price + Random(-Vol, +Vol) + Trend
    const randomChange = Math.round((Math.random() - 0.5) * 2 * CONFIG.volatility);
    const change = randomChange + Math.round(CONFIG.trend);

    state.price += change;

    // Safety check: Ensure price is a valid number and at least 1
    if (isNaN(state.price) || state.price < 1) {
        state.price = 1;
    }

    // Update History
    state.history.push(state.price);
    state.labels.push('');

    // Default marker (none)
    state.pointBackgroundColors.push('transparent');
    state.pointRadii.push(0);

    if (state.history.length > CONFIG.maxHistory) {
        state.history.shift();
        state.labels.shift();
        state.pointBackgroundColors.shift();
        state.pointRadii.shift();
    }
}

function gameLoop() {
    updatePrice();
    updateUI();
}

// Actions
btnBuy.addEventListener('click', () => {
    if (state.cash >= state.price) {
        // Update average buy price
        const totalValue = (state.shares * state.avgBuyPrice) + state.price;
        state.cash -= state.price;
        state.shares += 1;
        state.avgBuyPrice = totalValue / state.shares;

        // Add Buy Marker (Green)
        const lastIndex = state.pointBackgroundColors.length - 1;
        state.pointBackgroundColors[lastIndex] = '#00ff88';
        state.pointRadii[lastIndex] = 6;

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

        // Add Sell Marker (Red)
        const lastIndex = state.pointBackgroundColors.length - 1;
        state.pointBackgroundColors[lastIndex] = '#ff0055';
        state.pointRadii[lastIndex] = 6;

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
    state.pointBackgroundColors = [];
    state.pointRadii = [];

    // Re-init history
    for (let i = 0; i < CONFIG.maxHistory; i++) {
        state.history.push(CONFIG.initialPrice);
        state.labels.push('');
        state.pointBackgroundColors.push('transparent');
        state.pointRadii.push(0);
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
        state.pointBackgroundColors.push('transparent');
        state.pointRadii.push(0);
    }

    elTrend.textContent = CONFIG.trend > 0 ? '+' + CONFIG.trend : CONFIG.trend;
    elVol.textContent = CONFIG.volatility;

    updateUI();
    gameInterval = setInterval(gameLoop, CONFIG.updateInterval);
}

init();
