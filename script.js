// ==========================================
// 🎨 第一區：顏色規則與通用工具
// ==========================================

// 規則 1：大數字顏色更新
function updateNumberColor(element, value) {
    if (isNaN(value)) { element.style.color = ''; return; }
    if (value >= 140) element.style.color = '#ff0000';      // 紅色
    else if (value >= 130) element.style.color = '#ff6600'; // 橘紅色
    else if (value >= 120) element.style.color = '#ff9933'; // 橘色
    else if (value >= 100) element.style.color = '#dda300'; // 金黃色
    else if (value >= 80) element.style.color = '#c09300';  // 暗黃色
    else if (value >= 65) element.style.color = '#908070';  // 灰褐色
    else element.style.color = '#808080';                   // 灰色
}

// 規則 2：小數字顏色更新
function updateNumberColor2(element, value) {
    if (isNaN(value)) { element.style.color = ''; return; }
    if (value >= 21) element.style.color = '#ff0000';       // 紅色
    else if (value >= 11) element.style.color = '#ff9933';  // 橘色
    else element.style.color = '#ffffff';                   // 白色
}

// 規則 3：正負數字顏色更新
function updateNumberColor3(element, value) {
    if (isNaN(value)) { element.style.color = ''; return; }
    if (value > 0) element.style.color = '#00ff00';         // 綠色 (正向提升)
    else if (value < 0) element.style.color = '#ff0000';    // 紅色 (負面扣除)
    else element.style.color = '#ffffff';                   // 白色 (無變化)
}

