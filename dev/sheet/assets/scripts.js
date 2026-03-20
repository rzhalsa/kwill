const folderInput = document.getElementById("folderInput");
const folderLabel = document.getElementById("selectedFolder");
const characterSelect = document.getElementById("characterSelect");
const saveButton = document.getElementById("saveButton");

let characters = {};

// Reset input to allow reselect
folderInput.addEventListener("click", () => {
    folderInput.value = null;
});

// Handle folder selection
folderInput.addEventListener("change", () => {
    const files = Array.from(folderInput.files);
    if (files.length > 0) {
        const folderid = files[0].webkitRelativePath.split("/")[0];
        folderLabel.textContent = `Selected folder: ${folderid}`;

        const jsonFiles = files.filter(f => f.name.endsWith(".json"));
        characters = {};

        jsonFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    characters[file.name] = JSON.parse(e.target.result);
                    populateDropdown();
                } catch (err) {
                    console.error(`Error parsing ${file.name}:`, err);
                }
            };
            reader.readAsText(file);
        });
    } else {
        folderLabel.textContent = "No folder selected";
        characters = {};
        populateDropdown();
    }
});

function populateDropdown() {
    characterSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "New Character";
    placeholder.selected = true;
    placeholder.id = "placeholder-option";
    characterSelect.appendChild(placeholder);

    for (let fileName in characters) {
        const option = document.createElement("option");
        option.value = fileName;
        const charName = characters[fileName].name;
        option.textContent = (typeof charName === 'string' ? charName : null) || fileName.replace(".json", "");
        characterSelect.appendChild(option);
    }
}

characterSelect.addEventListener("change", () => {
    const selected = characterSelect.value;
    clearSheet();
    if (selected && characters[selected]) {
        populateSheet();
    }
});

saveButton.addEventListener("click", (e) => {
    e.preventDefault();

    let selected = characterSelect.value;
    const container = document.getElementById('character-sheet');

    const characterData = populateJsonFromHtml(characters[selected] || {});

    const nameEl = container.querySelector('#name_value');
    const charName = nameEl?.value?.trim();

    if (!charName) {
        alert("Please fill in a character name before saving.");
        return;
    }

    if (!selected || !characters[selected]) {
        selected = charName + ".json";
    }

    characters[selected] = characterData;
    populateDropdown();
    characterSelect.value = selected;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = selected;
    a.click();
});


// Clears the character sheet
function clearSheet() {
    const container = document.getElementById('character-sheet');
    if (!container) return;

    container.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.id?.endsWith('_calculated')) return;
        if (el.hasAttribute('data-label')) return;
        const type = (el.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') el.checked = false;
        else el.value = '';
    });

    container.querySelectorAll('*').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        const tag = el.tagName.toUpperCase();
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && el.children.length === 0) {
            el.textContent = '';
        }
    });

    clearAllPanels();
}


function setNested(json, parts, value, overwrite = false) {
    if (parts.length === 1) {
        const existing = json[parts[0]];
        if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
        if (overwrite || existing === undefined || existing === '') {
            json[parts[0]] = value;
        }
        return;
    }

    const field = parts[parts.length - 1];
    const stat = parts[parts.length - 2];
    const objectId = parts.slice(0, -2).join('_');

    if (!objectId) {
        if (!json[stat]) json[stat] = {};
        const existing = json[stat][field];
        if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
        if (overwrite || existing === undefined || existing === '') {
            json[stat][field] = value;
        }
        return;
    }

    if (!json[objectId]) json[objectId] = { object_id: objectId };
    if (!json[objectId][stat]) json[objectId][stat] = {};

    const existing = json[objectId][stat][field];
    if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
    if (existing !== undefined && existing !== '' && value === '') return;
    if (overwrite || existing === undefined || existing === '') {
        json[objectId][stat][field] = value;
    }
}


