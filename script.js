// ==========================================
// 🏷️ 新增：自動切換打者/投手表頭
// ==========================================
function updateStatLabels() {
    const posSelect = document.getElementById('position-select');
    const statsTable = document.querySelectorAll('.container > table')[1];
    if (!posSelect || !statsTable) return;

    const isPitcher = ['SP', 'RP', 'CP'].includes(posSelect.value);
    const headers = statsTable.querySelectorAll('thead th');

    // 表頭從 index 2 開始是屬性名稱
    if (isPitcher) {
        headers[2].innerText = '控球';
        headers[3].innerText = '球威';
        headers[4].innerText = '體力';
        headers[5].innerText = '直球';
        headers[6].innerText = '變化';
    } else {
        headers[2].innerText = '接觸';
        headers[3].innerText = '力量';
        headers[4].innerText = '選球';
        headers[5].innerText = '速度';
        headers[6].innerText = '守備';
    }
}

// ==========================================
// 🎨 新增：動態切換表頭與總結列的背景顏色
// ==========================================
function updateHeaderColor() {
    const topTable = document.querySelectorAll('.container > table')[0];
    if (!topTable) return;
    
    // 抓取階級選單
    const gradeSelect = topTable.querySelectorAll('select')[0];
    
    // 同時抓取所有表頭 (th) 以及三個總計列 (.summary-row td)
    const themeElements = document.querySelectorAll('.container table th, .summary-row td');

    // 判斷是否為白金 (diamond)
    if (gradeSelect.value === 'diamond') {
        themeElements.forEach(el => el.style.backgroundColor = '#007fff'); // 變成亮藍色
    } else {
        themeElements.forEach(el => el.style.backgroundColor = ''); // 清除設定，恢復 CSS 預設的深藍色 (#00001f)
    }
}

