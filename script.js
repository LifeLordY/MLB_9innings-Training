// ==========================================
// 🧮 自動連動計算邏輯 (核心計算引擎)
// ==========================================
function calculateSubtotals() {
    const tables = document.querySelectorAll('.container > table');
    if (tables.length < 2) return;
    
    const topTable = tables[0];
    const statsTable = tables[1];
    
    // --- A. 抓取上方表格的全域加成 ---
    const topRow = topTable.querySelector('tbody tr');
    
    const mentor = parseInt(topRow.querySelectorAll('select')[2].value) || 0;       // 指導球員
    const blackDiamond = parseInt(topRow.querySelectorAll('input[type="number"]')[0].value) || 0; // 黑鑽
    const setDeck = parseInt(topRow.querySelectorAll('input[type="number"]')[1].value) || 0;      // 團隊加成
    
    const globalBonus = mentor + blackDiamond + setDeck;

    // --- B. 準備記錄各橫排的 5 項數值總和 ---
    let rowTotals = {
        basicStats: 0,      // 基本能力值
        gradeIncrease: 0,   // 階級上升量
        development: 0,     // 強化量
        sum1: 0,            // 基本+階級+強化 (小計1)
        trainer: 0,         // 教練
        sum2: 0,            // 一般陣容能力值 (小計2)
        sum3: 0             // 最高登板能力值 (總計)
    };

    // --- C. 抓取下方表格並逐欄計算 (接觸, 力量, 選球, 速度, 守備) ---
    const rows = statsTable.querySelectorAll('tbody tr');
    
    for (let col = 0; col < 5; col++) {
        
        // 🌟 1. 計算 [基本+階級+強化]
        let basicStats = parseInt(rows[0].querySelectorAll('input[type="number"]')[col].value) || 0;
        let adjustment = parseInt(rows[1].querySelectorAll('input[type="number"]')[col].value) || 0;
        let gradeIncrease = parseInt(rows[2].querySelectorAll('input[type="number"]')[col].value) || 0;
        let development = parseInt(rows[3].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let sum1 = basicStats + adjustment + gradeIncrease + development;
        
        // 寫入第 4 列 (基本+階級+強化) 並上色
        let targetCell1 = rows[4].querySelectorAll('td')[col + 1];
        targetCell1.innerText = sum1;
        applyColorRule(targetCell1, 'large');

        // 🌟 2. 計算 [一般陣容能力值]
        // 注意：第5列為「特別訓練」，第6列為「教練」(根據最新 HTML 排版)
        let specialTraining = parseInt(rows[5].querySelectorAll('input[type="number"]')[col].value) || 0;
        let trainer = parseInt(rows[6].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let sum2 = sum1 + specialTraining + trainer + globalBonus;
        
        // 寫入第 7 列 (一般陣容能力值) 並上色
        let targetCell2 = rows[7].querySelectorAll('td')[col + 1];
        targetCell2.innerText = sum2;
        applyColorRule(targetCell2, 'large');

        // 🌟 3. 計算 [最高登板能力值]
        // 注意：第8列為隱形空隙(spacer-row)，故從第9列開始
        let condition = parseInt(rows[9].querySelectorAll('input[type="number"]')[col].value) || 0;
        let gear = parseInt(rows[10].querySelectorAll('input[type="number"]')[col].value) || 0;
        let skill = parseInt(rows[11].querySelectorAll('input[type="number"]')[col].value) || 0;

        let sum3 = sum2 + condition + gear + skill;

        // 寫入第 12 列 (最高登板能力值) 並上色
        let targetCell3 = rows[12].querySelectorAll('td')[col + 1];
        targetCell3.innerText = sum3;
        applyColorRule(targetCell3, 'large');

        // 🌟 4. 將每一欄的數據累加到 rowTotals 記錄本中，作為最後計算最右欄使用
        rowTotals.basicStats += basicStats;
        rowTotals.gradeIncrease += gradeIncrease;
        rowTotals.development += development;
        rowTotals.sum1 += sum1;
        rowTotals.trainer += trainer;
        rowTotals.sum2 += sum2;
        rowTotals.sum3 += sum3;
    }

    // --- D. 計算並寫入最右側的「值」欄位 ---
    
    // 1. 計算並寫入平均值 (保留小數點一位)
    let avgCell0 = rows[0].lastElementChild;  // 基本能力值
    let avgCell4 = rows[4].lastElementChild;  // 基本+階級+強化
    let avgCell7 = rows[7].lastElementChild;  // 一般陣容能力值
    let avgCell12 = rows[12].lastElementChild; // 最高登板能力值

    avgCell0.innerText = (rowTotals.basicStats / 5).toFixed(1);
    avgCell4.innerText = (rowTotals.sum1 / 5).toFixed(1);
    avgCell7.innerText = (rowTotals.sum2 / 5).toFixed(1);
    avgCell12.innerText = (rowTotals.sum3 / 5).toFixed(1);

    // 套用「大數字」顏色規則
    applyColorRule(avgCell0, 'large');
    applyColorRule(avgCell4, 'large');
    applyColorRule(avgCell7, 'large');
    applyColorRule(avgCell12, 'large');

    // 2. 寫入總和 (不呼叫顏色函數，維持預設白色)
    rows[2].lastElementChild.innerText = rowTotals.gradeIncrease; // 階級上升量
    rows[3].lastElementChild.innerText = rowTotals.development;   // 強化量
    rows[6].lastElementChild.innerText = rowTotals.trainer;       // 教練 (已修正為第 6 列)
}

// ==========================================
// 🎨 顏色規則定義區
// ==========================================

/**
 * 規則 1：大數字顏色更新
 */
function updateNumberColor(element, value) {
    if (isNaN(value)) {
        element.style.color = '';  
        return;
    }
    
    if (value >= 140) element.style.color = '#ff0000';      // 紅色
    else if (value >= 130) element.style.color = '#ff6600'; // 橘紅色
    else if (value >= 120) element.style.color = '#ff9933'; // 橘色
    else if (value >= 100) element.style.color = '#dda300'; // 金黃色
    else if (value >= 80) element.style.color = '#c09300';  // 暗黃色
    else if (value >= 65) element.style.color = '#908070';  // 灰褐色
    else element.style.color = '#808080';                   // 灰色
}

/**
 * 規則 2：小數字顏色更新
 */
function updateNumberColor2(element, value) {
    if (isNaN(value)) {
        element.style.color = '';  
        return;
    }
    
    if (value >= 21) element.style.color = '#ff0000';       // 紅色
    else if (value >= 11) element.style.color = '#ff9933';  // 橘色
    else element.style.color = '#ffffff';                   // 白色
}

/**
 * 規則 3：正負數字顏色更新
 */
function updateNumberColor3(element, value) {
    if (isNaN(value)) {
        element.style.color = '';  
        return;
    }
    
    if (value > 0) element.style.color = '#00ff00';         // 綠色 (正向提升)
    else if (value < 0) element.style.color = '#ff0000';    // 紅色 (負面扣除)
    else element.style.color = '#ffffff';                   // 白色 (無變化)
}

// ==========================================
// 🛡️ 防呆機制：強制限制輸入框的最大/最小值
// ==========================================
function enforceMinMax(element) {
    if (element.tagName !== 'INPUT' || element.type !== 'number') return;
    if (element.value === '') return; 

    let val = parseFloat(element.value);
    
    if (element.hasAttribute('min')) {
        let min = parseFloat(element.min);
        if (val < min) element.value = min; 
    }

    if (element.hasAttribute('max')) {
        let max = parseFloat(element.max);
        if (val > max) element.value = max; 
    }
}

// ==========================================
// ⚙️ 初始化與事件綁定 (Listener 註冊)
// ==========================================

// 負責判斷並派發給對應的顏色函數
function applyColorRule(element, rule) {
    // 如果元素帶有 no-color 標籤，則強制維持預設不變色並跳過
    if (element.classList && element.classList.contains('no-color')) {
        element.style.color = ''; 
        return;
    }
    
    let valueText = element.value !== undefined ? element.value : element.innerText;
    let val = parseInt(valueText, 10);

    if (rule === 'large') updateNumberColor(element, val);
    else if (rule === 'small') updateNumberColor2(element, val);
    else if (rule === 'posneg') updateNumberColor3(element, val);
}

function initTableColors() {
    // 1. 網頁剛載入時，先執行一次全面計算
    calculateSubtotals();

    // 2. 綁定下方表格的顏色與計算
    const rows = document.querySelectorAll('tr.rule-large, tr.rule-small, tr.rule-posneg');

    rows.forEach(row => {
        let rule = '';
        if (row.classList.contains('rule-large')) rule = 'large';
        if (row.classList.contains('rule-small')) rule = 'small';
        if (row.classList.contains('rule-posneg')) rule = 'posneg';

        const targetElements = row.querySelectorAll('input[type="number"], select, td:not(:first-child)');

        targetElements.forEach(el => {
            // 安全過濾 (略過 checkbox、名稱欄、以及含有 input 的父層 td)
            if (el.type === 'checkbox') return;
            if (el.tagName === 'TD' && el.querySelector('input, select, button')) return;
            if (el.tagName === 'TD' && el.hasAttribute('colspan')) return;

            applyColorRule(el, rule);

            if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
                el.addEventListener('change', () => {
                    enforceMinMax(el);       
                    applyColorRule(el, rule); 
                    calculateSubtotals(); 
                });
                el.addEventListener('input', () => {
                    applyColorRule(el, rule); 
                    calculateSubtotals(); 
                });
            }
        });
    });

    // 3. 綁定上方表格的輸入框與選單
    const topTableElements = document.querySelectorAll('.container > table:first-of-type input[type="number"], .container > table:first-of-type select');
    
    topTableElements.forEach(el => {
        el.addEventListener('change', () => {
            enforceMinMax(el); 
            calculateSubtotals(); 
        });
        el.addEventListener('input', () => {
            calculateSubtotals(); 
        });
    });
}

// 確保網頁載入完成後，啟動初始化器
document.addEventListener('DOMContentLoaded', initTableColors);