function populateSheet() {
    const selected = characterSelect.value;
    if (!selected || !characters[selected]) return;

    const characterData = characters[selected];

    function setElementValue(el, value) {
        if (!el) return;
        if (el.hasAttribute('data-label')) return;
        const tag = el.tagName.toUpperCase();
        if (tag === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
            el.checked = value === true || value === 'true';
        } else if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
            el.value = value ?? '';
        } else {
            el.textContent = value ?? '';
        }
    }

    function walkObject(obj, parentId = null) {
        if (!obj || typeof obj !== 'object') return;

        let effectiveParent;
        if (parentId === null && obj.object_id === 'character') {
            effectiveParent = null;
        } else {
            effectiveParent = obj.object_id ?? parentId;
        }

        Object.keys(obj).forEach(key => {
            if (key === 'object_id') return;
            if (key === 'panels') return;
            const value = obj[key];

            const fullId = effectiveParent ? `${effectiveParent}_${key}` : key;
            const elCalculated = document.getElementById(`${fullId}_calculated`);
            const elValue = document.getElementById(`${fullId}_value`);
            const elNormal = document.getElementById(fullId);

            if (value && typeof value === 'object' && value.object_id === 'operation') {
                const result = evaluateOperation(value, characterData);
                if (elCalculated) setElementValue(elCalculated, result);
                else if (elValue) setElementValue(elValue, result);
                else if (elNormal) setElementValue(elNormal, result);

            } else if (value && typeof value === 'object') {
                walkObject(value, fullId);

            } else {
                if (elCalculated) setElementValue(elCalculated, value);
                else if (elValue) setElementValue(elValue, value);
                else if (elNormal) setElementValue(elNormal, value);
            }
        });
    }

    walkObject(characterData);

    // Second pass: re-evaluate all _calculated fields from their default formula
    document.querySelectorAll('[id$="_calculated"]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        const formula = el.defaultValue?.trim();
        if (!formula?.startsWith('=')) return;

        const formulaText = formula.slice(1).trim();
        let operationObj;

        if (formulaText.startsWith('>')) {
            operationObj = {
                object_id: 'operation',
                operation_type: 'mirror',
                condition: formulaText.slice(1).trim()
            };
        } else {
            const condMatch = formulaText.match(/^([a-zA-Z_][\w]*)\s*\[([^\]]*)\]\s*\[([^\]]*)\]$/);
            if (condMatch) {
                const parseList = (str) => str.split(',').map(s => {
                    const t = s.trim();
                    const n = parseFloat(t);
                    return isNaN(n) ? t : n;
                });
                operationObj = {
                    object_id: 'operation',
                    operation_type: 'conditional',
                    condition: condMatch[1].trim(),
                    thresholds: parseList(condMatch[2]),
                    results: parseList(condMatch[3])
                };
            } else {
                operationObj = {
                    object_id: 'operation',
                    operation_type: '=',
                    value: formulaText
                };
            }
        }

        el.value = evaluateOperation(operationObj, characterData);
    });

    loadAllPanels(characterData);
}


function populateJsonFromHtml(existingJson = {}) {
    const container = document.getElementById('character-sheet');
    if (!container) return structuredClone(existingJson);

    const base = existingJson.object_id === 'character'
        ? structuredClone(existingJson)
        : { object_id: 'character', ...structuredClone(existingJson) };

    container.querySelectorAll('[id]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;

        let id = el.id?.trim();
        if (!id) return;

        let value;
        if (el.type === 'checkbox' || el.type === 'radio') {
            value = el.checked;
        } else {
            value = el.value !== undefined ? el.value : (el.textContent?.trim() ?? '');
        }

        const isCalculated = id.endsWith('_calculated');
        const isValue = id.endsWith('_value');
        const isName = id.endsWith('_name');

        if (isCalculated) id = id.slice(0, -'_calculated'.length);
        else if (isValue) id = id.slice(0, -'_value'.length);
        else if (isName) {
            id = id.slice(0, -'_name'.length);
            if (!base[id]) base[id] = { object_id: id };
            base[id].name = value;
            return;
        }

        if (isCalculated) {
            const trimmed = (value + '').trim();
            if (!trimmed.startsWith('=')) return;

            if (trimmed.startsWith('=>')) {
                value = {
                    object_id: 'operation',
                    operation_type: 'mirror',
                    condition: trimmed.slice(2).trim()
                };
            } else {
                const formulaText = trimmed.slice(1).trim();
                const condMatch = formulaText.match(/^([a-zA-Z_][\w]*)\s*\[([^\]]*)\]\s*\[([^\]]*)\]$/);

                if (condMatch) {
                    const parseList = (str) => str.split(',').map(s => {
                        const t = s.trim();
                        const n = parseFloat(t);
                        return isNaN(n) ? t : n;
                    });
                    value = {
                        object_id: 'operation',
                        operation_type: 'conditional',
                        condition: condMatch[1].trim(),
                        thresholds: parseList(condMatch[2]),
                        results: parseList(condMatch[3])
                    };
                } else {
                    value = {
                        object_id: 'operation',
                        operation_type: '=',
                        value: formulaText
                    };
                }
            }
        }

        const parts = id.split('_');
        setNested(base, parts, value, isCalculated || isValue);
    });

    saveAllPanels(base);

    return base;
}