// ==========================================
// 🧮 自動連動計算邏輯 (新增特別訓練自動分配)
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
    const setDeck = parseInt(topRow.querySelectorAll('input[type="number"]')[1].value) || 0;      
    
    const globalBonus = mentor + blackDiamond + setDeck;

    // --- B. 準備記錄各橫排的 5 項數值總和 ---
    let rowTotals = {
        basicStats: 0,      
        gradeIncrease: 0,   
        development: 0,     
        sum1: 0,            
        trainer: 0,         
        sum2: 0,            
        sum3: 0             
    };

    const rows = statsTable.querySelectorAll('tbody tr');

    // ==============================================================
    // 🌟 新增：B.5 計算特別訓練自動分配
    // ==============================================================
    
    // 1. 定義特別訓練等級對應的加成陣列 [第一名, 第二名, 第三名]
    const stBonuses = {
        10: [12, 10, 4],  9: [12, 10, 4],
         8: [10, 8, 2],
         7: [8, 6, 0],    6: [8, 6, 0],
         5: [6, 4, 0],
         4: [6, 2, 0],
         3: [4, 2, 0],
         2: [4, 0, 0],
         1: [2, 0, 0],
         0: [0, 0, 0]
    };

    // 2. 抓取目前選定的特別訓練等級
    let stLevel = parseInt(rows[5].querySelector('select').value) || 0;
    let currentBonus = stBonuses[stLevel] || [0, 0, 0];

    // 3. 收集五個屬性的 [索引, 強化量, 基本能力值] 來準備排名
    let rankData = [];
    for (let i = 0; i < 5; i++) {
        let base = parseInt(rows[0].querySelectorAll('input[type="number"]')[i].value) || 0;
        let dev = parseInt(rows[3].querySelectorAll('input[type="number"]')[i].value) || 0;
        rankData.push({ index: i, base: base, dev: dev });
    }

    // 4. 排序規則：強化量 > 基本能力值 > 左側優先(index小)
    rankData.sort((a, b) => {
        if (b.dev !== a.dev) return b.dev - a.dev;     // 條件 1：強化量高優先
        if (b.base !== a.base) return b.base - a.base; // 條件 2：強化量同，基本高優先
        return a.index - b.index;                      // 條件 3：都同，左側優先
    });

    // 5. 將對應的獎勵發放到對應的索引中，並強制寫回「特別訓練」的輸入框
    let finalStValues = [0, 0, 0, 0, 0];
    finalStValues[rankData[0].index] = currentBonus[0]; // 第一名
    finalStValues[rankData[1].index] = currentBonus[1]; // 第二名
    finalStValues[rankData[2].index] = currentBonus[2]; // 第三名

    let stInputs = rows[5].querySelectorAll('input[type="number"]');
    for (let i = 0; i < 5; i++) {
        stInputs[i].value = finalStValues[i];
        applyColorRule(stInputs[i], 'small'); // 寫入後馬上套用小數字顏色
    }
    // ==============================================================

    // --- C. 抓取下方表格並逐欄計算 (接觸, 力量, 選球, 速度, 守備) ---
    for (let col = 0; col < 5; col++) {
        
        // 1. 計算 [基本+階級+強化]
        let basicStats = parseInt(rows[0].querySelectorAll('input[type="number"]')[col].value) || 0;
        let adjustment = parseInt(rows[1].querySelectorAll('input[type="number"]')[col].value) || 0;
        let gradeIncrease = parseInt(rows[2].querySelectorAll('input[type="number"]')[col].value) || 0;
        let development = parseInt(rows[3].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let sum1 = basicStats + adjustment + gradeIncrease + development;
        
        let targetCell1 = rows[4].querySelectorAll('td')[col + 1];
        targetCell1.innerText = sum1;
        applyColorRule(targetCell1, 'large');

        // 2. 計算 [一般陣容能力值]
        // 這裡的 specialTraining 直接讀取我們剛剛自動分配好並寫入的數值
        let specialTraining = parseInt(rows[5].querySelectorAll('input[type="number"]')[col].value) || 0;
        let trainer = parseInt(rows[6].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let sum2 = sum1 + specialTraining + trainer + globalBonus;
        
        let targetCell2 = rows[7].querySelectorAll('td')[col + 1];
        targetCell2.innerText = sum2;
        applyColorRule(targetCell2, 'large');

        // 3. 計算 [最高登板能力值]
        let condition = parseInt(rows[9].querySelectorAll('input[type="number"]')[col].value) || 0;
        let gear = parseInt(rows[10].querySelectorAll('input[type="number"]')[col].value) || 0;
        let skill = parseInt(rows[11].querySelectorAll('input[type="number"]')[col].value) || 0;

        let sum3 = sum2 + condition + gear + skill;

        let targetCell3 = rows[12].querySelectorAll('td')[col + 1];
        targetCell3.innerText = sum3;
        applyColorRule(targetCell3, 'large');

        // 4. 累加到 rowTotals
        rowTotals.basicStats += basicStats;
        rowTotals.gradeIncrease += gradeIncrease;
        rowTotals.development += development;
        rowTotals.sum1 += sum1;
        rowTotals.trainer += trainer;
        rowTotals.sum2 += sum2;
        rowTotals.sum3 += sum3;
    }

    // --- D. 計算並寫入最右側的「值」欄位 ---
    let avgCell0 = rows[0].lastElementChild;  
    let avgCell4 = rows[4].lastElementChild;  
    let avgCell7 = rows[7].lastElementChild;  
    let avgCell12 = rows[12].lastElementChild; 

    avgCell0.innerText = (rowTotals.basicStats / 5).toFixed(1);
    avgCell4.innerText = (rowTotals.sum1 / 5).toFixed(1);
    avgCell7.innerText = (rowTotals.sum2 / 5).toFixed(1);
    avgCell12.innerText = (rowTotals.sum3 / 5).toFixed(1);

    applyColorRule(avgCell0, 'large');
    applyColorRule(avgCell4, 'large');
    applyColorRule(avgCell7, 'large');
    applyColorRule(avgCell12, 'large');

    rows[2].lastElementChild.innerText = rowTotals.gradeIncrease; 
    rows[3].lastElementChild.innerText = rowTotals.development;   
    rows[6].lastElementChild.innerText = rowTotals.trainer;       
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
// 💎 新增：自動計算上方表格加成 (黑鑽、團隊、指導球員)
// ==========================================
function updateTopTableBonuses() {
    const typeSelect = document.getElementById('type-select');
    const posSelect = document.getElementById('position-select');
    const topTable = document.querySelectorAll('.container > table')[0];
    
    if (!typeSelect || !posSelect || !topTable) return;

    const pType = typeSelect.value;   // 類型
    const pPos = posSelect.value;     // 位置
    const pGrade = topTable.querySelectorAll('select')[0].value; // 階級

    const bdInput = topTable.querySelectorAll('input[type="number"]')[0];      // 黑鑽輸入框
    const setDeckInput = topTable.querySelectorAll('input[type="number"]')[1]; // 團隊加成輸入框
    const mentorSelect = topTable.querySelectorAll('select')[2];               // 指導球員選單

    // 🌟 1. 判定【黑鑽 (blackDiamond)】
    let bdValue = 0;
    if (pGrade === 'blackDiamond') {
        if (['vintage', 'signature'].includes(pType)) bdValue = 1;
        else if (pType === 'supreme') bdValue = 2;
        else if (pType === 'legend') bdValue = 3;
    }
    bdInput.value = bdValue;

    // 🌟 2. 判定【團隊加成 (setDeck)】
    let setDeckValue = 10; // 預設值為 10
    if (pGrade === 'blackDiamond') {
        if (['regular', 'vintage', 'legend'].includes(pType)) setDeckValue += 1;
        else if (['prime', 'signature'].includes(pType)) setDeckValue += 2;
    }
    if (pType === 'signature') {
        setDeckValue *= 2; // 若為簽名卡，最終結果 * 2
    }
    setDeckInput.value = setDeckValue;

    // 🌟 3. 判定【指導球員 (mentor)】
    let mentorValue = 0;
    if (['legend', 'supreme'].includes(pType)) {
        mentorValue = 0;
    } else if (['regular', 'vintage'].includes(pType)) {
        mentorValue = 1;
    } else if (pType === 'prime') {
        mentorValue = 3;
    } else if (pType === 'signature') {
        // 判斷位置是打者還是投手
        const batters = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];
        const pitchers = ['SP', 'RP', 'CP'];
        
        if (batters.includes(pPos)) mentorValue = 3;
        else if (pitchers.includes(pPos)) mentorValue = 2;
    }
    mentorSelect.value = mentorValue; // 將數值賦予下拉選單
}

// ==========================================
// ⚙️ 新增：自動分配「狀態」與「裝備」數值
// ==========================================
function updateConditionAndGear() {
    const typeSelect = document.getElementById('type-select');
    const statsTable = document.querySelectorAll('.container > table')[1];
    if (!typeSelect || !statsTable) return;

    const pType = typeSelect.value;
    const rows = statsTable.querySelectorAll('tbody tr');
    
    const conditionRow = rows[9]; // 第 9 列：狀態
    const gearRow = rows[10];     // 第 10 列：裝備

    // --- 1. 狀態 (Condition) 處理 ---
    const conditionSelect = conditionRow.querySelector('select');
    const conditionInputs = conditionRow.querySelectorAll('input[type="number"]');
    const option6 = conditionSelect.querySelector('option[value="6"]');

    // 處理 "6" 選項的顯示與隱藏
    if (pType === 'supreme') {
        option6.hidden = false;
        option6.disabled = false;
    } else {
        option6.hidden = true;
        option6.disabled = true;
        // 如果原本是 6 但切換成非 supreme，強制降回 3
        if (conditionSelect.value === '6') {
            conditionSelect.value = '3'; 
        }
    }

    const condValue = parseInt(conditionSelect.value) || 0;
    // 將狀態值填滿整排 5 個格子，並立刻上色
    conditionInputs.forEach(input => {
        input.value = condValue;
        applyColorRule(input, 'posneg');
    });

    // --- 2. 裝備 (Gear) 處理 ---
    const gearSelect = gearRow.querySelector('select');
    const gearInputs = gearRow.querySelectorAll('input[type="number"]');
    let gearValue = parseInt(gearSelect.value) || 0;

    // 類型為 supreme 時，裝備效果 * 2
    if (pType === 'supreme') {
        gearValue *= 2;
    }

    // 裝備只影響前 3 個值，後 2 個強制歸零
    for (let i = 0; i < 5; i++) {
        gearInputs[i].value = (i < 3) ? gearValue : 0;
        applyColorRule(gearInputs[i], 'posneg');
    }
}

// ==========================================
// 🛠️ 技能設定 (Modal) 專屬邏輯 (新增即時顏色判定)
// ==========================================
function updateChemistry() {
    const posSelect = document.getElementById('position-select');
    const modal = document.querySelector('.modal-overlay');
    if (!posSelect || !modal) return;

    // 判斷是否為投手
    const isPitcher = ['SP', 'RP', 'CP'].includes(posSelect.value);
    let chemValue = isPitcher ? 6 : 7; 

    // 檢查是否選中傳說
    const chemSelect = modal.querySelector('tbody tr:nth-child(1) select');
    if (chemSelect && chemSelect.value === 'legend') {
        chemValue += 1;
    }

    // 將數值填入默契這排的 5 個格子，並🌟馬上套用小數字顏色
    const chemInputs = modal.querySelectorAll('tbody tr:nth-child(1) input[type="number"]');
    chemInputs.forEach(input => {
        input.value = chemValue;
        applyColorRule(input, 'small'); 
    });
}

function initModal() {
    const modal = document.querySelector('.modal-overlay');
    const mainStatsTable = document.querySelectorAll('.container > table')[1];
    
    const openBtn = mainStatsTable.querySelectorAll('tbody tr')[11].querySelector('.setting-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const submitBtn = modal.querySelector('.submit-btn');

    if (!openBtn || !modal) return;

    const modalRows = modal.querySelectorAll('tbody tr');

    // --- 🌟 新增：設定視窗內的專屬顏色綁定 ---
    modalRows.forEach((row, index) => {
        // 前四排(0~3)是 small，第五排(4:其他)是 posneg
        let rule = (index === 4) ? 'posneg' : 'small'; 
        const inputs = row.querySelectorAll('input[type="number"]');

        inputs.forEach(input => {
            input.addEventListener('change', () => {
                enforceMinMax(input);
                applyColorRule(input, rule);
            });
            input.addEventListener('input', () => {
                applyColorRule(input, rule);
            });
        });
    });
    // ----------------------------------------

    // 1. 打開視窗
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        updateChemistry(); 
        
        // 🌟 打開視窗時，掃描並更新所有現有數字的顏色
        modalRows.forEach((row, index) => {
            let rule = (index === 4) ? 'posneg' : 'small';
            row.querySelectorAll('input[type="number"]').forEach(input => {
                applyColorRule(input, rule);
            });
        });
    });

    // 2. 關閉視窗 (取消)
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 3. 完成並寫入主畫面
    submitBtn.addEventListener('click', () => {
        const skillRowMain = mainStatsTable.querySelectorAll('tbody tr')[11];
        const skillInputsMain = skillRowMain.querySelectorAll('input[type="number"]');

        for (let col = 0; col < 5; col++) {
            let colSum = 0;
            modalRows.forEach(row => {
                let val = parseInt(row.querySelectorAll('input[type="number"]')[col].value) || 0;
                colSum += val;
            });
            skillInputsMain[col].value = colSum;
            applyColorRule(skillInputsMain[col], 'small'); 
        }

        calculateSubtotals(); 
        modal.style.display = 'none'; 
    });

    // 4. 默契選單連動 
    const chemSelect = modal.querySelector('tbody tr:nth-child(1) select');
    if (chemSelect) {
        chemSelect.addEventListener('change', updateChemistry);
    }

    // 5. 歸零按鈕邏輯
    const resetBtns = modal.querySelectorAll('.reset-row-btn');
    resetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            // 找出這排的索引，來決定要套用哪個顏色規則
            const rowIndex = Array.from(modalRows).indexOf(row);
            let rule = (rowIndex === 4) ? 'posneg' : 'small'; 
            
            const inputs = row.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.value = 0; 
                applyColorRule(input, rule); // 🌟 歸零後立刻恢復預設顏色
            });
        });
    });
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
    // 🌟 1. 網頁剛載入時，依序判定所有自動化邏輯
    updateTopTableBonuses();
    updateStatLabels();       // 載入表頭
    updateConditionAndGear(); // 載入狀態與裝備
    updateHeaderColor();      // 載入表頭顏色
    calculateSubtotals();     // 最後計算總和

    // 2. 綁定下方表格的顏色與計算
    const rows = document.querySelectorAll('tr.rule-large, tr.rule-small, tr.rule-posneg');

    rows.forEach(row => {
        let rule = '';
        if (row.classList.contains('rule-large')) rule = 'large';
        if (row.classList.contains('rule-small')) rule = 'small';
        if (row.classList.contains('rule-posneg')) rule = 'posneg';

        const targetElements = row.querySelectorAll('input[type="number"], select, td:not(:first-child)');

        targetElements.forEach(el => {
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
    const gradeSelect = document.querySelectorAll('.container > table:first-of-type select')[0]; 
    
    topTableElements.forEach(el => {
        el.addEventListener('change', () => {
            if (el === gradeSelect) {
                updateTopTableBonuses();
                updateHeaderColor();
            }
            
            enforceMinMax(el); 
            calculateSubtotals(); 
        });
        el.addEventListener('input', () => {
            calculateSubtotals(); 
        });
    });

    // 🌟 4. 綁定最上方的「類型」與「位置」選單
    const typeSelect = document.getElementById('type-select');
    const posSelect = document.getElementById('position-select');
    
    [typeSelect, posSelect].forEach(select => {
        if (select) {
            select.addEventListener('change', () => {
                updateTopTableBonuses();  // 判定上方三項加成
                updateStatLabels();       // 判定打者/投手表頭
                updateConditionAndGear(); // 判定裝備/狀態的 supreme 倍率
                updateChemistry();        // 更新視窗內的默契
                calculateSubtotals();     // 執行全面計算
            });
        }
    });

    // 🌟 5. 新增：綁定「狀態」與「裝備」的專屬選單
    const statsTable = document.querySelectorAll('.container > table')[1];
    if (statsTable) {
        const condSelect = statsTable.querySelectorAll('tbody tr')[9].querySelector('select');
        const gearSelect = statsTable.querySelectorAll('tbody tr')[10].querySelector('select');

        [condSelect, gearSelect].forEach(select => {
            if (select) {
                select.addEventListener('change', () => {
                    updateConditionAndGear(); // 觸發數值分配
                    calculateSubtotals();     // 重新計算總和
                });
            }
        });
    }

    // 🌟 6. 新增：啟動技能彈出視窗功能
    initModal();
}

// 確保網頁載入完成後，啟動初始化器
document.addEventListener('DOMContentLoaded', initTableColors);
