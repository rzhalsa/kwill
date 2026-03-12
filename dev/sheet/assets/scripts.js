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

        // Filter JSON files
        const jsonFiles = files.filter(f => f.name.endsWith(".json"));
        characters = {}; // clear previous characters

        // Read each JSON file
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

// Populate dropdown with character names
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

// Show selected character JSON and populate sheet
characterSelect.addEventListener("change", () => {
    const selected = characterSelect.value;
    clearSheet();
    if (selected && characters[selected]) {
        populateSheet(); // must call here AFTER selection
    }
});

// Save JSON without refreshing
// Save JSON without refreshing
saveButton.addEventListener("click", (e) => {
    e.preventDefault();

    let selected = characterSelect.value;
    const container = document.getElementById('character-sheet');

    // Always merge with existing to preserve stale-proof formulas
    const characterData = populateJsonFromHtml(characters[selected] || {});

    // Get character name
    const nameEl = container.querySelector('#name_value');
    const charName = nameEl?.value?.trim();

    if (!charName) {
        alert("Please fill in a character name before saving.");
        return;
    }

    // Use existing filename or create new one
    if (!selected || !characters[selected]) {
    selected = charName + ".json";
}

// Update in memory first
characters[selected] = characterData;

// Then rebuild dropdown so it has the data
populateDropdown();

// Re-select the character in the dropdown
characterSelect.value = selected;

// Save to file
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
        if (el.id?.endsWith('_calculated')) return;
        if (el.hasAttribute('data-label')) return;
        const type = (el.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') el.checked = false;
        else el.value = '';
    });

    container.querySelectorAll('*').forEach(el => {
        if (el.hasAttribute('data-label')) return;
        const tag = el.tagName.toUpperCase();
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && el.children.length === 0) {
            el.textContent = '';
        }
    });
}


function setNested(json, parts, value, overwrite = false) {
    if (parts.length === 1) {
        const existing = json[parts[0]];
        // never overwrite an existing operation with a non-operation
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


// Populate the character sheet
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
}



// Populate the JSON with the names and values in the html sheet.
function populateJsonFromHtml(existingJson = {}) {
    const container = document.getElementById('character-sheet');
    if (!container) return structuredClone(existingJson);

    const base = existingJson.object_id === 'character'
        ? structuredClone(existingJson)
        : { object_id: 'character', ...structuredClone(existingJson) };

    container.querySelectorAll('[id]').forEach(el => {
        let id = el.id?.trim();
        if (!id) return;

        // Read value based on element type
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

    return base;
}



// Handles oobjects of type operation
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

    // ── mirror ─────────────────────────────────────────────────────────────
    if (operationObj.operation_type === 'mirror') {
        return resolveString(operationObj.condition);
    }

    // ── conditional ────────────────────────────────────────────────────────
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

    // ── arithmetic ─────────────────────────────────────────────────────────
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
const TARGET_FILL = 0.85;

function updateScale() {
    const scale = Math.min(1, (window.innerWidth * TARGET_FILL) / PAGE_WIDTH);
    document.documentElement.style.setProperty('--page-scale', scale);
}

window.addEventListener('resize', updateScale);
updateScale();