// ── Dynamic Panels ───────────────────────────────────────────────────────────
//
// Convention:
//   HTML panel container id : "{name}_panel"
//   HTML add button id      : "{name}_button"
//   HTML template id        : "{name}_template"
//   JSON saved under        : base.panels.{name}  →  array of objects
//
// Fields inside each template block use the same id-based conventions as the
// main sheet: id="name_value", id="uses_calculated", id="source_name", etc.
// On cloning, ids are stripped and replaced with data-field-key to prevent
// duplicate id collisions in the live DOM. The template keeps ids for clarity.
//
// Panels are auto-detected from any div whose id ends in "_panel".
// To add a new panel: add HTML (_panel div, _button, _template). Nothing else.

function getPanelIds() {
    return Array.from(document.querySelectorAll('[id$="_panel"]'))
        .map(el => el.id.slice(0, -'_panel'.length))
        .filter(name => name.length > 0);
}

// Wire up all + buttons after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    getPanelIds().forEach(panelId => {
        const btn = document.getElementById(`${panelId}_button`);
        if (btn) {
            btn.addEventListener('click', () => addPanelBlock(panelId));
        } else {
            console.warn(`Panel button not found: ${panelId}_button`);
        }
    });
});

function createPanelBlock(panelId, data = {}) {

    const template = document.getElementById(`${panelId}_template`);
    if (!template) {
        console.warn(`Panel template not found: ${panelId}_template`);
        return null;
    }

    const clone = template.content.cloneNode(true).firstElementChild;
    if (!clone) {
        console.warn(`Template cloneNode returned null for: ${panelId}_template — template may be empty`);
        return null;
    }

    // Read ids, populate values, then replace id with data-field-key to avoid
    // duplicate id collisions in the live DOM
    clone.querySelectorAll('[id]').forEach(el => {
        let key = el.id.trim();
        const isValue = key.endsWith('_value');
        const isName = key.endsWith('_name');
        const isCalculated = key.endsWith('_calculated');

        if (isValue) key = key.slice(0, -'_value'.length);
        else if (isName) key = key.slice(0, -'_name'.length);
        else if (isCalculated) key = key.slice(0, -'_calculated'.length);
        else { el.removeAttribute('id'); return; }

        // Store resolved key for saving, remove id from live DOM
        el.dataset.fieldKey = key;
        el.removeAttribute('id');

        if (data[key] === undefined) return;

        const tag = el.tagName.toUpperCase();
        if (tag === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
            el.checked = data[key] === true || data[key] === 'true';
        } else if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
            el.value = data[key] ?? '';
        } else {
            el.textContent = data[key] ?? '';
        }
    });

    clone.querySelector('.panel-remove-btn')?.addEventListener('click', () => {
        const nameInput = clone.querySelector('[data-field-key="name"]');
        const name = nameInput?.value?.trim() || '';
        const label = clone.querySelector('.panel-remove-btn')?.dataset.deleteLabel || 'entry';
        if (confirm(`Delete ${label} ${name}?`)) {
            tooltip.remove();
            clone.remove();
        }
    });


    // Wire up expand/collapse button
    const expandBtn = clone.querySelector('.panel-expand-btn');
    const expandedSection = clone.querySelector('.panel-expanded');

    // Show savetype only when Spell Save is selected
    const attackSaveSelect = clone.querySelector('[data-field-key="attacksave"]');
    const saveTypeSelect = clone.querySelector('[data-field-key="savetype"]');
    const attackBonusDisplay = clone.querySelector('.attackbonus-display');

    function updateSaveTypeVisibility() {
        const val = attackSaveSelect?.value;

        if (saveTypeSelect)
            saveTypeSelect.style.display = val === 'Spell Save' ? 'inline-block' : 'none';

        if (attackBonusDisplay) {
            if (val === 'Spell Attack') {
                const bonus = document.getElementById('spell_attackBonus_value')?.value?.trim();
                attackBonusDisplay.textContent = bonus ? `+${bonus}` : '';
                attackBonusDisplay.style.display = 'inline';
            } else {
                attackBonusDisplay.style.display = 'none';
            }
        }
    }

    attackSaveSelect?.addEventListener('change', updateSaveTypeVisibility);

    // Also refresh when the main sheet attack bonus field changes
    document.getElementById('spell_attackBonus_value')
        ?.addEventListener('input', updateSaveTypeVisibility);

    setTimeout(updateSaveTypeVisibility, 0);

    // Create uses display element shown in collapsed view
    const usesDisplay = document.createElement('span');
    usesDisplay.style.cssText = 'font-size:11px; color:#555; flex-shrink:0;';

    // Insert uses display after the name input in the main row
    const mainRow = clone.querySelector('.panel-block > div');
    if (mainRow) mainRow.insertBefore(usesDisplay, expandBtn);

    function updateUsesDisplay() {
        const current = clone.querySelector('[data-field-key="uses_current"]');
        const max = clone.querySelector('[data-field-key="uses_max"]');
        const currentVal = current?.value?.trim();
        const maxVal = max?.value?.trim();
        if (currentVal) {
            usesDisplay.textContent = maxVal ? `${currentVal}/${maxVal}` : currentVal;
        } else {
            usesDisplay.textContent = '';
        }
    }

    function updateCollapsedSpells() {
        const damage = clone.querySelector('[data-field-key="damage"]');
        const damageType = clone.querySelector('[data-field-key="damagetype"]');
        const action = clone.querySelector('[data-field-key="action"]');
        const range = clone.querySelector('[data-field-key="range"]');

        const dmgVal = damage?.value?.trim();
        const dmgTypeVal = damageType?.value?.trim();
        const actionVal = action?.value?.trim();
        const rangeVal = range?.value?.trim();

        const dmgDisplay = clone.querySelector('.collapsed-damage');
        const actionDisplay = clone.querySelector('.collapsed-action');
        const rangeDisplay = clone.querySelector('.collapsed-range');

        if (dmgDisplay) {
            if (dmgVal && dmgTypeVal) dmgDisplay.textContent = `${dmgVal} ${dmgTypeVal}`;
            else if (dmgTypeVal) dmgDisplay.textContent = dmgTypeVal;
            else dmgDisplay.textContent = '';
        }
        if (actionDisplay) actionDisplay.textContent = actionVal || '';
        if (rangeDisplay) rangeDisplay.textContent = rangeVal || '';
    }

    clone.addEventListener('input', (e) => {
        const key = e.target.dataset.fieldKey;
        if (['damage', 'damagetype', 'action', 'range'].includes(key)) {
            updateCollapsedSpells();
        }
    });
    clone.addEventListener('change', (e) => {
        const key = e.target.dataset.fieldKey;
        if (['damage', 'damagetype', 'action', 'range'].includes(key)) {
            updateCollapsedSpells();
        }
    });

    setTimeout(updateCollapsedSpells, 0);

    // Update display when uses fields change
    clone.addEventListener('input', (e) => {
        if (e.target.dataset.fieldKey === 'uses_current' || e.target.dataset.fieldKey === 'uses_max') {
            updateUsesDisplay();
        }
    });

    if (expandBtn && expandedSection) {
        expandBtn.addEventListener('click', () => {
            const isOpen = expandedSection.style.display !== 'none';
            expandedSection.style.display = isOpen ? 'none' : 'flex';
            expandBtn.textContent = isOpen ? 'v' : '^';
            tooltip.style.display = 'none'; // hide tooltip when toggling
        });
    }
    // Call once after data is populated
    setTimeout(updateUsesDisplay, 0);

    // Tooltip showing description on hover when collapsed
    const tooltip = document.createElement('div');
    tooltip.style.cssText = [
        'position:fixed',
        'background:#333',
        'color:#fff',
        'font-size:12px',
        'padding:5px 8px',
        'border-radius:4px',
        'max-width:170px',
        'white-space:pre-wrap',
        'pointer-events:none',
        'z-index:9999',
        'display:none'
    ].join(';');
    document.body.appendChild(tooltip);

    clone.addEventListener('mouseenter', (e) => {
        if (expandedSection.style.display !== 'none') return;

        const get = (key) => clone.querySelector(`[data-field-key="${key}"]`)?.value?.trim() || '';

        const manualTooltip = get('tooltip');
        const showStats = clone.querySelector('[data-field-key="showstats"]')?.checked;

        const lines = [];

        if (showStats) {
            const range = get('range');
            const duration = get('duration');
            const action = get('action');
            const attacksave = get('attacksave');
            const savetype = get('savetype');
            const damage = get('damage');
            const damagetype = get('damagetype');
            const areashape = get('areashape');
            const areasize = get('areasize');

            if (action) lines.push(action);
            if (range) lines.push(`Range: ${range}`);
            if (duration) lines.push(`Duration: ${duration}`);

            if (attacksave === 'Spell Attack') {
                const bonus = document.getElementById('spell_attackBonus_value')?.value?.trim();
                if (bonus) lines.push(`Spell Attack Bonus +${bonus}`);
            } else if (attacksave === 'Spell Save') {
                const dc = document.getElementById('spell_saveDc_value')?.value?.trim();
                const saveStr = [dc ? `DC ${dc}` : '', savetype].filter(Boolean).join(' ');
                if (dc || savetype) lines.push(`Spell Save ${saveStr}`);
            }

            const dmgParts = [damage, damagetype && damagetype !== '—' && damagetype !== '' ? damagetype : ''].filter(Boolean);
            if (dmgParts.length) lines.push(dmgParts.join(' '));

            const aoeParts = [areasize, areashape].filter(Boolean);
            if (aoeParts.length) lines.push(`AOE: ${aoeParts.join(' ')}`);
        }

        if (manualTooltip) lines.push(manualTooltip);

        if (!lines.length) return;

        tooltip.textContent = lines.join('\n');
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 12 + 'px';
        tooltip.style.top = e.clientY + 12 + 'px';
    });

    clone.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.clientX + 12 + 'px';
        tooltip.style.top = e.clientY + 12 + 'px';
    });

    clone.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    return clone;
}