// 負責判斷並派發給對應的顏色函數
function applyColorRule(element, rule) {
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

// 防呆機制：強制限制輸入框的最大/最小值
function enforceMinMax(element) {
    if (element.tagName !== 'INPUT' || element.type !== 'number' || element.value === '') return;
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
// 📊 第二區：表頭與視覺外觀更新
// ==========================================

// 切換打者/投手表頭 (包含主畫面與技能設定視窗)
function updateStatLabels() {
    const posSelect = document.getElementById('position-select');
    const statsTable = document.querySelectorAll('.container > table')[1];
    const modalTable = document.querySelector('.modal-overlay table'); 
    
    if (!posSelect || !statsTable || !modalTable) return;

    const isPitcher = ['SP', 'RP', 'CP'].includes(posSelect.value);
    const labels = isPitcher 
        ? ['控球', '球威', '體力', '直球', '變化'] 
        : ['接觸', '力量', '選球', '速度', '守備'];

    // 1. 更新主畫面表頭
    const mainHeaders = statsTable.querySelectorAll('thead th');
    for (let i = 0; i < 5; i++) {
        if (mainHeaders[i + 2]) mainHeaders[i + 2].innerText = labels[i];
    }

    // 2. 更新技能設定視窗表頭
    const modalHeaders = modalTable.querySelectorAll('thead th');
    for (let i = 0; i < 5; i++) {
        if (modalHeaders[i + 2]) modalHeaders[i + 2].innerText = labels[i];
    }
}

// 動態切換表頭與總結列的背景顏色 (白金狀態變色)
function updateHeaderColor() {
    const topTable = document.querySelectorAll('.container > table')[0];
    if (!topTable) return;
    
    const gradeSelect = topTable.querySelectorAll('select')[0];
    const themeElements = document.querySelectorAll('.container table th, .summary-row td, .modal-overlay th');
    
    if (gradeSelect.value === 'diamond') {
        themeElements.forEach(el => el.style.backgroundColor = '#003f7f'); // 深藍色
    } else {
        themeElements.forEach(el => el.style.backgroundColor = ''); // 恢復預設
    }
}


// ==========================================
// ⚙️ 第三區：數值自動分配與邏輯判定
// ==========================================

// 自動計算上方表格加成 (黑鑽、團隊、指導球員)
function updateTopTableBonuses() {
    const typeSelect = document.getElementById('type-select');
    const posSelect = document.getElementById('position-select');
    const topTable = document.querySelectorAll('.container > table')[0];
    
    if (!typeSelect || !posSelect || !topTable) return;

    const pType = typeSelect.value;
    const pPos = posSelect.value;
    const pGrade = topTable.querySelectorAll('select')[0].value; 

    const bdInput = topTable.querySelectorAll('input[type="number"]')[0];      
    const setDeckInput = topTable.querySelectorAll('input[type="number"]')[1]; 
    const mentorSelect = topTable.querySelectorAll('select')[2];               

    // 1. 黑鑽判定
    let bdValue = 0;
    if (pGrade === 'blackDiamond') {
        if (['vintage', 'signature'].includes(pType)) bdValue = 1;
        else if (pType === 'supreme') bdValue = 2;
        else if (pType === 'legend') bdValue = 3;
    }
    bdInput.value = bdValue;

    // 2. 團隊加成判定
    let setDeckValue = 10; 
    if (pGrade === 'blackDiamond') {
        if (['regular', 'vintage', 'legend'].includes(pType)) setDeckValue += 1;
        else if (['prime', 'signature'].includes(pType)) setDeckValue += 2;
    }
    if (pType === 'signature') setDeckValue *= 2; 
    setDeckInput.value = setDeckValue;

    // 3. 指導球員判定
    let mentorValue = 0;
    if (['legend', 'supreme'].includes(pType)) {
        mentorValue = 0;
    } else if (['regular', 'vintage'].includes(pType)) {
        mentorValue = 1;
    } else if (pType === 'prime') {
        mentorValue = 3;
    } else if (pType === 'signature') {
        const batters = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];
        const pitchers = ['SP', 'RP', 'CP'];
        if (batters.includes(pPos)) mentorValue = 3;
        else if (pitchers.includes(pPos)) mentorValue = 2;
    }
    mentorSelect.value = mentorValue; 
}

// 自動分配「狀態」與「裝備」數值
function updateConditionAndGear() {
    const typeSelect = document.getElementById('type-select');
    const statsTable = document.querySelectorAll('.container > table')[1];
    if (!typeSelect || !statsTable) return;

    const pType = typeSelect.value;
    const rows = statsTable.querySelectorAll('tbody tr');
    const conditionRow = rows[9]; 
    const gearRow = rows[10];     

    // 1. 狀態處理
    const conditionSelect = conditionRow.querySelector('select');
    const conditionInputs = conditionRow.querySelectorAll('input[type="number"]');
    const option6 = conditionSelect.querySelector('option[value="6"]');

    if (pType === 'supreme') {
        option6.hidden = false;
        option6.disabled = false;
    } else {
        option6.hidden = true;
        option6.disabled = true;
        if (conditionSelect.value === '6') conditionSelect.value = '3'; 
    }

    const condValue = parseInt(conditionSelect.value) || 0;
    conditionInputs.forEach(input => {
        input.value = condValue;
        applyColorRule(input, 'posneg');
    });

    // 2. 裝備處理
    const gearSelect = gearRow.querySelector('select');
    const gearInputs = gearRow.querySelectorAll('input[type="number"]');
    let gearValue = parseInt(gearSelect.value) || 0;

    if (pType === 'supreme') gearValue *= 2;

    for (let i = 0; i < 5; i++) {
        gearInputs[i].value = (i < 3) ? gearValue : 0;
        applyColorRule(gearInputs[i], 'posneg');
    }
}


// ==========================================
// 🧮 第四區：核心計算引擎
// ==========================================
function calculateSubtotals() {
    const tables = document.querySelectorAll('.container > table');
    if (tables.length < 2) return;
    
    const topTable = tables[0];
    const statsTable = tables[1];
    
    // --- A. 抓取上方表格的全域加成 (需判斷勾選) ---
    const topHeadCheckboxes = topTable.querySelectorAll('thead input[type="checkbox"]');
    const topRow = topTable.querySelector('tbody tr');
    
    const mentorActive = topHeadCheckboxes[0].checked;
    const blackActive = topHeadCheckboxes[1].checked;
    const setDeckActive = topHeadCheckboxes[2].checked;

    const mentor = (parseInt(topRow.querySelectorAll('select')[2].value) || 0) * (mentorActive ? 1 : 0);
    const blackDiamond = (parseInt(topRow.querySelectorAll('input[type="number"]')[0].value) || 0) * (blackActive ? 1 : 0);
    const setDeck = (parseInt(topRow.querySelectorAll('input[type="number"]')[1].value) || 0) * (setDeckActive ? 1 : 0);
    
    const globalBonus = mentor + blackDiamond + setDeck;

    // --- B. 準備記錄與特別訓練預計算 ---
    let rowTotals = { basicStats: 0, gradeIncrease: 0, development: 0, sum1: 0, trainer: 0, sum2: 0, sum3: 0 };
    const rows = statsTable.querySelectorAll('tbody tr');

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

    let stLevel = parseInt(rows[5].querySelector('select').value) || 0;
    let currentBonus = stBonuses[stLevel] || [0, 0, 0];

    let rankData = [];
    for (let i = 0; i < 5; i++) {
        let base = parseInt(rows[0].querySelectorAll('input[type="number"]')[i].value) || 0;
        let dev = parseInt(rows[3].querySelectorAll('input[type="number"]')[i].value) || 0;
        rankData.push({ index: i, base: base, dev: dev });
    }

    rankData.sort((a, b) => {
        if (b.dev !== a.dev) return b.dev - a.dev;     
        if (b.base !== a.base) return b.base - a.base; 
        return a.index - b.index;                      
    });

    let finalStValues = [0, 0, 0, 0, 0];
    finalStValues[rankData[0].index] = currentBonus[0]; 
    finalStValues[rankData[1].index] = currentBonus[1]; 
    finalStValues[rankData[2].index] = currentBonus[2]; 

    let stInputs = rows[5].querySelectorAll('input[type="number"]');
    for (let i = 0; i < 5; i++) {
        stInputs[i].value = finalStValues[i];
        applyColorRule(stInputs[i], 'small'); 
    }

    // --- C. 抓取下方表格並逐欄計算 ---
    for (let col = 0; col < 5; col++) {
        const adjActive = rows[1].querySelector('input[type="checkbox"]').checked;
        const devActive = rows[3].querySelector('input[type="checkbox"]').checked;
        const stActive = rows[5].querySelector('input[type="checkbox"]').checked; 
        const trainerActive = rows[6].querySelector('input[type="checkbox"]').checked;
        const condActive = rows[9].querySelector('input[type="checkbox"]').checked;
        const gearActive = rows[10].querySelector('input[type="checkbox"]').checked;
        const skillActive = rows[11].querySelector('input[type="checkbox"]').checked;

        // 🌟 1. 計算 [基本+階級+強化]
        // 先抓出「原始數值 (raw)」用來計算最右邊的總和，再乘上勾選狀態用來計算下方的大總和
        let basicStats = parseInt(rows[0].querySelectorAll('input[type="number"]')[col].value) || 0;
        
        let rawAdjustment = parseInt(rows[1].querySelectorAll('input[type="number"]')[col].value) || 0;
        let adjustment = rawAdjustment * (adjActive ? 1 : 0);
        
        let rawGradeIncrease = parseInt(rows[2].querySelectorAll('input[type="number"]')[col].value) || 0;
        let gradeIncrease = rawGradeIncrease; 
        
        let rawDevelopment = parseInt(rows[3].querySelectorAll('input[type="number"]')[col].value) || 0;
        let development = rawDevelopment * (devActive ? 1 : 0);
        
        let sum1 = basicStats + adjustment + gradeIncrease + development;
        let targetCell1 = rows[4].querySelectorAll('td')[col + 1];
        targetCell1.innerText = sum1;
        applyColorRule(targetCell1, 'large');

        // 🌟 2. 計算 [一般陣容能力值]
        let rawSpecialTraining = parseInt(rows[5].querySelectorAll('input[type="number"]')[col].value) || 0;
        let specialTraining = rawSpecialTraining * (stActive ? 1 : 0);
        
        let rawTrainer = parseInt(rows[6].querySelectorAll('input[type="number"]')[col].value) || 0;
        let trainer = rawTrainer * (trainerActive ? 1 : 0);
        
        let sum2 = sum1 + specialTraining + trainer + globalBonus;
        let targetCell2 = rows[7].querySelectorAll('td')[col + 1];
        targetCell2.innerText = sum2;
        applyColorRule(targetCell2, 'large');

        // 🌟 3. 計算 [最高登板能力值]
        let rawCondition = parseInt(rows[9].querySelectorAll('input[type="number"]')[col].value) || 0;
        let condition = rawCondition * (condActive ? 1 : 0);
        
        let rawGear = parseInt(rows[10].querySelectorAll('input[type="number"]')[col].value) || 0;
        let gear = rawGear * (gearActive ? 1 : 0);
        
        let rawSkill = parseInt(rows[11].querySelectorAll('input[type="number"]')[col].value) || 0;
        let skill = rawSkill * (skillActive ? 1 : 0);

        let sum3 = sum2 + condition + gear + skill;
        let targetCell3 = rows[12].querySelectorAll('td')[col + 1];
        targetCell3.innerText = sum3;
        applyColorRule(targetCell3, 'large');

        // 🌟 4. 累加到 rowTotals (最右側的「值」)
        // 注意：這裡我們改用 raw 開頭的原始變數！
        // 這樣就算沒勾選(乘出來是0)，最右邊的值還是會老老實實地幫你加總原始數字。
        rowTotals.basicStats += basicStats;
        rowTotals.gradeIncrease += rawGradeIncrease;
        rowTotals.development += rawDevelopment;
        rowTotals.sum1 += sum1; 
        rowTotals.trainer += rawTrainer;
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
// 🛠️ 第五區：技能設定視窗 (Modal) 專屬邏輯
// ==========================================

// 自動分配默契數值
function updateChemistry() {
    const posSelect = document.getElementById('position-select');
    const modal = document.querySelector('.modal-overlay');
    if (!posSelect || !modal) return;

    const chemSelect = modal.querySelector('tbody tr:nth-child(1) select');
    let chemValue = 0;

    if (chemSelect && chemSelect.value === 'none') {
        chemValue = 0;
    } else {
        const isPitcher = ['SP', 'RP', 'CP'].includes(posSelect.value);
        chemValue = isPitcher ? 6 : 7; 
        if (chemSelect && chemSelect.value === 'legend') {
            chemValue += 1;
        }
    }

    const chemInputs = modal.querySelectorAll('tbody tr:nth-child(1) input[type="number"]');
    chemInputs.forEach(input => {
        input.value = chemValue;
        applyColorRule(input, 'small'); 
    });
}

// 技能視窗初始化
function initModal() {
    const modal = document.querySelector('.modal-overlay');
    const mainStatsTable = document.querySelectorAll('.container > table')[1];
    
    if (!modal || !mainStatsTable) return;

    const openBtn = mainStatsTable.querySelectorAll('tbody tr')[11].querySelector('.setting-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const submitBtn = modal.querySelector('.submit-btn');
    const modalRows = modal.querySelectorAll('tbody tr');

    // 綁定視窗內的即時顏色變化
    modalRows.forEach((row, index) => {
        let rule = (index === 4) ? 'posneg' : 'small'; 
        const inputs = row.querySelectorAll('input[type="number"]');

        inputs.forEach(input => {
            input.addEventListener('change', () => {
                enforceMinMax(input);
                applyColorRule(input, rule);
            });
            input.addEventListener('input', () => applyColorRule(input, rule));
        });
    });

    // 1. 打開視窗
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        updateChemistry(); 
        modalRows.forEach((row, index) => {
            let rule = (index === 4) ? 'posneg' : 'small';
            row.querySelectorAll('input[type="number"]').forEach(input => applyColorRule(input, rule));
        });
    });

    // 2. 關閉視窗 (取消)
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');

    // 3. 完成並寫入主畫面
    submitBtn.addEventListener('click', () => {
        const skillRowMain = mainStatsTable.querySelectorAll('tbody tr')[11];
        const skillInputsMain = skillRowMain.querySelectorAll('input[type="number"]');

        for (let col = 0; col < 5; col++) {
            let colSum = 0;
            modalRows.forEach(row => {
                const isChecked = row.querySelector('input[type="checkbox"]').checked;
                if (isChecked) {
                    let val = parseInt(row.querySelectorAll('input[type="number"]')[col].value) || 0;
                    colSum += val;
                }
            });
            skillInputsMain[col].value = colSum;
            applyColorRule(skillInputsMain[col], 'small'); 
        }
        calculateSubtotals(); 
        modal.style.display = 'none'; 
    });

    // 4. 默契選單與勾選箱連動 
    const chemSelect = modal.querySelector('tbody tr:nth-child(1) select');
    if (chemSelect) chemSelect.addEventListener('change', updateChemistry);

    const modalSelectAll = modal.querySelector('thead input[type="checkbox"]');
    const modalBodyChecks = modal.querySelectorAll('tbody input[type="checkbox"]');
    if (modalSelectAll) {
        modalSelectAll.addEventListener('change', () => {
            modalBodyChecks.forEach(cb => cb.checked = modalSelectAll.checked);
        });
    }

    // 5. 歸零按鈕邏輯
    const resetBtns = modal.querySelectorAll('.reset-row-btn');
    resetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const rowIndex = Array.from(modalRows).indexOf(row);
            let rule = (rowIndex === 4) ? 'posneg' : 'small'; 
            
            row.querySelectorAll('input[type="number"]').forEach(input => {
                input.value = 0; 
                applyColorRule(input, rule); 
            });
        });
    });
}


