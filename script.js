/* ========================
   GLOBAL VARIABLES
   ======================== */

let display = '0';
let previousValue = null;
let currentOperator = null;
let shouldResetDisplay = false;
let history = [];

// Exchange rates (INR base)
const exchangeRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.8
};

/* ========================
   INITIALIZATION
   ======================== */

document.addEventListener('DOMContentLoaded', function () {
    initializeCalculator();
    startLiveClock();
    startBackgroundSlideshow();
    applyMoodTheme();
    loadHistoryFromStorage();
    setupKeyboardSupport();
    setupMobileMenu();
});

/* ========================
   CALCULATOR FUNCTIONS
   ======================== */

function initializeCalculator() {
    const displayElement = document.getElementById('display');
    displayElement.textContent = display;
}

function updateDisplay(value) {
    display = value;
    document.getElementById('display').textContent = display;
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        display = number;
        shouldResetDisplay = false;
    } else {
        if (display === '0' && number !== '.') {
            display = number;
        } else if (number === '.' && display.includes('.')) {
            return;
        } else {
            display += number;
        }
    }
    updateDisplay(display);
}

function appendOperator(operator) {
    if (currentOperator !== null && !shouldResetDisplay) {
        calculate();
    }
    previousValue = parseFloat(display);
    currentOperator = operator;
    shouldResetDisplay = true;
}

function calculate() {
    if (currentOperator === null || shouldResetDisplay) {
        return;
    }

    let result = 0;
    const current = parseFloat(display);
    const previous = previousValue;

    switch (currentOperator) {
        case '+':
            result = previous + current;
            break;
        case '-':
            result = previous - current;
            break;
        case '*':
            result = previous * current;
            break;
        case '/':
            if (current === 0) {
                updateDisplay('Cannot divide by 0');
                currentOperator = null;
                shouldResetDisplay = true;
                return;
            }
            result = previous / current;
            break;
        case '%':
            result = previous % current;
            break;
        case '^':
            result = Math.pow(previous, current);
            break;
        default:
            return;
    }

    // Format result
    result = Math.round(result * 100000000) / 100000000;

    // Save to history
    addToHistory(`${previous} ${currentOperator} ${current} = ${result}`);

    // Update display
    updateDisplay(result.toString());
    previousValue = null;
    currentOperator = null;
    shouldResetDisplay = true;
}

function clearDisplay() {
    display = '0';
    previousValue = null;
    currentOperator = null;
    shouldResetDisplay = false;
    updateDisplay(display);
}

function deleteLastChar() {
    if (display.length > 1) {
        display = display.slice(0, -1);
    } else {
        display = '0';
    }
    updateDisplay(display);
}

/* ========================
   SCIENTIFIC FUNCTIONS
   ======================== */

function scientificFunction(func) {
    const value = parseFloat(display);
    let result = 0;

    switch (func) {
        case 'sqrt':
            if (value < 0) {
                updateDisplay('Cannot calculate √ of negative');
                return;
            }
            result = Math.sqrt(value);
            addToHistory(`√${value} = ${result}`);
            break;
        case 'square':
            result = value * value;
            addToHistory(`${value}² = ${result}`);
            break;
        case 'cube':
            result = value * value * value;
            addToHistory(`${value}³ = ${result}`);
            break;
        case 'reciprocal':
            if (value === 0) {
                updateDisplay('Cannot calculate 1/0');
                return;
            }
            result = 1 / value;
            addToHistory(`1/${value} = ${result}`);
            break;
        case 'pi':
            result = Math.PI;
            display = display === '0' ? result.toString() : display + result;
            updateDisplay(display);
            return;
    }

    result = Math.round(result * 100000000) / 100000000;
    updateDisplay(result.toString());
    shouldResetDisplay = true;
}

function toggleScientific() {
    const scientificButtons = document.getElementById('scientificButtons');
    const toggleBtn = document.querySelector('.scientific-toggle');

    scientificButtons.classList.toggle('hidden');
    toggleBtn.classList.toggle('active');
}