function addPanelBlock(panelId, data = {}) {
    const container = document.getElementById(`${panelId}_panel`);
    if (!container) return;
    const block = createPanelBlock(panelId, data);
    if (block) container.appendChild(block);
}

function clearPanel(panelId) {
    const container = document.getElementById(`${panelId}_panel`);
    if (!container) return;
    // Only remove live clones — never touch anything inside a <template>
    Array.from(container.querySelectorAll('.panel-block'))
        .filter(el => !el.closest('template'))
        .forEach(el => el.remove());
}

function loadPanel(panelId, dataArray) {
    clearPanel(panelId);
    if (!Array.isArray(dataArray)) return;
    dataArray.forEach(item => addPanelBlock(panelId, item));
}

function savePanel(panelId) {
    const container = document.getElementById(`${panelId}_panel`);
    if (!container) return null;

    const blocks = Array.from(container.querySelectorAll('.panel-block'))
        .filter(el => !el.closest('template'));
    if (blocks.length === 0) return null;

    return blocks.map(block => {
        const entry = {};
        block.querySelectorAll('[data-field-key]').forEach(el => {
            const key = el.dataset.fieldKey;
            if (!key) return;
            if (el.type === 'checkbox' || el.type === 'radio') {
                entry[key] = el.checked;
            } else {
                entry[key] = el.value !== undefined ? el.value.trim() : (el.textContent?.trim() ?? '');
            }
        });
        return entry;
    });
}

