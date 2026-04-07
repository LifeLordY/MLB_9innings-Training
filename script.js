// ==========================================
// 🧮 新增：自動連動計算邏輯
// ==========================================
function calculateSubtotals() {
    // 精準抓取主畫面中的「第二個表格」(能力值表格)
    const statsTable = document.querySelectorAll('.container > table')[1];
    if (!statsTable) return;
    
    // 抓出表格裡所有的橫排
    const rows = statsTable.querySelectorAll('tbody tr');
    
    // 迴圈跑 5 次，分別計算 5 個能力值：接觸(0), 力量(1), 選球(2), 速度(3), 守備(4)
    for (let col = 0; col < 5; col++) {
        // 從第 0(基本), 1(校正), 2(階級), 3(強化) 列抓出對應欄位的數值
        // 使用 || 0 是為了防止使用者把格子清空時出現 NaN 錯誤，空值會當作 0 計算
        let base = parseInt(rows[0].querySelectorAll('input[type="number"]')[col].value) || 0;
        let correction = parseInt(rows[1].querySelectorAll('input[type="number"]')[col].value) || 0;
        let grade = parseInt(rows[2].querySelectorAll('input[type="number"]')[col].value) || 0;
        let upgrade = parseInt(rows[3].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        // 依照你的公式計算總和
        let sum = base + correction + grade + upgrade;
        
        // 目標寫入位置是第 4 列 (基本+階級+強化)
        // 因為該列的第一格是合併儲存格 (colspan="2")，所以數值格子是從索引 [col + 1] 開始
        let targetCell = rows[4].querySelectorAll('td')[col + 1];
        
        // 寫入計算結果
        targetCell.innerText = sum;
        
        // 🌟 關鍵：寫入新數字後，立刻強制它根據「大數字(large)」規則重新上色！
        applyColorRule(targetCell, 'large');
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

// 尋找表格並綁定事件 (更新版)
function initTableColors() {
    const rows = document.querySelectorAll('tr.rule-large, tr.rule-small, tr.rule-posneg');

    // 🌟 啟動 1：網頁剛載入時，先執行一次全面計算，確保初始數值正確
    calculateSubtotals();

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

            // 初始化上色
            applyColorRule(el, rule);

            // 綁定監聽器
            if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
                
                el.addEventListener('change', () => {
                    enforceMinMax(el);       
                    applyColorRule(el, rule); 
                    calculateSubtotals(); // 🌟 啟動 2：數值確認改變時，觸發連動計算
                });

                el.addEventListener('input', () => {
                    applyColorRule(el, rule); 
                    calculateSubtotals(); // 🌟 啟動 3：打字瞬間也即時觸發連動計算
                });
            }
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
