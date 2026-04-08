// ==========================================
// 🧮 自動連動計算邏輯 (最終完整版)
// ==========================================
function calculateSubtotals() {
    const tables = document.querySelectorAll('.container > table');
    if (tables.length < 2) return;
    
    const topTable = tables[0];
    const statsTable = tables[1];
    
    // --- A. 抓取上方表格的全域加成 ---
    const topRow = topTable.querySelector('tbody tr');
    const mentor = parseInt(topRow.querySelectorAll('select')[2].value) || 0;
    const blackDiamond = parseInt(topRow.querySelectorAll('input[type="number"]')[0].value) || 0;
    const teamDeck = parseInt(topRow.querySelectorAll('input[type="number"]')[1].value) || 0;
    
    const globalBonus = mentor + blackDiamond + teamDeck;

    // --- B. 抓取下方表格並逐欄計算 ---
    const rows = statsTable.querySelectorAll('tbody tr');
    
    for (let col = 0; col < 5; col++) {
        
        // 🌟 1. 計算 [基本+階級+強化]
        let base = parseInt(rows[0].querySelectorAll('input[type="number"]')[col].value) || 0;
        let correction = parseInt(rows[1].querySelectorAll('input[type="number"]')[col].value) || 0;
        let grade = parseInt(rows[2].querySelectorAll('input[type="number"]')[col].value) || 0;
        let upgrade = parseInt(rows[3].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let sum1 = base + correction + grade + upgrade;
        
        // 寫入第 4 列並上色
        let targetCell1 = rows[4].querySelectorAll('td')[col + 1];
        targetCell1.innerText = sum1;
        applyColorRule(targetCell1, 'large');

        // 🌟 2. 計算 [一般陣容能力值]
        let coach = parseInt(rows[5].querySelectorAll('input[type="number"]')[col].value) || 0;
        let specialTrain = parseInt(rows[6].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let sum2 = sum1 + coach + specialTrain + globalBonus;
        
        // 寫入第 7 列並上色
        let targetCell2 = rows[7].querySelectorAll('td')[col + 1];
        targetCell2.innerText = sum2;
        applyColorRule(targetCell2, 'large');

        // 🌟 3. 計算 [最高登板能力值] (新增)
        // 注意：第 8 列 (rows[8]) 是隱形的 spacer-row，所以狀態從 9 開始
        let condition = parseInt(rows[9].querySelectorAll('input[type="number"]')[col].value) || 0;
        let equipment = parseInt(rows[10].querySelectorAll('input[type="number"]')[col].value) || 0;
        let skill = parseInt(rows[11].querySelectorAll('input[type="number"]')[col].value) || 0;

        let sum3 = sum2 + condition + equipment + skill;

        // 寫入第 12 列 (最高登板能力值) 並上色
        // 因為開頭一樣是 <td colspan="2">，所以索引也是 col + 1
        let targetCell3 = rows[12].querySelectorAll('td')[col + 1];
        targetCell3.innerText = sum3;
        applyColorRule(targetCell3, 'large');
    }
}

// ==========================================
// 🎨 顏色規則定義區 (維持你的完美邏輯)
// ==========================================

/**
 * 規則 1：大數字顏色更新
 */
function updateNumberColor(element, value) {
    if (isNaN(value)) {
        element.style.color = '';  // 如果是 NaN，不改變顏色
        return;
    }
    
    if (value >= 140) {
        element.style.color = '#ff0000'; // 紅色
    } else if (value >= 130) {
        element.style.color = '#ff6600'; // 橘紅色
    } else if (value >= 120) {
        element.style.color = '#ff9933'; // 橘色
    } else if (value >= 100) {
        element.style.color = '#dda300'; // 金黃色
    } else if (value >= 80) {
        element.style.color = '#c09300'; // 暗黃色
    } else if (value >= 65) {
        element.style.color = '#908070'; // 灰褐色
    } else {
        element.style.color = '#808080'; // 灰色
    }
}

/**
 * 規則 2：小數字顏色更新
 */
function updateNumberColor2(element, value) {
    if (isNaN(value)) {
        element.style.color = '';  
        return;
    }
    
    if (value >= 21) {
        element.style.color = '#ff0000'; // 紅色
    } else if (value >= 11) {
        element.style.color = '#ff9933'; // 橘色
    } else {
        element.style.color = '#ffffff'; // 白色
    }
}

/**
 * 規則 3：正負數字顏色更新
 */
function updateNumberColor3(element, value) {
    if (isNaN(value)) {
        element.style.color = '';  
        return;
    }
    
    if (value > 0) {
        element.style.color = '#00ff00'; // 綠色 (正向提升)
    } else if (value < 0) {
        element.style.color = '#ff0000'; // 紅色 (負面扣除)
    } else {
        element.style.color = '#ffffff'; // 白色 (無變化)
    }
}

// ==========================================
// 🛡️ 新增：強制限制輸入框的最大/最小值
// ==========================================
function enforceMinMax(element) {
    // 確保只針對數字輸入框處理
    if (element.tagName !== 'INPUT' || element.type !== 'number') return;
    
    // 如果格子被清空了，先不處理，讓使用者能刪除數字重新輸入
    if (element.value === '') return; 

    let val = parseFloat(element.value);
    
    // 檢查是否有設定 min 屬性，且當前數值小於 min
    if (element.hasAttribute('min')) {
        let min = parseFloat(element.min);
        if (val < min) element.value = min; // 強制拉回最小值
    }

    // 檢查是否有設定 max 屬性，且當前數值大於 max
    if (element.hasAttribute('max')) {
        let max = parseFloat(element.max);
        if (val > max) element.value = max; // 強制壓回最大值
    }
}

// ==========================================
// 🎨 自動綁定表格顏色更新邏輯
// ==========================================

// 負責判斷並派發給對應的顏色函數
function applyColorRule(element, rule) {
    let valueText = element.value !== undefined ? element.value : element.innerText;
    let val = parseInt(valueText, 10);

    if (rule === 'large') updateNumberColor(element, val);
    else if (rule === 'small') updateNumberColor2(element, val);
    else if (rule === 'posneg') updateNumberColor3(element, val);
}

// ==========================================
// 🎨 初始化與綁定事件 (更新版：將上方表格也納入監聽)
// ==========================================
function initTableColors() {
    // 網頁剛載入時，先執行一次全面計算
    calculateSubtotals();

    // --- 綁定下方表格的顏色與計算 ---
    const rows = document.querySelectorAll('tr.rule-large, tr.rule-small, tr.rule-posneg');

    rows.forEach(row => {
        let rule = '';
        if (row.classList.contains('rule-large')) rule = 'large';
        if (row.classList.contains('rule-small')) rule = 'small';
        if (row.classList.contains('rule-posneg')) rule = 'posneg';

        const targetElements = row.querySelectorAll('input[type="number"], select, td:not(:first-child)');

        targetElements.forEach(el => {
            // 安全過濾
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

    // --- 🌟 新增：綁定上方表格的輸入框與選單 ---
    // 讓黑鑽、團隊加成、指導球員等選項改變時，也能瞬間觸發重新計算！
    const topTableElements = document.querySelectorAll('.container > table:first-of-type input[type="number"], .container > table:first-of-type select');
    
    topTableElements.forEach(el => {
        el.addEventListener('change', () => {
            enforceMinMax(el); // 讓上方表格的輸入框也能防止輸入負數
            calculateSubtotals(); // 改變數值後觸發全面計算
        });
        el.addEventListener('input', () => {
            calculateSubtotals(); // 打字瞬間即時計算
        });
    });
}

// 確保網頁載入完成後，啟動初始化器
document.addEventListener('DOMContentLoaded', initTableColors);

// ==========================================
// ⚙️ 未來計算與綁定區 (預留模板)
// ==========================================

/* 💡 這裡先預留一個概念給你參考，我們之後會這樣用：
  
  function calculateEverything() {
      // 1. 抓取 HTML 裡的格子 (未來我們會給格子加上 id，例如 id="final-contact")
      let contactCell = document.getElementById('final-contact');
      
      // 2. 計算出數值 (假設算出來是 125)
      let finalContactValue = 125; 
      
      // 3. 把數字寫進格子裡
      contactCell.innerText = finalContactValue;
      
      // 4. 【保證顏色不亂掉的關鍵】：立刻呼叫顏色規則！
      updateNumberColor(contactCell, finalContactValue);
  }

  // 當網頁一打開時，強制執行一次計算與上色
  // window.onload = calculateEverything;
*/
