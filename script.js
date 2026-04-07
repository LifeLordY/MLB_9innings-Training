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
// 🎨 自動綁定表格顏色更新邏輯
// ==========================================

// 負責判斷並派發給對應的顏色函數
function applyColorRule(element, rule) {
    // 如果是輸入框抓 value，如果是結算欄位 (td) 抓 innerText
    let valueText = element.value !== undefined ? element.value : element.innerText;
    let val = parseInt(valueText, 10);

    if (rule === 'large') updateNumberColor(element, val);
    else if (rule === 'small') updateNumberColor2(element, val);
    else if (rule === 'posneg') updateNumberColor3(element, val);
}

// 尋找表格並綁定事件
function initTableColors() {
    // 找出所有標記了規則的橫列
    const rows = document.querySelectorAll('tr.rule-large, tr.rule-small, tr.rule-posneg');

    rows.forEach(row => {
        let rule = '';
        if (row.classList.contains('rule-large')) rule = 'large';
        if (row.classList.contains('rule-small')) rule = 'small';
        if (row.classList.contains('rule-posneg')) rule = 'posneg';

        // 抓出該列裡面的所有數字輸入框、下拉選單，以及最後面的結算數字格子 (td)
        const targetElements = row.querySelectorAll('input[type="number"], select, td:not(:first-child)');

        targetElements.forEach(el => {
            // 安全過濾：跳過 checkbox、名稱文字區塊、以及包著 input 的外部 td
            if (el.type === 'checkbox') return;
            if (el.tagName === 'TD' && el.querySelector('input, select, button')) return;
            if (el.tagName === 'TD' && el.hasAttribute('colspan')) return;

            // 1. 網頁剛載入時，強制執行一次上色 (這解決了你說的重新整理會跑掉的問題)
            applyColorRule(el, rule);

            // 2. 綁定「當數值改變時自動重新上色」的監聽器
            if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
                el.addEventListener('input', () => applyColorRule(el, rule));
                el.addEventListener('change', () => applyColorRule(el, rule)); 
            }
        });
    });
}

// 確保網頁(包含重整、從背景喚醒)載入完成後，立刻啟動顏色初始化器
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
