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
    history: [],
    labels: []
};

// DOM Elements
const elCash = document.getElementById('cash-display');
const elShares = document.getElementById('shares-display');
const elPrice = document.getElementById('price-display');
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
            tension: 0.4,
            pointRadius: 0,
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
                ticks: { color: 'rgba(255, 255, 255, 0.5)' }
            }
        },
        animation: { duration: 0 }
    }
});

// Helper Functions
function formatMoney(amount) {
    return '$' + amount.toFixed(2);
}

function updateUI() {
    elCash.textContent = formatMoney(state.cash);
    elShares.textContent = state.shares;
    elPrice.textContent = formatMoney(state.price);

    // Color code price based on change (simple check against last price)
    // For now just white/green/red logic could be added but let's keep it clean

    // Update Chart
    chart.data.labels = state.labels;
    chart.data.datasets[0].data = state.history;

    // Dynamic color based on trend of last few ticks could be cool, 
    // but let's stick to the main theme color for now.

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
    const randomChange = (Math.random() - 0.5) * 2 * CONFIG.volatility;
    const change = randomChange + CONFIG.trend;

    state.price += change;
    if (state.price < 0.01) state.price = 0.01; // Prevent negative price

    // Update History
    state.history.push(state.price);
    state.labels.push('');

    if (state.history.length > CONFIG.maxHistory) {
        state.history.shift();
        state.labels.shift();
    }
}

function gameLoop() {
    updatePrice();
    updateUI();
}

// Actions
btnBuy.addEventListener('click', () => {
    if (state.cash >= state.price) {
        state.cash -= state.price;
        state.shares += 1;
        updateUI();
    }
});

btnSell.addEventListener('click', () => {
    if (state.shares > 0) {
        state.cash += state.price;
        state.shares -= 1;
        updateUI();
    }
});

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
    setInterval(gameLoop, CONFIG.updateInterval);
}

init();
