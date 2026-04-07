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

// 尋找表格並綁定事件
function initTableColors() {
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

            // 1. 網頁剛載入時的初始化
            applyColorRule(el, rule);

            // 2. 綁定監聽器
            if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
                
                // 當數字改變時 (例如滑鼠點擊旁邊、或按 Enter 時)
                el.addEventListener('change', () => {
                    enforceMinMax(el);       // 🌟 步驟 A: 先檢查並強制修正數值
                    applyColorRule(el, rule); // 🌟 步驟 B: 再根據修正後的數值上色
                });

                // 當使用者正在打字的瞬間
                el.addEventListener('input', () => {
                    // 注意：打字瞬間我們只檢查顏色，不強制修正數值。
                    // 為什麼？因為如果你限制 min="10"，使用者想打 "15"，當他剛打下 "1" 的瞬間就會被強制變成 "10"，他會氣死。
                    // 所以防呆機制 (enforceMinMax) 我們放在 change 事件裡最完美。
                    applyColorRule(el, rule); 
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
