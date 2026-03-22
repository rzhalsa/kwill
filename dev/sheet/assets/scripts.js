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
    applyPanelOverrides();
});

saveButton.addEventListener("click", (e) => {
    e.preventDefault();

    let selected = characterSelect.value;
    const container = document.getElementById('character-sheet');

    // Disable all panel formula overrides before saving so only raw base
    // values are captured in the JSON. Re-applied after save completes.
    const activeFormulas = new Set();
    document.querySelectorAll('[data-field-key="formula_active"]').forEach(el => {
        if (el.checked) activeFormulas.add(el);
        el.checked = false;
    });
    // Reset any overridden fields back to their base display
    if (selected && characters[selected]) {
        document.querySelectorAll('[data-override-applied]').forEach(el => {
            if (!el.id) return;
            const key = el.id.replace(/_value$/, '');
            const parts = key.split('_');
            let val = characters[selected];
            for (const part of parts) {
                if (val && typeof val === 'object') val = val[part];
                else { val = undefined; break; }
            }
            if (val !== undefined && val !== null && typeof val !== 'object') {
                el.value = val;
                delete el.dataset.overrideApplied;
                delete el.dataset.overrideValue;
            }
        });
    }

    // Re-check so JSON captures correct formula_active state
    activeFormulas.forEach(el => { el.checked = true; });

    const characterData = populateJsonFromHtml(characters[selected] || {});

    // Uncheck again so DOM reset works correctly
    activeFormulas.forEach(el => { el.checked = false; });

    const nameEl = container.querySelector('#name_value');
    const charName = nameEl?.value?.trim();

    if (!charName) {
        alert("Please fill in a character name before saving.");
        applyPanelOverrides();
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

    // Re-enable only the formulas that were active before saving
    activeFormulas.forEach(el => { el.checked = true; });
    applyPanelOverrides();
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


// ── Formula parser helper — shared by populateSheet, auto-refresh, and panel overrides
function parseFormulaToOperation(formulaText) {
    if (formulaText.startsWith('>')) {
        return {
            object_id: 'operation',
            operation_type: 'mirror',
            condition: formulaText.slice(1).trim()
        };
    }

    const condMatch = formulaText.match(/^([a-zA-Z_][\w]*)\s*\[([^\]]*)\]\s*\[([^\]]*)\]$/);
    if (condMatch) {
        const parseList = (str) => str.split(',').map(s => {
            const t = s.trim();
            const n = parseFloat(t);
            return isNaN(n) ? t : n;
        });
        return {
            object_id: 'operation',
            operation_type: 'conditional',
            condition: condMatch[1].trim(),
            thresholds: parseList(condMatch[2]),
            results: parseList(condMatch[3])
        };
    }

    const addMatch = formulaText.match(/^\+([a-zA-Z_][\w]*)((?:\[[^\]]*\])*)/);
    if (addMatch) {
        const addends = [...addMatch[2].matchAll(/\[([^\]]*)\]/g)].map(m => m[1].trim());
        return {
            object_id: 'operation',
            operation_type: '+',
            condition: addMatch[1].trim(),
            addends: addends
        };
    }

    return {
        object_id: 'operation',
        operation_type: '=',
        value: formulaText
    };
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
        el.value = evaluateOperation(parseFormulaToOperation(formula.slice(1).trim()), characterData);
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
            // legacy: handle => mirror prefix
            if (trimmed.startsWith('=>')) {
                value = {
                    object_id: 'operation',
                    operation_type: 'mirror',
                    condition: trimmed.slice(2).trim()
                };
            } else {
                value = parseFormulaToOperation(trimmed.slice(1).trim());
            }
        }

        const parts = id.split('_');
        setNested(base, parts, value, isCalculated || isValue);
    });

    saveAllPanels(base);

    return base;
}


// ── Dynamic Panels ───────────────────────────────────────────────────────────