// ==========================================
// 🔄 第六區：系統初始化與事件綁定
// ==========================================

// 強制全場刷新函數 (解決複製分頁問題，純做事不綁定)
function forceRefreshAll() {
    updateTopTableBonuses();
    updateStatLabels();
    updateConditionAndGear();
    updateHeaderColor();
    calculateSubtotals(); // 強制算一次，確保勾選箱生效
    
    // 重新為所有格子補上顏色
    const rows = document.querySelectorAll('tr.rule-large, tr.rule-small, tr.rule-posneg, .modal-overlay tbody tr');
    rows.forEach((row, index) => {
        let rule = '';
        if (row.classList.contains('rule-large')) rule = 'large';
        else if (row.classList.contains('rule-small')) rule = 'small';
        else if (row.classList.contains('rule-posneg')) rule = 'posneg';
        else if (row.closest('.modal-overlay')) rule = (index === 4) ? 'posneg' : 'small';

        if (rule) {
            row.querySelectorAll('input[type="number"], select').forEach(el => applyColorRule(el, rule));
        }
    });
    
    calculateSubtotals(); // 最終計算
}

function initTableColors() {
    // 統一抓取表格，避免重複宣告
    const topTable = document.querySelectorAll('.container > table')[0];
    const statsTable = document.querySelectorAll('.container > table')[1];

    // 1. 下方表格輸入綁定
    const rows = statsTable.querySelectorAll('tbody tr.rule-large, tbody tr.rule-small, tbody tr.rule-posneg');
    rows.forEach(row => {
        let rule = '';
        if (row.classList.contains('rule-large')) rule = 'large';
        if (row.classList.contains('rule-small')) rule = 'small';
        if (row.classList.contains('rule-posneg')) rule = 'posneg';

        row.querySelectorAll('input[type="number"], select, td:not(:first-child)').forEach(el => {
            if (el.type === 'checkbox' || el.tagName === 'TD') return;
            el.addEventListener('change', () => { enforceMinMax(el); applyColorRule(el, rule); calculateSubtotals(); });
            el.addEventListener('input', () => { applyColorRule(el, rule); calculateSubtotals(); });
        });
    });

    // 2. 上方表格輸入綁定
    const gradeSelect = topTable.querySelectorAll('select')[0]; 
    topTable.querySelectorAll('input[type="number"], select').forEach(el => {
        el.addEventListener('change', () => {
            if (el === gradeSelect) { updateTopTableBonuses(); updateHeaderColor(); }
            enforceMinMax(el); calculateSubtotals(); 
        });
        el.addEventListener('input', () => calculateSubtotals());
    });

    // 3. 最上方的「球隊」、「類型」與「位置」選單綁定
    const teamSelect = document.getElementById('team-select');
    if (teamSelect) {
        teamSelect.addEventListener('change', () => {
            updateThemeColor(); // 🌟 當球隊改變時，觸發變色
            // (未來這裡還可以加入切換球隊後，重新篩選球員名單的邏輯)
        });
    }
    ['type-select', 'position-select'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', () => {
                updateTopTableBonuses();  
                updateStatLabels();       
                updateConditionAndGear(); 
                updateChemistry();        
                calculateSubtotals();     
            });
        }
    });

    // 4. 狀態與裝備選單綁定
    const condSelect = statsTable.querySelectorAll('tbody tr')[9].querySelector('select');
    const gearSelect = statsTable.querySelectorAll('tbody tr')[10].querySelector('select');
    [condSelect, gearSelect].forEach(select => {
        if (select) select.addEventListener('change', () => { updateConditionAndGear(); calculateSubtotals(); });
    });

    // 5. 啟動技能彈出視窗功能
    initModal();

    // 6. 全選/全不選邏輯 (主畫面)
    const mainSelectAll = statsTable.querySelector('thead input[type="checkbox"]');
    if (mainSelectAll) {
        mainSelectAll.addEventListener('change', () => {
            const allChecks = [
                ...topTable.querySelectorAll('thead input[type="checkbox"]'),
                ...statsTable.querySelectorAll('tbody input[type="checkbox"]')
            ];
            allChecks.forEach(cb => cb.checked = mainSelectAll.checked);
            calculateSubtotals(); 
        });
    }

    // 7. 獨立勾選箱綁定
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb !== mainSelectAll && !cb.closest('.modal-overlay')) {
            cb.addEventListener('change', calculateSubtotals);
        }
    });
}

