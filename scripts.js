let weights = [];
let dates = [];
let weeklyRate = [];
let targetWeeklyRate = [];

const weightChartCanvas = document.getElementById('weight-chart').getContext('2d');
const rateChartCanvas = document.getElementById('rate-chart').getContext('2d');

const weightChart = new Chart(weightChartCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Weight (kg)',
            data: [],
            borderColor: '#00e5ff',
            backgroundColor: 'rgba(0, 229, 255, 0.2)',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 14
                    },
                    color: '#ffffff' // Updated to white text
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Date', color: '#ffffff', font: { size: 18 } }, // Updated to white
                ticks: { color: '#ffffff', font: { size: 14 } },
                grid: { color: '#444' }
            },
            y: {
                title: { display: true, text: 'Weight (kg)', color: '#ffffff', font: { size: 18 } }, // Updated to white
                ticks: { color: '#ffffff', font: { size: 14 } },
                grid: { color: '#444' }
            }
        }
    }
});

const rateChart = new Chart(rateChartCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Weekly Rate of Gain/Loss (%)',
                data: [],
                borderColor: '#ff4081',
                backgroundColor: 'rgba(255, 64, 129, 0.2)',
                borderWidth: 2,
                borderDash: [5, 5],
            },
            {
                label: 'Target Weekly Rate (%)',
                data: [],
                borderColor: '#ffea00',
                backgroundColor: 'rgba(255, 234, 0, 0.2)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 14
                    },
                    color: '#ffffff' // Updated to white text
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Date', color: '#ffffff', font: { size: 18 } }, // Updated to white
                ticks: { color: '#ffffff', font: { size: 14 } },
                grid: { color: '#444' }
            },
            y: {
                title: { display: true, text: 'Rate (%)', color: '#ffffff', font: { size: 18 } }, // Updated to white
                position: 'right',
                ticks: { color: '#ffffff', font: { size: 14 } },
                grid: { color: '#444' }
            }
        }
    }
});

const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

document.getElementById('toggle-add-entries').addEventListener('click', () => {
    const form = document.getElementById('add-entry-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('toggle-edit-entries').addEventListener('click', () => {
    const list = document.getElementById('weight-list');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
    renderWeightList();
});

document.getElementById('add-entry').addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('weight').value);
    const date = document.getElementById('date').value;
    const targetRate = parseFloat(document.getElementById('target-weekly-rate').value);

    if (!isNaN(weight) && date) {
        weights.push(weight);
        dates.push(date);
        targetWeeklyRate.push(targetRate || 0);

        weeklyRate = calculateWeeklyRate();
        updateCharts();
        resetForm();
    }
});

function calculateWeeklyRate() {
    let weeklyRates = [];
    for (let i = 1; i < weights.length; i++) {
        const weightDiff = weights[i] - weights[i - 1];
        const rate = (weightDiff / weights[i - 1]) * 100;
        weeklyRates.push(rate);
    }
    return weeklyRates;
}

function updateCharts() {
    const timeframe = document.getElementById('timeframe-select').value;
    const now = new Date();
    let filteredDates = dates.slice();
    let filteredWeights = weights.slice();
    let filteredRates = weeklyRate.slice();
    let filteredTargetRates = targetWeeklyRate.slice();

    if (timeframe !== 'all') {
        const cutoffDate = new Date();
        switch (timeframe) {
            case '1year':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            case '6months':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case '3months':
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
            case '1month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
        }

        filteredDates = dates.filter((date, i) => new Date(date) >= cutoffDate);
        filteredWeights = weights.slice(-filteredDates.length);
        filteredRates = weeklyRate.slice(-filteredDates.length);
        filteredTargetRates = targetWeeklyRate.slice(-filteredDates.length);
    }

    weightChart.data.labels = filteredDates;
    weightChart.data.datasets[0].data = filteredWeights;

    rateChart.data.labels = filteredDates;
    rateChart.data.datasets[0].data = filteredRates;
    rateChart.data.datasets[1].data = filteredTargetRates;

    weightChart.update();
    rateChart.update();
}

function resetForm() {
    document.getElementById('weight').value = '';
    document.getElementById('date').value = today;
    document.getElementById('target-weekly-rate').value = '';
}

function renderWeightList() {
    const list = document.getElementById('weight-list');
    list.innerHTML = '';

    dates.forEach((date, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${date}: ${weights[index]} kg
            <button onclick="removeEntry(${index})">Remove</button>
        `;
        list.appendChild(listItem);
    });
}

function removeEntry(index) {
    weights.splice(index, 1);
    dates.splice(index, 1);
    targetWeeklyRate.splice(index, 1);

    weeklyRate = calculateWeeklyRate();
    updateCharts();
    renderWeightList();
}

updateCharts();