/* ========================
   HISTORY MANAGEMENT
   ======================== */

function addToHistory(calculation) {
    history.unshift(calculation);
    if (history.length > 20) {
        history.pop();
    }
    saveHistoryToStorage();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {

    const historyList = document.getElementById('historyList');
    const fullHistoryList = document.getElementById('fullHistoryList');

    if (history.length === 0) {

        if(historyList){
            historyList.innerHTML =
            '<p class="history-empty">No calculations yet</p>';
        }

        if(fullHistoryList){
            fullHistoryList.innerHTML =
            '<p class="history-empty">Your calculation history will appear here.</p>';
        }

        return;
    }

    const historyHTML = history.map(item =>
        `<div class="history-item">${item}</div>`
    ).join('');

    if(historyList){
        historyList.innerHTML = historyHTML;
    }

    if(fullHistoryList){
        fullHistoryList.innerHTML = historyHTML;
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        history = [];
        saveHistoryToStorage();
        updateHistoryDisplay();
    }
}

function copyHistory() {
    if (history.length === 0) {
        alert('No history to copy');
        return;
    }

    const historyText = history.join('\n');
    navigator.clipboard.writeText(historyText).then(() => {
        alert('History copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy history');
    });
}

function saveHistoryToStorage() {
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function loadHistoryFromStorage() {
    const stored = localStorage.getItem('calcHistory');
    if (stored) {
        history = JSON.parse(stored);
        updateHistoryDisplay();
    }
}

/* ========================
   THEME MANAGEMENT
   ======================== */

function applyMoodTheme() {
    const hour = new Date().getHours();
    let theme = 'skyBlue';

    if (hour >= 5 && hour < 12) {
        theme = 'sunsetGold'; // Morning - Soft Yellow
    } else if (hour >= 12 && hour < 17) {
        theme = 'skyBlue'; // Afternoon - Light Blue
    } else if (hour >= 17 && hour < 21) {
        theme = 'peach'; // Evening - Soft Orange
    } else {
        theme = 'lavender'; // Night - Soft Purple
    }

    applyTheme(theme);
}

function applyTheme(themeName) {

    const themeClasses = [
        'theme-skyBlue',
        'theme-lavender',
        'theme-mintGreen',
        'theme-peach',
        'theme-sunsetGold',
        'theme-roseQuartz'
    ];

    themeClasses.forEach(cls => {
        document.body.classList.remove(cls);
    });

    document.body.classList.add(`theme-${themeName}`);

    localStorage.setItem('selectedTheme', themeName);

    closeThemeGallery();
}

function openThemeGallery() {
    document.getElementById('themeModal').classList.remove('hidden');
}

function closeThemeGallery() {
    document.getElementById('themeModal').classList.add('hidden');
}

/* ========================
   FINANCE CALCULATORS
   ======================== */

function calculateGST() {
    const amount = parseFloat(document.getElementById('gstAmount').value) || 0;
    const rate = parseFloat(document.getElementById('gstRate').value) || 0;

    const gst = amount * rate / 100;
    const total = amount + gst;

    document.getElementById('gstValue').textContent = '₹' + gst.toFixed(2);
    document.getElementById('gstTotal').textContent = '₹' + total.toFixed(2);
}

function calculateDiscount() {
    const price = parseFloat(document.getElementById('discountPrice').value) || 0;
    const percent = parseFloat(document.getElementById('discountPercent').value) || 0;

    const discount = price * percent / 100;
    const final = price - discount;

    document.getElementById('discountAmount').textContent = '₹' + discount.toFixed(2);
    document.getElementById('discountFinal').textContent = '₹' + final.toFixed(2);
}

function calculateTip() {
    const bill = parseFloat(document.getElementById('tipBill').value) || 0;
    const percent = parseFloat(document.getElementById('tipPercent').value) || 0;

    const tip = bill * percent / 100;
    const total = bill + tip;

    document.getElementById('tipAmount').textContent = '₹' + tip.toFixed(2);
    document.getElementById('tipTotal').textContent = '₹' + total.toFixed(2);
}

function calculateEMI() {
    const principal = parseFloat(document.getElementById('emiPrincipal').value) || 0;
    const rate = parseFloat(document.getElementById('emiRate').value) || 0;
    const months = parseFloat(document.getElementById('emiMonths').value) || 1;

    if (principal === 0 || rate === 0) {
        document.getElementById('emiValue').textContent = '₹0';
        document.getElementById('emiTotal').textContent = '₹0';
        return;
    }

    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    const total = emi * months;

    document.getElementById('emiValue').textContent = '₹' + emi.toFixed(2);
    document.getElementById('emiTotal').textContent = '₹' + total.toFixed(2);
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('currencyAmount').value) || 0;
    const from = document.getElementById('currencyFrom').value;
    const to = document.getElementById('currencyTo').value;

    if (amount === 0) {
        document.getElementById('currencyResult').textContent = '0 ' + to;
        return;
    }

    // Convert to INR first, then to target currency
    const inINR = amount / exchangeRates[from];
    const converted = inINR * exchangeRates[to];

    document.getElementById('currencyResult').textContent =
        converted.toFixed(2) + ' ' + to;
}

/* ========================
   LIVE CLOCK
   ======================== */

function startLiveClock() {
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const date = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });

        document.getElementById('clockTime').textContent = time;
        document.getElementById('clockDate').textContent = date;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ========================
   BACKGROUND SLIDESHOW
   ======================== */

function startBackgroundSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('slide-active'));
        slides[n].classList.add('slide-active');
    }

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}

/* ========================
   KEYBOARD SUPPORT
   ======================== */

function setupKeyboardSupport() {
    document.addEventListener('keydown', function (e) {
        // Number keys 0-9
        if (e.key >= '0' && e.key <= '9') {
            appendNumber(e.key);
        }
        // Operators
        else if (e.key === '+') {
            e.preventDefault();
            appendOperator('+');
        }
        else if (e.key === '-') {
            e.preventDefault();
            appendOperator('-');
        }
        else if (e.key === '*') {
            e.preventDefault();
            appendOperator('*');
        }
        else if (e.key === '/') {
            e.preventDefault();
            appendOperator('/');
        }
        else if (e.key === '%') {
            e.preventDefault();
            appendOperator('%');
        }
        else if (e.key === '.') {
            appendNumber('.');
        }
        // Enter to calculate
        else if (e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
        // Backspace to delete
        else if (e.key === 'Backspace') {
            e.preventDefault();
            deleteLastChar();
        }
        // Escape to clear
        else if (e.key === 'Escape') {
            clearDisplay();
        }
    });
}

/* ========================
   NAVIGATION & SCROLLING
   ======================== */

function scrollToCalculator() {
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '60px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.flexDirection = 'column';
            navLinks.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            navLinks.style.padding = '20px';
            navLinks.style.gap = '15px';
            navLinks.style.zIndex = '998';
            navLinks.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
        });
    }
}

/* ========================
   SMOOTH SCROLL FOR NAV LINKS
   ======================== */

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });

                // Mobile lo matrame menu close cheyyi
                if (window.innerWidth <= 768) {
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks) {
                        navLinks.style.display = 'none';
                    }
                }
            }
        }
    });
});
/* ========================
   ACTIVE NAV LINK TRACKING
   ======================== */

window.addEventListener('scroll', function () {
    const sections = document.querySelectorAll('section');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

/* ========================
   LOCAL STORAGE FOR THEME
   ======================== */

window.addEventListener('load', function () {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
});
function toggleTheme() {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme","dark");
    } else {
        localStorage.setItem("theme","light");
    }
}

window.onload = function(){

    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-mode");
    }
}