function saveAllPanels(base) {
    const panelsData = {};
    let hasAny = false;
    getPanelIds().forEach(panelId => {
        const data = savePanel(panelId);
        if (data !== null) {
            panelsData[panelId] = data;
            hasAny = true;
        }
    });
    if (hasAny) base.panels = panelsData;
    return base;
}

function loadAllPanels(characterData) {
    if (!characterData.panels) return;
    getPanelIds().forEach(panelId => {
        if (characterData.panels[panelId]) {
            loadPanel(panelId, characterData.panels[panelId]);
        }
    });
}

function clearAllPanels() {
    getPanelIds().forEach(panelId => clearPanel(panelId));
}

// ── End Dynamic Panels ───────────────────────────────────────────────────────


function evaluateOperation(operationObj, jsonData) {
    if (!operationObj || operationObj.object_id !== 'operation') return '';

    function resolveByPath(obj, pathStr) {
        const parts = pathStr.split('_');
        for (let i = parts.length; i >= 1; i--) {
            const key = parts.slice(0, i).join('_');
            const remainder = parts.slice(i);
            if (obj[key] !== undefined) {
                if (remainder.length === 0) return obj[key];
                const nested = resolveByPath(obj[key], remainder.join('_'));
                if (nested !== undefined) return nested;
            }
        }
        return undefined;
    }

    function resolveByKey(obj, key) {
        if (!obj || typeof obj !== 'object') return undefined;
        if (obj[key] !== undefined) return obj[key];
        for (const k in obj) {
            const val = resolveByKey(obj[k], key);
            if (val !== undefined) return val;
        }
        return undefined;
    }

    function resolveVar(name) {
        const clean = name.replace(/_(value|calculated)$/, '');
        let val = resolveByPath(jsonData, clean);
        if (val === undefined) val = resolveByKey(jsonData, clean);
        if (val && typeof val === 'object' && val.object_id === 'operation') {
            val = evaluateOperation(val, jsonData);
        }
        if (val && typeof val === 'object') return 0;
        return (val === undefined || val === '' || val === null) ? 0 : Number(val) || 0;
    }

    function resolveString(name) {
        const clean = name.replace(/_(value|calculated)$/, '');
        let val = resolveByPath(jsonData, clean);
        if (val === undefined) val = resolveByKey(jsonData, clean);
        if (val && typeof val === 'object' && val.object_id === 'operation') {
            val = evaluateOperation(val, jsonData);
        }
        return val ?? '';
    }

    if (operationObj.operation_type === 'mirror') {
        return resolveString(operationObj.condition);
    }

    if (operationObj.operation_type === 'conditional') {
        const condVal = resolveVar(operationObj.condition);
        const thresholds = operationObj.thresholds || [];
        const results = operationObj.results || [];

        let matchIndex = -1;
        for (let i = 0; i < thresholds.length; i++) {
            if (condVal >= parseFloat(thresholds[i])) matchIndex = i;
        }

        return matchIndex === -1 ? '' : (results[matchIndex] ?? '');
    }

    const BUILTINS = new Set([
        'Math', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'sqrt', 'pow',
        'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Number', 'String',
        'Boolean', 'true', 'false', 'null', 'undefined', 'Infinity', 'NaN'
    ]);

    let formula = (operationObj.value ?? '').trim();
    if (!formula) return '';

    formula = formula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
        if (BUILTINS.has(match)) return match;
        return resolveVar(match);
    });

    if (/[^0-9a-zA-Z_+\-*/(). \t]/.test(formula)) {
        console.warn('Unsafe characters in formula:', formula);
        return '';
    }

    try {
        return Function(`"use strict"; return (${formula})`)();
    } catch (err) {
        console.warn('Failed to evaluate formula:', formula, err);
        return '';
    }
}