// ==========================================
// 🌐 第七區：外部資料 (JSON) 與介面連動
// ==========================================
let teamsData = {}; // 準備一個空物件來裝 teams.json 的資料

// 1. 讀取 teams.json 並生成下拉選單
async function loadTeams() {
    try {
        // 向同一個資料夾下的 teams.json 請求資料
        const response = await fetch('teams.json');
        teamsData = await response.json();
        
        const teamSelect = document.getElementById('team-select');
        if (!teamSelect) return;

        // 清空選單並重新填入
        teamSelect.innerHTML = '<option value="">請選擇球隊...</option>';
        
        // 迴圈讀取 JSON 裡面的每一個球隊代號 (NYY, ATH...)
        for (const teamKey in teamsData) {
            const option = document.createElement('option');
            option.value = teamKey;
            option.textContent = teamKey; 
            teamSelect.appendChild(option);
        }
    } catch (error) {
        console.error("無法讀取 teams.json！請確認檔案路徑，或是否遇到 CORS 跨網域安全阻擋。", error);
    }
}

// 2. 切換球隊時更新主題顏色
function updateThemeColor() {
    const teamSelect = document.getElementById('team-select');
    const container = document.querySelector('.container');
    const modalContent = document.querySelector('.modal-content');
    const topRow = document.querySelector('.row'); 
    
    if (!teamSelect || !container || !modalContent || !topRow) return;

    const selectedTeam = teamSelect.value;
    
    if (selectedTeam && teamsData[selectedTeam]) {
        const themeColor = teamsData[selectedTeam].themeColor;
        const secondaryColor = teamsData[selectedTeam].secondaryColor;
        
        // 只負責替換顏色，形狀與間距交給 CSS 處理
        container.style.backgroundColor = themeColor;
        modalContent.style.backgroundColor = themeColor;
        topRow.style.backgroundColor = secondaryColor;
        
    } else {
        // 切換回預設狀態時，清空行內樣式，讓它恢復 CSS 的預設背景色 (#3f3f3f 等)
        container.style.backgroundColor = ''; 
        modalContent.style.backgroundColor = '';
        topRow.style.backgroundColor = '';
    }
}

// ==========================================
// 🚀 啟動區：乾淨俐落的啟動邏輯 (已升級為非同步 async)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    
    // 🌟 先等待 JSON 資料完全讀取並生成選單後，再做後續綁定
    await loadTeams(); 
    
    initTableColors();   // 1. 先綁定所有耳朵 (Listeners)
    forceRefreshAll();   // 2. 第一次畫面載入的強制刷新
    
    setTimeout(forceRefreshAll, 150); 
});