function getPanelIds() {
    return Array.from(document.querySelectorAll('[id$="_panel"]'))
        .map(el => el.id.slice(0, -'_panel'.length))
        .filter(name => name.length > 0);
}

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

    clone.querySelectorAll('[id]').forEach(el => {
        let key = el.id.trim();
        const isValue = key.endsWith('_value');
        const isName = key.endsWith('_name');
        const isCalculated = key.endsWith('_calculated');

        if (isValue) key = key.slice(0, -'_value'.length);
        else if (isName) key = key.slice(0, -'_name'.length);
        else if (isCalculated) key = key.slice(0, -'_calculated'.length);
        else { el.removeAttribute('id'); return; }

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
            applyPanelOverrides();
        }
    });

    const expandBtn = clone.querySelector('.panel-expand-btn');
    const expandedSection = clone.querySelector('.panel-expanded');

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
    document.getElementById('spell_attackBonus_value')
        ?.addEventListener('input', updateSaveTypeVisibility);
    setTimeout(updateSaveTypeVisibility, 0);

    const usesDisplay = document.createElement('span');
    usesDisplay.style.cssText = 'font-size:11px; color:#555; flex-shrink:0;';

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
        if (['damage', 'damagetype', 'action', 'range'].includes(key)) updateCollapsedSpells();
        if (key === 'uses_current' || key === 'uses_max') updateUsesDisplay();
    });

    clone.addEventListener('change', (e) => {
        const key = e.target.dataset.fieldKey;
        if (['damage', 'damagetype', 'action', 'range'].includes(key)) updateCollapsedSpells();
    });

    setTimeout(updateCollapsedSpells, 0);
    setTimeout(updateUsesDisplay, 0);

    if (expandBtn && expandedSection) {
        expandBtn.addEventListener('click', () => {
            const isOpen = expandedSection.style.display !== 'none';
            expandedSection.style.display = isOpen ? 'none' : 'flex';
            expandBtn.textContent = isOpen ? 'v' : '^';
            tooltip.style.display = 'none';
        });
    }

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

    clone.addEventListener('input', () => applyPanelOverrides());
    clone.addEventListener('change', () => applyPanelOverrides());

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
    applyPanelOverrides();
}

function clearAllPanels() {
    getPanelIds().forEach(panelId => clearPanel(panelId));
}

// ── Panel Formula Overrides ──────────────────────────────────────────────────
// Scans all active panel block formulas and applies visual overrides to
// main sheet fields. Raw JSON values are never modified.
//
// Syntax:
//   =+ fieldName + expr        — adds expr to the base value of fieldName
//   =+ fieldName = expr        — replaces the value of fieldName with expr
//
// expr can include variable names (resolved from panel block, live DOM, or JSON),
// literals, and any JS math expression using BUILTINS.