const PAGE_WIDTH = 816;
const TARGET_FILL = 0.95;  // tighter fit to actual page width

let zoomMode = 'manual'; // 'manual' | 'width' | 'page'
let manualScale = 1.0;

function applyScale(scale) {
    document.documentElement.style.setProperty('--page-scale', scale);
    document.getElementById('zoom_label').value = Math.round(scale * 100) + '%';
}

document.getElementById('zoom_label').addEventListener('change', () => {
    const raw = document.getElementById('zoom_label').value.replace('%', '').trim();
    const parsed = parseFloat(raw) / 100;
    if (!isNaN(parsed) && parsed > 0) {
        zoomMode = 'manual';
        manualScale = Math.round(parsed * 100) / 100;
        updateScale();
    } else {
        // Reset to current scale if invalid
        applyScale(manualScale);
    }
});

function updateScale() {
    if (zoomMode === 'width') {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const availableWidth = window.innerWidth - scrollbarWidth;
        applyScale(availableWidth / PAGE_WIDTH * TARGET_FILL);
    } else if (zoomMode === 'page') {
        const toolbar = document.querySelector('.toolbar');
        const toolbarHeight = toolbar ? toolbar.getBoundingClientRect().height : 0;
        applyScale((window.innerHeight - toolbarHeight) * 0.95 / 1056);
    } else {
        applyScale(manualScale);
    }
}

document.getElementById('zoom_out').addEventListener('click', () => {
    zoomMode = 'manual';
    manualScale = Math.max(0.25, Math.round((manualScale - 0.1) * 10) / 10);
    updateScale();
});

document.getElementById('zoom_in').addEventListener('click', () => {
    zoomMode = 'manual';
    manualScale = Math.min(2.0, Math.round((manualScale + 0.1) * 10) / 10);
    updateScale();
});

document.getElementById('zoom_fit').addEventListener('click', () => {
    if (zoomMode === 'page') {
        zoomMode = 'width';
        document.getElementById('zoom_fit').textContent = 'Fit Page';
    } else {
        zoomMode = 'page';
        document.getElementById('zoom_fit').textContent = 'Fit Width';
    }
    updateScale();
});


window.addEventListener('resize', updateScale);
updateScale();