function applyPanelOverrides() {
    const selected = characterSelect.value;
    if (!selected || !characters[selected]) return;

    const characterData = characters[selected];

    const BUILTINS = new Set([
        'Math', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'sqrt', 'pow',
        'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Number', 'String',
        'Boolean', 'true', 'false', 'null', 'undefined', 'Infinity', 'NaN'
    ]);

    function resolveVar(name, block) {
        const clean = name.replace(/_(value|calculated)$/, '');
        const alias = clean.replace(/^character_/, '');

        // Check live DOM first (main sheet)
        const liveEl = document.getElementById(`${alias}_value`)
                    || document.getElementById(`${alias}_calculated`)
                    || document.getElementById(alias);
        if (liveEl) return Number(liveEl.value) || 0;

        // Then check JSON
        const parts = alias.split('_');
        let val = characterData;
        for (const part of parts) {
            if (val && typeof val === 'object') val = val[part];
            else { val = undefined; break; }
        }
        return (val === undefined || val === null || val === '') ? 0 : Number(val) || 0;
    }

    // Collect all overrides per target field as an array of { mode, value }
    const overrideList = {};

    document.querySelectorAll('.panel-block').forEach(block => {
        if (block.closest('template')) return;

        const formulaEl = block.querySelector('[data-field-key="formula"]');
        const activeEl  = block.querySelector('[data-field-key="formula_active"]');

        if (!formulaEl || !activeEl?.checked) return;

        const raw = formulaEl.value.trim();
        if (!raw.startsWith('=+')) return;

        const expr = raw.slice(2).trim();
        const tokenMatch = expr.match(/^([a-zA-Z_][\w]*)\s*([+=\-*/].*)?/);
        if (!tokenMatch) return;

        const targetKey = tokenMatch[1].replace(/^character_/, '');
        const targetId  = `${targetKey}_value`;
        const rest      = (tokenMatch[2] ?? '').trim();

        if (!document.getElementById(targetId)) return;

        const isReplace = rest.startsWith('=');
        const expression = isReplace ? rest.slice(1).trim() : rest;

        const resolved = expression.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
            if (BUILTINS.has(match)) return match;
            return resolveVar(match, block);
        });

        let computedValue = 0;
        try {
            computedValue = Number(Function(`"use strict"; return (${resolved || '0'})`)()) || 0;
        } catch (err) {
            console.warn('Panel formula error:', resolved, err);
            return;
        }

        if (!overrideList[targetId]) overrideList[targetId] = [];
        overrideList[targetId].push({ mode: isReplace ? 'replace' : 'add', value: computedValue });
    });

    // Reduce each target's override list into a single final value:
    // — if any override is 'replace', the last replace wins and all adds are ignored
    // — if all are 'add', sum them
    const overrides = {};
    Object.entries(overrideList).forEach(([targetId, list]) => {
        const replaces = list.filter(o => o.mode === 'replace');
        if (replaces.length > 0) {
            overrides[targetId] = { mode: 'replace', value: replaces[replaces.length - 1].value };
        } else {
            overrides[targetId] = { mode: 'add', value: list.reduce((sum, o) => sum + o.value, 0) };
        }
    });

    // Reset fields that had overrides but no longer do
    document.querySelectorAll('[id$="_value"]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        if (!el.dataset.overrideApplied) return;
        if (overrides[el.id]) return; // still has an override, will be updated below

        // No override anymore — restore from JSON
        const key = el.id.replace(/_value$/, '');
        const parts = key.split('_');
        let val = characterData;
        for (const part of parts) {
            if (val && typeof val === 'object') val = val[part];
            else { val = undefined; break; }
        }
        if (val !== undefined && val !== null && typeof val !== 'object') {
            el.value = val;
        }
        delete el.dataset.overrideApplied;
    });

    // Apply overrides
    Object.entries(overrides).forEach(([targetId, override]) => {
        const el = document.getElementById(targetId);
        if (!el) return;

        if (override.mode === 'replace') {
            el.value = override.value;
            el.dataset.overrideApplied = 'true';
            el.dataset.overrideValue = String(override.value);
        } else {
            // Additive — read base from JSON
            const key = targetId.replace(/_value$/, '');
            const parts = key.split('_');
            let baseVal = characterData;
            for (const part of parts) {
                if (baseVal && typeof baseVal === 'object') baseVal = baseVal[part];
                else { baseVal = undefined; break; }
            }
            const base = (baseVal === undefined || baseVal === null || typeof baseVal === 'object')
                ? Number(el.value) || 0
                : Number(baseVal) || 0;
            const result = base + override.value;
            el.value = result;
            el.dataset.overrideApplied = 'true';
            el.dataset.overrideValue = String(result);
        }
    });
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

        // For _calculated fields, read the live DOM value directly
        const liveCalc = document.getElementById(`${clean}_calculated`);
        if (liveCalc) return liveCalc.value ?? '';

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

    if (operationObj.operation_type === '+') {
        const base = resolveVar(operationObj.condition);
        const addends = operationObj.addends || [];
        const total = addends.reduce((sum, key) => sum + resolveVar(key), base);
        return total > 0 ? `+${total}` : `${total}`;
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
const TARGET_FILL = 0.95;

let zoomMode = 'manual';
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


// ── Auto-refresh calculated fields on input ──────────────────────────────────
document.getElementById('character-sheet').addEventListener('input', (e) => {
    const selected = characterSelect.value;
    if (!selected || !characters[selected]) return;

    if (e.target.closest('[id$="_panel"]')) return;

    // For overridden number fields, capture the user delta and apply it to the
    // JSON base so arrow presses modify the base value, not the override result
    if (e.target.dataset.overrideApplied && e.target.type === 'number') {
        const targetId = e.target.id;
        const key = targetId.replace(/_value$/, '');
        const parts = key.split('_');

        // Get current JSON base
        let cursor = characters[selected];
        for (const part of parts) {
            if (cursor && typeof cursor === 'object') cursor = cursor[part];
            else { cursor = undefined; break; }
        }
        const currentBase = (cursor === undefined || typeof cursor === 'object')
            ? 0 : Number(cursor) || 0;

        // previousOverrideResult is what the field showed before the arrow press
        const previousOverrideResult = Number(e.target.dataset.overrideValue) || currentBase;
        const newDisplayed = Number(e.target.value) || 0;
        const userDelta = newDisplayed - previousOverrideResult;
        const newBase = currentBase + userDelta;

        // Write new base directly into JSON
        let obj = characters[selected];
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {};
            obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = String(newBase);

        // Set field to base so populateJsonFromHtml reads the right value
        e.target.value = newBase;
    }

    // Sync live DOM into in-memory JSON
    characters[selected] = populateJsonFromHtml(characters[selected]);

    const characterData = characters[selected];

    // Re-evaluate all _calculated fields
    document.querySelectorAll('[id$="_calculated"]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        const formula = el.defaultValue?.trim();
        if (!formula?.startsWith('=')) return;
        el.value = evaluateOperation(parseFormulaToOperation(formula.slice(1).trim()), characterData);
    });

    // Re-apply panel overrides on top of fresh values
    applyPanelOverrides();
});