// DOM element: Document Object Model element
// A DOM element is any object in a webpage's structure represented 
// DOM, a tree like representation of all the tags in the webpage.
// (<div> <span> <input> etc)
// 

// ============================================================
// TOP-LEVEL DOM REFERENCES
// These four variables are grabbed once at startup and reused
// throughout the file. They correspond to HTML elements that
// control folder selection, character selection, and saving.
// ============================================================

// The hidden <input type="file" webkitdirectory> that triggers
// the OS folder-picker dialog.
const folderInput = document.getElementById("folderInput");

// A display element (e.g. a <span> or <p>) that shows the name
// of the currently selected folder to the user.
const folderLabel = document.getElementById("selectedFolder");

// The <select> dropdown that lists every character loaded from
// the selected folder, plus a "New Character" placeholder.
const characterSelect = document.getElementById("characterSelect");

// The save/download button that serialises the current sheet
// state back to JSON and triggers a file download.
const saveButton = document.getElementById("saveButton");

// ============================================================
// GLOBAL STATE
// characters is the single source of truth for all loaded
// character data. Keys are filenames (e.g. "fighter.json"),
// values are the parsed JSON objects for each character.
// It is populated by the folder-change handler and mutated
// by the auto-refresh listener and save handler.
// ============================================================
let characters = {};

// ── Folder Input Events ──────────────────────────────────────

// Clears the input's value before each click so the browser
// fires a "change" event even if the user re-selects the same
// folder. Without this, selecting the same folder twice in a
// row would silently do nothing.
folderInput.addEventListener("click", () => {
    folderInput.value = null;
});

// Fires whenever the user finishes selecting a folder.
// Reads every .json file inside it, parses each one, and
// stores the result in the global `characters` map.
// populateDropdown() is called after each file finishes
// loading so the dropdown updates incrementally as files parse.
folderInput.addEventListener("change", () => {
    const files = Array.from(folderInput.files);
    if (files.length > 0) {
        // webkitRelativePath looks like "FolderName/file.json";
        // splitting on "/" and taking index 0 gives the folder name.
        const folderid = files[0].webkitRelativePath.split("/")[0];
        folderLabel.textContent = `Selected folder: ${folderid}`;

        // Only process files that end in ".json"; ignore images,
        // text files, sub-folders, etc.
        const jsonFiles = files.filter(f => f.name.endsWith(".json"));

        // Reset characters so stale data from a previous folder
        // doesn't bleed through if the new folder has fewer files.
        characters = {};

        jsonFiles.forEach(file => {
            const reader = new FileReader();

            // onload fires asynchronously when the file has been
            // fully read into memory. On success, the parsed object
            // is stored under the original filename as the key.
            reader.onload = (e) => {
                try {
                    characters[file.name] = JSON.parse(e.target.result);
                    // Rebuild the dropdown each time a new file lands
                    // so characters appear as soon as they are ready.
                    populateDropdown();
                } catch (err) {
                    console.error(`Error parsing ${file.name}:`, err);
                }
            };
            reader.readAsText(file);
        });
    } else {
        // User cancelled or the folder was empty — reset everything.
        folderLabel.textContent = "No folder selected";
        characters = {};
        populateDropdown();
    }
});

// ── Dropdown population ──────────────────────────────────────

// Rebuilds the characterSelect <select> from the current state
// of the `characters` map. Called after every file load and
// after a save operation updates the map.
function populateDropdown() {
    // Wipe all existing <option> elements.
    characterSelect.innerHTML = "";

    // Always insert a "New Character" placeholder as the first
    // and pre-selected option so the user can create from scratch.
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "New Character";
    placeholder.selected = true;
    placeholder.id = "placeholder-option";
    characterSelect.appendChild(placeholder);

    // One <option> per loaded character. The display text prefers
    // the "name" field from the JSON; falls back to the filename
    // (minus the ".json" extension) if name is missing or not a string.
    for (let fileName in characters) {
        const option = document.createElement("option");
        option.value = fileName;
        const charName = characters[fileName].name;
        option.textContent = (typeof charName === 'string' ? charName : null) || fileName.replace(".json", "");
        characterSelect.appendChild(option);
    }
}

// ── Character Selection ──────────────────────────────────────

// Fires when the user picks a different character from the dropdown.
// Clears the sheet, optionally re-populates it with the selected
// character's data, then re-applies any active panel overrides.
characterSelect.addEventListener("change", () => {
    const selected = characterSelect.value;
    clearSheet();
    // Only populate if a real character was selected (not the
    // "New Character" placeholder, whose value is "").
    if (selected && characters[selected]) {
        populateSheet();
    }
    applyPanelOverrides();
});

// ── Save Handler ─────────────────────────────────────────────

// Triggered by clicking the save button. Serialises the current
// DOM state into a JSON object, stores it back into `characters`,
// updates the dropdown, and initiates a browser file download.
//
// The logic around formula_active and overrideApplied exists to
// ensure only raw base values (not panel-formula-modified display
// values) end up in the saved JSON. The sequence is:
//   1. Uncheck all active formula toggles
//   2. Restore any overridden fields to their JSON base values
//   3. Re-check the toggles (so populateJsonFromHtml reads the
//      correct formula_active state)
//   4. Serialise the DOM
//   5. Uncheck again, download, then re-check and re-apply overrides
saveButton.addEventListener("click", (e) => {
    e.preventDefault();

    let selected = characterSelect.value;
    const container = document.getElementById('character-sheet');

    // Step 1 — Temporarily disable all active panel formula toggles.
    // We track which ones were active so we can restore them after saving.
    const activeFormulas = new Set();
    document.querySelectorAll('[data-field-key="formula_active"]').forEach(el => {
        if (el.checked) activeFormulas.add(el);
        el.checked = false;
    });

    // Step 2 — For each field that had a panel override visually applied,
    // revert its displayed value back to the raw JSON base value so the
    // serialiser captures the true underlying number, not the modified one.
    if (selected && characters[selected]) {
        document.querySelectorAll('[data-override-applied]').forEach(el => {
            if (!el.id) return;
            // Strip the "_value" suffix to reconstruct the JSON path key.
            const key = el.id.replace(/_value$/, '');
            const parts = key.split('_');
            // Walk the JSON object tree using the key parts.
            let val = characters[selected];
            for (const part of parts) {
                if (val && typeof val === 'object') val = val[part];
                else { val = undefined; break; }
            }
            // Restore the field's value to the JSON base and clear the
            // override markers so populateJsonFromHtml reads correctly.
            if (val !== undefined && val !== null && typeof val !== 'object') {
                el.value = val;
                delete el.dataset.overrideApplied;
                delete el.dataset.overrideValue;
            }
        });
    }

    // Step 3 — Re-check active formulas so populateJsonFromHtml captures
    // the correct formula_active booleans in the JSON output.
    activeFormulas.forEach(el => { el.checked = true; });

    // Step 4 — Serialise the entire sheet DOM into a JSON object.
    // Pass the existing character as a base so unchanged fields are preserved.
    const characterData = populateJsonFromHtml(characters[selected] || {});

    // Uncheck again so the DOM is in its reset (no-override) state
    // before we re-apply overrides at the end of the save flow.
    activeFormulas.forEach(el => { el.checked = false; });

    // Validate that a name has been entered before saving.
    const nameEl = container.querySelector('#name_value');
    const charName = nameEl?.value?.trim();

    if (!charName) {
        alert("Please fill in a character name before saving.");
        // Re-apply overrides before returning so the sheet looks correct.
        applyPanelOverrides();
        return;
    }

    // If no existing character was selected (i.e. "New Character"),
    // derive the filename from the entered name.
    if (!selected || !characters[selected]) {
        selected = charName + ".json";
    }

    // Update the in-memory store and refresh the dropdown so the new
    // name/file appears immediately.
    characters[selected] = characterData;
    populateDropdown();
    characterSelect.value = selected;

    // Build a data URI from the pretty-printed JSON and trigger a
    // download by programmatically clicking a temporary <a> element.
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = selected;
    a.click();

    // Step 5 — Restore active formula toggles and re-apply overrides
    // so the visual display goes back to its pre-save state.
    activeFormulas.forEach(el => { el.checked = true; });
    applyPanelOverrides();
});


// ── Sheet Clear ──────────────────────────────────────────────

// Resets all user-editable fields in the character sheet to their
// empty/default state. Called before populating a different character
// so stale values from the previous character don't persist.
//
// Two passes are needed:
//   Pass 1 — Reset form controls (input, textarea, select).
//   Pass 2 — Clear text content of non-form leaf elements.
//
// Both passes skip elements inside panel containers (those are
// managed separately by clearAllPanels), _calculated fields (which
// are derived and will be recalculated), and data-label elements
// (which are static labels, not data fields).
function clearSheet() {
    const container = document.getElementById('character-sheet');
    if (!container) return;

    // Pass 1: clear all interactive form controls.
    container.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;   // skip panel items
        if (el.id?.endsWith('_calculated')) return; // skip formula outputs
        if (el.hasAttribute('data-label')) return;  // skip static labels
        const type = (el.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') el.checked = false;
        else el.value = '';
    });

    // Pass 2: clear text-only leaf elements (e.g. <span>, <div>
    // used as display fields) that aren't interactive controls.
    container.querySelectorAll('*').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        const tag = el.tagName.toUpperCase();
        // Only clear elements that aren't form controls AND have no
        // child elements (i.e. are leaf text nodes).
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && el.children.length === 0) {
            el.textContent = '';
        }
    });

    // Clear all panel containers independently.
    clearAllPanels();
}


// ── Nested JSON Writer ───────────────────────────────────────

// Writes `value` into the `json` object at a path described by the
// `parts` array. The path encoding follows the HTML id convention:
//   - A flat field "strength_value" → "strength": "..." as a key 
// in the base character json object
//
//   - A nested field "armor_ac_value" → "armor": { "ac": "..."} 
// as a nested key in the base character json object
//
// "value" as seen in the html is a suffix to signify that content of 
// the html object will be saved as a raw key value pair
// 
// The `overwrite` flag controls whether an existing non-empty value
// is replaced. operation objects (object_id === 'operation') are
// protected: a plain value will never overwrite an existing operation.
//
// This function is called by populateJsonFromHtml to reconstruct
// the character JSON from the DOM.
function setNested(json, parts, value, overwrite = false) {
    if (parts.length === 1) {
        const existing = json[parts[0]];
        // Protect formula/operation objects from being overwritten
        // by a plain DOM value.
        if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
        if (overwrite || existing === undefined || existing === '') {
            json[parts[0]] = value;
        }
        return;
    }

    // For multi-part paths, decompose into:
    //   field    — the innermost key (last part)
    //   stat     — the second-to-last key
    //   objectId — everything before stat, joined with "_"
    const field = parts[parts.length - 1];
    const stat = parts[parts.length - 2];
    const objectId = parts.slice(0, -2).join('_');

    if (!objectId) {
        // Two-part path: json[stat][field]
        if (!json[stat]) json[stat] = {};
        const existing = json[stat][field];
        if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
        if (overwrite || existing === undefined || existing === '') {
            json[stat][field] = value;
        }
        return;
    }

    // Three-or-more part path: json[objectId][stat][field]
    // Ensure the intermediate objects exist before writing.
    if (!json[objectId]) json[objectId] = { object_id: objectId };
    if (!json[objectId][stat]) json[objectId][stat] = {};

    const existing = json[objectId][stat][field];
    if (existing?.object_id === 'operation' && value?.object_id !== 'operation') return;
    // Don't overwrite a non-empty value with an empty string unless
    // overwrite mode is active.
    if (existing !== undefined && existing !== '' && value === '') return;
    if (overwrite || existing === undefined || existing === '') {
        json[objectId][stat][field] = value;
    }
}


// ── Formula Parser ───────────────────────────────────────────

// Converts a formula string (as typed into a _calculated field or
// panel formula box) into an "operation" object that evaluateOperation()
// can process. This function is a shared helper used by populateSheet,
// the auto-refresh input listener, and applyPanelOverrides.
//
// Supported syntax (the leading "=" is stripped before calling this):
//
//   >fieldName             → mirror: copy the string value of fieldName
//
//   field [t1,t2] [r1,r2]  → conditional: look up `field`; return the
//                             result whose threshold it exceeds
//
//   +field [add1] [add2]   → additive: base value of `field` plus each
//                             addend, formatted as "+N" or "−N". 
//
//                             Formulas can be used as addends, so 
//                             "=+ hitpoints_maximum = 200" accesses
//                             the hitpoints_maximum field and sets it
//                             to 200
//
//
//   anything else           → math expression evaluated as-is (operation_type "=")
function parseFormulaToOperation(formulaText) {



    // Fallback: plain math expression stored as-is.
    // evaluateOperation will resolve variable names and eval the string.
    return {
        object_id: 'operation',
        operation_type: '=',
        value: formulaText
    };
}


// ── Sheet Population ─────────────────────────────────────────

// Reads the selected character's JSON and fills all matching DOM
// elements with values. The matching strategy uses HTML element IDs:
//
//   JSON path  characters["hero.json"].strength.score
//   →  tries: #strength_score_calculated, #strength_score_value, #strength_score
//
// After setting raw values, a second pass re-evaluates every
// _calculated field using its defaultValue formula.
// Finally, loadAllPanels populates dynamic panel blocks.
//
// Depends on: characterSelect, characters, evaluateOperation,
//             parseFormulaToOperation, loadAllPanels
function populateSheet() {
    const selected = characterSelect.value;
    if (!selected || !characters[selected]) return;

    const characterData = characters[selected];

    // Sets a single DOM element's value, choosing the right property
    // based on element type (checkbox vs text input vs bare element).
    function setElementValue(el, value) {
        if (!el) return;
        if (el.hasAttribute('data-label')) return; // never overwrite labels
        const tag = el.tagName.toUpperCase();
        if (tag === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
            el.checked = value === true || value === 'true';
        } else if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
            el.value = value ?? '';
        } else {
            el.textContent = value ?? '';
        }
    }

    // Recursively traverses the character JSON object.
    // For each key, it constructs a full DOM id and tries to find and
    // populate the corresponding element. Nested objects are walked
    // recursively, building the id prefix from parent object_id values.
    //
    // Special handling: if a value is an operation object, it is
    // evaluated immediately and the result is displayed.
    function walkObject(obj, parentId = null) {
        if (!obj || typeof obj !== 'object') return;

        // The top-level "character" object doesn't contribute a prefix;
        // all other objects use their object_id as the prefix.
        let effectiveParent;
        if (parentId === null && obj.object_id === 'character') {
            effectiveParent = null;
        } else {
            effectiveParent = obj.object_id ?? parentId;
        }

        Object.keys(obj).forEach(key => {
            if (key === 'object_id') return; // internal metadata, not a field
            if (key === 'panels') return;    // panels are handled separately

            const value = obj[key];

            // Build the full element id by joining prefix and key.
            const fullId = effectiveParent ? `${effectiveParent}_${key}` : key;

            // Priority order for element lookup:
            //   1. <id>_calculated — formula output fields
            //   2. <id>_value      — editable value fields
            //   3. <id>            — bare id (legacy / simple fields)
            const elCalculated = document.getElementById(`${fullId}_calculated`);
            const elValue = document.getElementById(`${fullId}_value`);
            const elNormal = document.getElementById(fullId);

            if (value && typeof value === 'object' && value.object_id === 'operation') {
                // Evaluate the stored formula and display the result.
                const result = evaluateOperation(value, characterData);
                if (elCalculated) setElementValue(elCalculated, result);
                else if (elValue) setElementValue(elValue, result);
                else if (elNormal) setElementValue(elNormal, result);

            } else if (value && typeof value === 'object') {
                // Recurse into nested objects (e.g. strength: { score: 16 })
                walkObject(value, fullId);

            } else {
                // Scalar value — write directly to the matching element.
                if (elCalculated) setElementValue(elCalculated, value);
                else if (elValue) setElementValue(elValue, value);
                else if (elNormal) setElementValue(elNormal, value);
            }
        });
    }

    walkObject(characterData);

    // Second pass: re-evaluate all _calculated fields that have a
    // "=formula" as their defaultValue. This handles fields whose
    // formula references other fields that may have been set during
    // walkObject above (e.g. a modifier computed from a score).
    document.querySelectorAll('[id$="_calculated"]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        const formula = el.defaultValue?.trim();
        if (!formula?.startsWith('=')) return;
        el.value = evaluateOperation(parseFormulaToOperation(formula.slice(1).trim()), characterData);
    });

    // Populate all dynamic panel sections (spells, items, etc.)
    // then apply any active formula overrides on top.
    loadAllPanels(characterData);
}


// ── DOM → JSON Serialiser ────────────────────────────────────

// Reads the current state of all IDed elements in the character sheet
// and writes their values into a new JSON object. This is the inverse
// of populateSheet: DOM → JSON rather than JSON → DOM.
//
// The function reconstructs the nested JSON structure from flat element
// IDs using setNested. Special suffixes change behaviour:
//   _calculated → strip suffix; if value starts with "=", parse as formula
//   _value      → strip suffix; overwrite mode (user-edited data wins)
//   _name       → strip suffix; store as .name on the parent object
//
// Panel data is handled separately by saveAllPanels at the end.
//
// Depends on: setNested, parseFormulaToOperation, saveAllPanels
function populateJsonFromHtml(existingJson = {}) {
    const container = document.getElementById('character-sheet');
    if (!container) return structuredClone(existingJson);

    // Start from a deep clone of the existing JSON so unchanged
    // fields (especially deeply nested ones not on the sheet) are preserved.
    const base = existingJson.object_id === 'character'
        ? structuredClone(existingJson)
        : { object_id: 'character', ...structuredClone(existingJson) };

    container.querySelectorAll('[id]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return; // panels handled separately

        let id = el.id?.trim();
        if (!id) return;

        // Read the current value based on element type.
        let value;
        if (el.type === 'checkbox' || el.type === 'radio') {
            value = el.checked;
        } else {
            value = el.value !== undefined ? el.value : (el.textContent?.trim() ?? '');
        }

        const isCalculated = id.endsWith('_calculated');
        const isValue = id.endsWith('_value');
        const isName = id.endsWith('_name');

        // Strip the suffix to get the base key, then handle each type.
        if (isCalculated) id = id.slice(0, -'_calculated'.length);
        else if (isValue) id = id.slice(0, -'_value'.length);
        else if (isName) {
            // _name fields store a display name on their parent object.
            // Use nested path splitting to handle multi-level objects correctly.
            id = id.slice(0, -'_name'.length);
            const parts = id.split('_');

            if (parts.length === 1) {
                // Single level: base[id].name = value
                if (!base[id]) base[id] = { object_id: id };
                base[id].name = value;
            } else {
                // Multi-level: properly handle nested structures
                const field = parts[parts.length - 1];
                const stat = parts[parts.length - 2];
                const objectId = parts.slice(0, -2).join('_');

                if (!objectId) {
                    // Two-part path: base[stat][field].name = value
                    if (!base[stat]) base[stat] = {};
                    if (!base[stat][field]) base[stat][field] = {};
                    base[stat][field].name = value;
                } else {
                    // Three-or-more part path: base[objectId][stat][field].name = value
                    if (!base[objectId]) base[objectId] = { object_id: objectId };
                    if (!base[objectId][stat]) base[objectId][stat] = {};
                    if (!base[objectId][stat][field]) base[objectId][stat][field] = {};
                    base[objectId][stat][field].name = value;
                }
            }
            return;
        }

        if (isCalculated) {
            // A _calculated field whose value starts with "=" holds a
            // formula. Parse it into an operation object for storage.
            const trimmed = (value + '').trim();
            if (!trimmed.startsWith('=')) return; // not a formula, skip
            // A _calculated field whose value starts with "=>" is a mirror 
            // operation taking its value from another field
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

        // Write the value into the JSON tree at the path encoded by the id.
        const parts = id.split('_');
        setNested(base, parts, value, isCalculated || isValue);
    });

    // Append all panel data (spells, items, etc.) into base.panels.
    saveAllPanels(base);

    return base;
}


// ── Dynamic Panels ───────────────────────────────────────────
//
// Panels are repeating sections of the sheet (e.g. a spells list,
// an equipment list). Each panel has:
//   - A container element with id "<panelId>_panel"
//   - A <template> element with id "<panelId>_template"
//   - An "add" button with id "<panelId>_button"
//
// Panel data is stored in characters[selected].panels[panelId]
// as an array of plain objects. Each object maps field-key strings
// (from data-field-key attributes) to values.
//
// Key functions and their relationships:
//   getPanelIds         → discovers all panel IDs from the DOM
//   createPanelBlock    → clones a template, binds events, returns the element
//   addPanelBlock       → calls createPanelBlock and appends to the container
//   clearPanel          → removes all .panel-block elements from a container
//   loadPanel           → clearPanel + addPanelBlock for each item in the array
//   savePanel           → reads all .panel-block elements → array of objects
//   saveAllPanels       → calls savePanel for every panel → base.panels
//   loadAllPanels       → calls loadPanel for every panel + applyPanelOverrides
//   clearAllPanels      → calls clearPanel for every panel

// Returns an array of panel identifiers by scanning the DOM for
// elements whose id ends with "_panel". The panel id is the part
// before "_panel" (e.g. "spells" from "spells_panel").
function getPanelIds() {
    return Array.from(document.querySelectorAll('[id$="_panel"]'))
        .map(el => el.id.slice(0, -'_panel'.length))
        .filter(name => name.length > 0);
}

// Once the DOM is fully loaded, wire up each panel's "add" button
// so clicking it calls addPanelBlock for that panel.
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

// Creates and returns a fully configured panel block element by cloning
// the panel's <template>. The element is populated with `data` values,
// has all event listeners attached, and is ready to be appended to the
// panel container.
//
// Key behaviours wired inside this function:
//   - Remove button: confirms deletion, removes the element, re-applies overrides
//   - Expand/collapse button: toggles the ".panel-expanded" section
//   - Attack/save select: shows/hides the save type dropdown and bonus display
//   - Uses display: shows "current/max" uses in the collapsed header
//   - Collapsed stats summary: damage, action, range shown when collapsed
//   - Tooltip: shows a hover tooltip with spell stats when the block is collapsed
//   - Input/change listeners: keep the in-memory overrides current
//   - formulaActiveCollapsed checkbox in the minimized header
//   - Bidirectional sync between collapsed and expanded formula toggles
//   - Proper initialization and event handling
//
// Depends on: applyPanelOverrides (called on input/change)
function createPanelBlock(panelId, data = {}) {

    const template = document.getElementById(`${panelId}_template`);
    if (!template) {
        console.warn(`Panel template not found: ${panelId}_template`);
        return null;
    }

    // Deep-clone the template content. firstElementChild gives us the
    // root element of the template (the .panel-block div).
    const clone = template.content.cloneNode(true).firstElementChild;
    if (!clone) {
        console.warn(`Template cloneNode returned null for: ${panelId}_template — template may be empty`);
        return null;
    }

    // Replace id attributes on template elements with data-field-key
    // attributes and populate initial values from the `data` object.
    // Only elements with recognised suffixes (_value, _name, _calculated)
    // get data-field-key; others lose their id to avoid DOM id conflicts
    // when multiple blocks of the same template exist simultaneously.
    clone.querySelectorAll('[id]').forEach(el => {
        let key = el.id.trim();
        const isValue = key.endsWith('_value');
        const isName = key.endsWith('_name');
        const isCalculated = key.endsWith('_calculated');

        if (isValue) key = key.slice(0, -'_value'.length);
        else if (isName) key = key.slice(0, -'_name'.length);
        else if (isCalculated) key = key.slice(0, -'_calculated'.length);
        else { el.removeAttribute('id'); return; } // unrecognised suffix — remove id

        el.dataset.fieldKey = key; // store clean key for savePanel to read
        el.removeAttribute('id'); // remove id so no duplicate-id issues

        if (data[key] === undefined) return; // no initial data for this field

        // Set the initial value from the data object.
        const tag = el.tagName.toUpperCase();
        if (tag === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
            el.checked = data[key] === true || data[key] === 'true';
        } else if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
            el.value = data[key] ?? '';
        } else {
            el.textContent = data[key] ?? '';
        }
    });

    // ── Remove button ──────────────────────────────────────
    // Asks for confirmation before deleting the block. Also removes
    // the tooltip element (which lives on document.body, not inside
    // the clone) and re-runs override calculations.
    clone.querySelector('.panel-remove-btn')?.addEventListener('click', () => {
        const nameInput = clone.querySelector('[data-field-key="name"]');
        const name = nameInput?.value?.trim() || '';
        const label = clone.querySelector('.panel-remove-btn')?.dataset.deleteLabel || 'entry';
        if (confirm(`Delete ${label} ${name}?`)) {
            tooltip.remove();  // tooltip is a closure variable defined later in this function
            clone.remove();
            applyPanelOverrides();
        }
    });

    // ── Expand / collapse ──────────────────────────────────
    // Toggles visibility of the ".panel-expanded" section and flips
    // the button text between "v" (collapsed) and "^" (expanded).
    const expandBtn = clone.querySelector('.panel-expand-btn');
    const expandedSection = clone.querySelector('.panel-expanded');

    // ── Attack/save select ─────────────────────────────────
    // These are specific to spell/attack panel blocks. When the
    // "attacksave" select changes, hide or show the save type dropdown
    // and update the displayed attack bonus.
    const attackSaveSelect = clone.querySelector('[data-field-key="attacksave"]');
    const saveTypeSelect = clone.querySelector('[data-field-key="savetype"]');
    const attackBonusDisplay = clone.querySelector('.attackbonus-display');

    // Shows the saveTypeSelect only when "Spell Save" is chosen.
    // Shows the attackBonusDisplay (from the main sheet's spell attack bonus
    // field) only when "Spell Attack" is chosen.
    function updateSaveTypeVisibility() {
        const val = attackSaveSelect?.value;

        if (saveTypeSelect)
            saveTypeSelect.style.display = val === 'Spell Save' ? 'inline-block' : 'none';

        if (attackBonusDisplay) {
            if (val === 'Spell Attack') {
                // Read the spell attack bonus from the main sheet (not the panel).
                const bonus = document.getElementById('spell_attackBonus_value')?.value?.trim();
                attackBonusDisplay.textContent = bonus ? `+${bonus}` : '';
                attackBonusDisplay.style.display = 'inline';
            } else {
                attackBonusDisplay.style.display = 'none';
            }
        }
    }

    attackSaveSelect?.addEventListener('change', updateSaveTypeVisibility);
    // Also listen on the main sheet's attack bonus field so the display
    // updates if that value changes while this block is open.
    document.getElementById('spell_attackBonus_value')
        ?.addEventListener('input', updateSaveTypeVisibility);
    // Defer first call so the cloned element is in the DOM before querying.
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

    // ── Formula activation toggle (collapsed header) ─────────────────────
    // A checkbox in the minimized header that mirrors the formula_active
    // checkbox in the expanded section. Clicking it toggles formula activation
    // without expanding the block. Only shown if the formula field has content.
    const formulaActiveCollapsed = document.createElement('input');
    formulaActiveCollapsed.type = 'checkbox';
    formulaActiveCollapsed.title = 'Toggle formula';
    formulaActiveCollapsed.style.cssText = [
        'flex-shrink:0',
        'width:14px',
        'height:14px',
        'cursor:pointer',
        'accent-color:#8b6914',
        'display:none'  // Start hidden; only show if formula has content
    ].join(';');

    // Find the expanded section's formula_active checkbox (the canonical source of truth).
    const formulaActiveExpanded = expandedSection.querySelector('[data-field-key="formula_active"]');
    const formulaInput = expandedSection.querySelector('[data-field-key="formula"]');

    // Helper function to update the visibility of the formula toggle based on whether
    // the formula field has content.
    function updateFormulaCheckboxVisibility() {
        const hasFormula = formulaInput?.value?.trim().length > 0;
        formulaActiveCollapsed.style.display = hasFormula ? 'inline-flex' : 'none';
    }

    // Sync collapsed → expanded when the collapsed checkbox changes.
    formulaActiveCollapsed.addEventListener('change', () => {
        if (formulaActiveExpanded) {
            formulaActiveExpanded.checked = formulaActiveCollapsed.checked;
            // Trigger change event on the expanded checkbox to fire any listeners
            // (including applyPanelOverrides).
            formulaActiveExpanded.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // Sync expanded → collapsed when the expanded checkbox changes.
    if (formulaActiveExpanded) {
        formulaActiveExpanded.addEventListener('change', () => {
            formulaActiveCollapsed.checked = formulaActiveExpanded.checked;
        });
    }

    // Update visibility whenever the formula input changes.
    if (formulaInput) {
        formulaInput.addEventListener('input', updateFormulaCheckboxVisibility);
        formulaInput.addEventListener('change', updateFormulaCheckboxVisibility);
    }

    // Insert the formula toggle into the header row.
    if (mainRow && expandBtn) {
        mainRow.insertBefore(formulaActiveCollapsed, expandBtn);
    }

    // ── Collapsed stats summary ────────────────────────────────────────
    // When the expanded section is hidden, shows a condensed view of
    // damage, action type, and range in the collapsed header row.
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

        // Combine damage and damage type if both exist (e.g. "2d6 Fire").
        if (dmgDisplay) {
            if (dmgVal && dmgTypeVal) dmgDisplay.textContent = `${dmgVal} ${dmgTypeVal}`;
            else if (dmgTypeVal) dmgDisplay.textContent = dmgTypeVal;
            else dmgDisplay.textContent = '';
        }
        if (actionDisplay) actionDisplay.textContent = actionVal || '';
        if (rangeDisplay) rangeDisplay.textContent = rangeVal || '';
    }

    // Listen for changes to relevant fields and update the collapsed
    // summary and uses display in real time.
    clone.addEventListener('input', (e) => {
        const key = e.target.dataset.fieldKey;
        if (['damage', 'damagetype', 'action', 'range'].includes(key)) updateCollapsedSpells();
        if (key === 'uses_current' || key === 'uses_max') updateUsesDisplay();
    });

    clone.addEventListener('change', (e) => {
        const key = e.target.dataset.fieldKey;
        if (['damage', 'damagetype', 'action', 'range'].includes(key)) updateCollapsedSpells();
    });

    // Defer initial population until after the clone is appended.
    setTimeout(updateCollapsedSpells, 0);
    setTimeout(updateUsesDisplay, 0);

    // Initialize the collapsed formula toggle to match the expanded state,
    // and check formula visibility.
    setTimeout(() => {
        updateFormulaCheckboxVisibility();
        if (formulaActiveExpanded) {
            formulaActiveCollapsed.checked = formulaActiveExpanded.checked;
        }
    }, 0);

    // Wire the expand/collapse button after the collapsed-stats helpers
    // are defined so the button can reference expandedSection.
    if (expandBtn && expandedSection) {
        expandBtn.addEventListener('click', () => {
            const isOpen = expandedSection.style.display !== 'none';
            expandedSection.style.display = isOpen ? 'none' : 'flex';
            expandBtn.textContent = isOpen ? 'v' : '^';
            tooltip.style.display = 'none'; // hide tooltip when toggling
        });
    }


    // ── Hover tooltip ──────────────────────────────────────
    // A fixed-position tooltip div (appended to document.body so it
    // can overlay anything) that shows a quick summary of the block's
    // stats when the block is collapsed and the user hovers over it.
    // The tooltip is a closure variable referenced by the remove button
    // and expand button above, which is why it must be declared here.
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
        'pointer-events:none', // don't intercept mouse events
        'z-index:9999',
        'display:none'
    ].join(';');
    document.body.appendChild(tooltip);

    // On mouseenter, build the tooltip text from the block's field values.
    // Only shows when the block is collapsed (expanded section is hidden).
    clone.addEventListener('mouseenter', (e) => {
        if (expandedSection.style.display !== 'none') return; // block is expanded — no tooltip

        // Helper: read a field value by data-field-key from within this block.
        const get = (key) => clone.querySelector(`[data-field-key="${key}"]`)?.value?.trim() || '';

        const manualTooltip = get('tooltip');  // optional free-text tooltip field
        const showStats = clone.querySelector('[data-field-key="showstats"]')?.checked;

        const lines = [];

        // Build stat lines only if the "showstats" checkbox is ticked.
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

            // Attack/save line uses the main sheet's bonus/DC values,
            // not values stored in the panel block itself.
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
        if (!lines.length) return; // nothing to show — don't display the tooltip

        tooltip.textContent = lines.join('\n');
        tooltip.style.display = 'block';
        // Position just to the bottom-right of the cursor.
        tooltip.style.left = e.clientX + 12 + 'px';
        tooltip.style.top = e.clientY + 12 + 'px';
    });

    // Track the cursor so the tooltip follows the mouse while hovering.
    clone.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.clientX + 12 + 'px';
        tooltip.style.top = e.clientY + 12 + 'px';
    });

    clone.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    // Any input or change inside this block triggers a full re-evaluation
    // of all panel overrides so the main sheet stays in sync.
    clone.addEventListener('input', () => applyPanelOverrides());
    clone.addEventListener('change', () => applyPanelOverrides());

    return clone;
}

// Convenience wrapper: creates a panel block and appends it to the
// panel's container element. Used both by the "add" button handler
// and by loadPanel when restoring saved data.
function addPanelBlock(panelId, data = {}) {
    const container = document.getElementById(`${panelId}_panel`);
    if (!container) return;
    const block = createPanelBlock(panelId, data);
    if (block) container.appendChild(block);
}

// Removes all rendered .panel-block elements from a panel container.
// Skips blocks that are still inside a <template> element (which is
// the static template definition, not a live block).
function clearPanel(panelId) {
    const container = document.getElementById(`${panelId}_panel`);
    if (!container) return;
    Array.from(container.querySelectorAll('.panel-block'))
        .filter(el => !el.closest('template'))
        .forEach(el => el.remove());
}

// Clears a panel then re-populates it from an array of data objects.
// Each item in dataArray becomes one panel block via addPanelBlock.
function loadPanel(panelId, dataArray) {
    clearPanel(panelId);
    if (!Array.isArray(dataArray)) return;
    dataArray.forEach(item => addPanelBlock(panelId, item));
}

// Reads a panel's current DOM state into an array of plain objects.
// Returns null if there are no blocks (so saveAllPanels can skip
// panels that have no data).
// Each block contributes one object whose keys are data-field-key values.
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

// Iterates over all panels, saves each one, and writes the results
// into base.panels. Called by populateJsonFromHtml to include panel
// data in the serialised character JSON.
function saveAllPanels(base) {
    const panelsData = {};
    let hasAny = false;
    getPanelIds().forEach(panelId => {
        const data = savePanel(panelId);
        if (data !== null) {
            const parts = panelId.split("_");
            let obj = panelsData;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!obj[parts[i]]) obj[parts[i]] = {};
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = data;
            hasAny = true;
        }
    });
    // Only write base.panels if at least one panel had data,
    // avoiding a spurious empty object in the JSON.
    if (hasAny) base.panels = panelsData;
    return base;
}

// Populates all panels from a character data object and then
// re-applies panel formula overrides. Called by populateSheet.
function loadAllPanels(characterData) {
    if (!characterData.panels) return;
    getPanelIds().forEach(panelId => {
        const parts = panelId.split("_");
        let obj = characterData.panels;
        for (const part of parts) {
            if (obj && typeof obj === "object") obj = obj[part];
            else { obj = undefined; break; }
        }
        if (obj) loadPanel(panelId, obj);
    });
    applyPanelOverrides();
}

// Removes all blocks from every panel. Called by clearSheet.
function clearAllPanels() {
    getPanelIds().forEach(panelId => clearPanel(panelId));
}

// ── Panel Formula Overrides ──────────────────────────────────────────────────
// Scans all active panel block formulas and applies visual overrides to
// main sheet fields. Raw JSON values are never modified.
//
// Syntax:
//   fieldName = expr        — sets fieldName to the result of expr
//   fieldName = fieldName + expr  — adds expr to fieldName's base value
//
// expr can include variable names (resolved from panel block, live DOM, or JSON),
// literals, and any JS math expression using BUILTINS.

// Scans all active panel block formula fields and applies their computed
// values as visual overrides to main sheet _value fields. The underlying
// JSON is never touched; overrides are purely a display layer.
//
// Override resolution when multiple blocks target the same field:
//   All formulas are evaluated independently, and the highest computed
//   value is displayed.
//
// After computing overrides, fields that previously had overrides but
// no longer do are restored to their JSON base values.
//
// Depends on: characterSelect, characters (global state)
function applyPanelOverrides() {
    const selected = characterSelect.value;
    if (!selected || !characters[selected]) return;

    const characterData = characters[selected];

    // Safe identifiers that can appear in formula expressions without
    // being treated as field variable names to look up.
    const BUILTINS = new Set([
        'Math', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'sqrt', 'pow',
        'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Number', 'String',
        'Boolean', 'true', 'false', 'null', 'undefined', 'Infinity', 'NaN'
    ]);

    // Resolves a variable name to a numeric value from the character JSON base.
    // All formula variables reference the JSON base values, not DOM overrides,
    // to avoid cascading/infinite recalculation when formulas reference each other.
    function resolveVar(name) {
        const clean = name.replace(/_(value|calculated)$/, '');

        // 1. DOM override always wins
        const overrideEl =
            document.getElementById(clean + "_value") ||
            document.getElementById(clean + "_calculated") ||
            document.getElementById(clean);

        if (overrideEl) {
            // If a panel override is applied, ALWAYS use it
            if (overrideEl.dataset.overrideApplied === "true") {
                const num = Number(overrideEl.dataset.overrideValue);
                if (!isNaN(num)) return num;
            }

            // Otherwise use the live DOM value
            const live = Number(overrideEl.value);
            if (!isNaN(live)) return live;
        }

        // 2. JSON fallback
        let val = resolveByPath(jsonData, clean);
        if (val === undefined) val = resolveByKey(jsonData, clean);

        // 3. Final fallback
        return (val === undefined || val === null || val === '') ? 0 : Number(val) || 0;
    }





    // First pass: collect all overrides per target field.
    // Separate into 'set' (name = value) and 'add' (name [operators]) operations.
    // Support multiple formulas separated by newlines.
    const overrideList = {};

    document.querySelectorAll('.panel-block').forEach(block => {
        if (block.closest('template')) return; // skip template definitions

        const formulaEl = block.querySelector('[data-field-key="formula"]');
        const activeEl = block.querySelector('[data-field-key="formula_active"]');

        // Only process blocks where the formula toggle is checked.
        if (!formulaEl || !activeEl?.checked) return;

        const rawFormulas = formulaEl.value.trim();
        if (!rawFormulas) return;

        // Split by newlines and process each formula
        const lines = rawFormulas.split('\n').map(line => line.trim()).filter(line => line);

        lines.forEach(raw => {
            // Match "fieldName = expr" (set) or "fieldName [expr]" (modify)
            const match = raw.match(/^([a-zA-Z_][\w]*)\s*(.*)$/);
            if (!match) return;

            const targetKey = match[1].replace(/^character_/, '');
            const targetId = `${targetKey}_value`;
            let rest = match[2].trim();

            // Verify the target field actually exists on the main sheet.
            if (!document.getElementById(targetId)) return;

            let isSet = false;
            let formula = '';

            if (rest.startsWith('=')) {
                // Set mode: name = expr
                isSet = true;
                formula = rest.slice(1).trim();
                
                // Evaluate set operation now
                const operation = parseFormulaToOperation(formula);
                const computedValue = evaluateOperation(operation, characterData);
                
                if (!overrideList[targetId]) overrideList[targetId] = [];
                overrideList[targetId].push({
                    type: 'set',
                    value: Number(computedValue) || 0,
                    modifierExpr: null
                });
            } else if (rest) {
                // Modify mode: just store, don't evaluate yet
                if (!overrideList[targetId]) overrideList[targetId] = [];
                overrideList[targetId].push({
                    type: 'add',
                    value: 0,  // Will be calculated in second pass
                    modifierExpr: rest
                });
            }
        });
    });

    // Second pass: reduce each field's list of overrides.
    // For sets: pick the highest value as the new base.
    // For modifies: parse by PEMDAS, combine, and evaluate using the DOM value.
    const overrides = {};
    Object.entries(overrideList).forEach(([targetId, list]) => {
        const setOps = list.filter(o => o.type === 'set');
        const addOps = list.filter(o => o.type === 'add');

        // Start with highest set value, or 0 if no sets
        let finalValue = setOps.length > 0 ? Math.max(...setOps.map(o => o.value)) : 0;

        // Process modifiers if they exist
        if (addOps.length > 0) {
            const targetKey = targetId.replace(/_value$/, '');

            // For modifiers, determine base value by priority:
            // 1. Highest set value (if sets exist)
            // 2. Base JSON value (if no sets)
            // 3. Zero (if field doesn't exist in JSON)
            let baseValue = finalValue;  // This is highest set or 0
            
            if (setOps.length === 0) {
                // No set operations, try to get base JSON value
                const parts = targetKey.split('_');
                let jsonVal = characterData;
                for (const part of parts) {
                    if (jsonVal && typeof jsonVal === 'object') {
                        jsonVal = jsonVal[part];
                    } else {
                        jsonVal = undefined;
                        break;
                    }
                }
                if (jsonVal !== undefined && jsonVal !== null && typeof jsonVal !== 'object') {
                    baseValue = Number(jsonVal) || 0;
                }
            }
            
            // Create a temporary context with the determined base value
            const tempContext = JSON.parse(JSON.stringify(characterData));
            const parts = targetKey.split('_');
            
            if (parts.length === 1) {
                // Simple field name without underscores
                tempContext[targetKey] = baseValue;
            } else {
                // Nested field with underscores
                let obj = tempContext;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!obj[parts[i]]) obj[parts[i]] = {};
                    obj = obj[parts[i]];
                }
                obj[parts[parts.length - 1]] = baseValue;
            }

            // Parse each modifier expression by PEMDAS rules
            const parsed = addOps.map(op => parseModifierByPEMDAS(op.modifierExpr));

            // Separate mult/div operations from add/sub sub-expressions
            const multDivOps = parsed.filter(p => p.multDivPart);
            const addSubOps = parsed.filter(p => p.addSubPart);

            // Build ONE combined formula: all mult/div first, then all add/sub
            let combinedFormula = targetKey;
            
            // Add all mult/div parts
            multDivOps.forEach(op => {
                combinedFormula += ' ' + op.multDivPart;
            });
            
            // Add all add/sub parts
            addSubOps.forEach(op => {
                combinedFormula += ' ' + op.operator + ' (' + op.addSubPart + ')';
            });

            console.log('Combined formula:', combinedFormula, 'tempContext value:', tempContext[targetKey]);

            // Evaluate the combined modifier expression using the temp context with the set result
            const modifierOp = parseFormulaToOperation(combinedFormula);
            console.log('Operation object:', modifierOp);
            const modifierResult = evaluateOperation(modifierOp, tempContext);
            console.log('Modifier result:', modifierResult);
            finalValue = Number(modifierResult) || 0;
        }

        overrides[targetId] = { value: finalValue };
    });

    // Helper: Parse modifier expression by PEMDAS rules
    // Collects all * and / operations, stops at first + or -, treats rest as sub-expression
    function parseModifierByPEMDAS(expr) {
        expr = expr.trim();
        let multDivPart = '';
        let operator = null;
        let addSubPart = '';

        // Match tokens: operator followed by operand
        const regex = /([+\-*/])\s*([^+\-*/]+)/g;
        let match;
        let foundAddSub = false;

        while ((match = regex.exec(expr)) !== null) {
            const op = match[1];
            const operand = match[2].trim();

            if (!foundAddSub && (op === '*' || op === '/')) {
                // Collect mult/div operations
                multDivPart += ' ' + op + ' ' + operand;
            } else if (!foundAddSub && (op === '+' || op === '-')) {
                // First +/- marks the start of sub-expression
                foundAddSub = true;
                operator = op;
                addSubPart = operand;
            } else if (foundAddSub) {
                // Append to sub-expression
                addSubPart += ' ' + op + ' ' + operand;
            }
        }

        return {
            multDivPart: multDivPart.trim(),
            operator: operator,
            addSubPart: addSubPart.trim()
        };
    }

    // Third pass: restore fields that had overrides in a previous call but
    // no longer have any active override. Reads the JSON base to restore.
    document.querySelectorAll('[id$="_value"]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        if (!el.dataset.overrideApplied) return; // wasn't overridden before
        if (overrides[el.id]) return;            // still has an override — handle below

        // Restore: walk the JSON tree to find the original value.
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
        delete el.dataset.overrideApplied; // clear the override marker
    });

    // Fourth pass: apply each computed override to its target element.
    Object.entries(overrides).forEach(([targetId, override]) => {
        let el = document.getElementById(targetId);
        if (!el) {
            console.warn(`Panel override target not found: ${targetId}`);
            return;
        }

        el.value = override.value;
        el.dataset.overrideApplied = 'true';
        el.dataset.overrideValue = String(override.value);
    });
}

// ── End Dynamic Panels ───────────────────────────────────────────────────────


// ── Formula Evaluator ────────────────────────────────────────

// Evaluates an "operation" object (as produced by parseFormulaToOperation
// or stored in the character JSON) against a JSON data context and returns
// the computed result as a string or number.
//
// Variable resolution for numeric types prefers JSON path traversal;
// for string types (_mirror), it also checks the live DOM for _calculated fields.
//
// Depends on: nothing external (self-contained recursive evaluator)
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

    const BUILTINS = new Set([
        'Math', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'sqrt', 'pow',
        'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Number', 'String',
        'Boolean', 'true', 'false', 'null', 'undefined', 'Infinity', 'NaN'
    ]);

    let formula = (operationObj.value ?? '').trim();
    if (!formula) return '';

    // Excel-style reference: =fieldName
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formula)) {
        let val = resolveByPath(jsonData, formula);
        if (val === undefined) val = resolveByKey(jsonData, formula);

        if (val && typeof val === 'object' && val.object_id === 'operation') {
            return evaluateOperation(val, jsonData);
        }

        return val ?? '';
    }

    // Replace identifiers with numeric values for math expressions
    formula = formula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
        if (BUILTINS.has(match)) return match;
        return resolveVar(match);
    });

    if (/[^0-9a-zA-Z_+\-*\/(). \t]/.test(formula)) {
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



// ── Zoom / Scale ─────────────────────────────────────────────

// The sheet is rendered inside a container that is CSS-scaled using the
// --page-scale custom property. PAGE_WIDTH is the unscaled sheet width
// in pixels. TARGET_FILL is how much of the viewport width "Fit Width"
// mode should occupy (0.95 = 5% margin).
const PAGE_WIDTH = 816;
const TARGET_FILL = 0.95;

// zoomMode tracks which scaling strategy is currently active:
//   'manual' — user-set scale (zoom in/out buttons or direct label entry)
//   'width'  — scale to fill viewport width (Fit Width)
//   'page'   — scale to fit the full page height in the viewport (Fit Page)
let zoomMode = 'manual';
let manualScale = 1.0; // current scale when zoomMode === 'manual'

// Applies a scale factor by setting the CSS custom property and
// updating the zoom percentage label.
function applyScale(scale) {
    document.documentElement.style.setProperty('--page-scale', scale);
    document.getElementById('zoom_label').value = Math.round(scale * 100) + '%';
}

// Parses the zoom label input as a percentage and applies it as
// a manual scale. Falls back to the previous scale on invalid input.
document.getElementById('zoom_label').addEventListener('change', () => {
    const raw = document.getElementById('zoom_label').value.replace('%', '').trim();
    const parsed = parseFloat(raw) / 100;
    if (!isNaN(parsed) && parsed > 0) {
        zoomMode = 'manual';
        manualScale = Math.round(parsed * 100) / 100;
        updateScale();
    } else {
        applyScale(manualScale); // revert to last valid scale
    }
});

// Recalculates and applies the current scale based on zoomMode.
// Called by button handlers and on window resize.
function updateScale() {
    if (zoomMode === 'width') {
        // Fill the viewport width minus any visible scrollbar.
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const availableWidth = window.innerWidth - scrollbarWidth;
        applyScale(availableWidth / PAGE_WIDTH * TARGET_FILL);
    } else if (zoomMode === 'page') {
        // Fit the full sheet height (1056px = standard US letter at 96dpi)
        // into the viewport height minus the toolbar.
        const toolbar = document.querySelector('.toolbar');
        const toolbarHeight = toolbar ? toolbar.getBoundingClientRect().height : 0;
        applyScale((window.innerHeight - toolbarHeight) * 0.95 / 1056);
    } else {
        // Manual mode — just apply the stored scale directly.
        applyScale(manualScale);
    }
}

// Zoom out: decrease by 0.1, clamped to 0.25 minimum.
document.getElementById('zoom_out').addEventListener('click', () => {
    zoomMode = 'manual';
    manualScale = Math.max(0.25, Math.round((manualScale - 0.1) * 10) / 10);
    updateScale();
});

// Zoom in: increase by 0.1, clamped to 2.0 maximum.
document.getElementById('zoom_in').addEventListener('click', () => {
    zoomMode = 'manual';
    manualScale = Math.min(2.0, Math.round((manualScale + 0.1) * 10) / 10);
    updateScale();
});

// "Fit" button toggles between Fit Page and Fit Width modes.
// The button label switches to describe the OTHER mode (the one it
// will switch to on the next click), acting as a toggle indicator.
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

// Re-apply the current zoom whenever the window is resized so width/page
// fit modes stay accurate.
window.addEventListener('resize', updateScale);

// Initial scale on page load.
updateScale();


// ── Auto-refresh Calculated Fields ──────────────────────────────────────────

// Listens for any input event on the character sheet and:
//   1. Handles delta tracking for number fields that have panel overrides,
//      so arrow-key increments/decrements modify the JSON base value rather
//      than the displayed (overridden) value.
//   2. Syncs the live DOM back into the in-memory characters[selected] JSON.
//   3. Re-evaluates all _calculated formula fields.
//   4. Re-applies all panel overrides on top of the fresh values.
//
// This keeps the sheet fully reactive: changing any value immediately
// updates all derived fields (modifiers, bonuses, etc.) without a save.
//
// Depends on: characterSelect, characters, populateJsonFromHtml,
//             parseFormulaToOperation, evaluateOperation, applyPanelOverrides
document.getElementById('character-sheet').addEventListener('change', (e) => {
    const selected = characterSelect.value;
    if (!selected || !characters[selected]) return;

    // Panel inputs are handled internally by panel event listeners; skip them here.
    if (e.target.closest('[id$="_panel"]')) return;

    // If user is editing a formula field, store the formula and stop here
    if (e.target.id.endsWith('_calculated')) {
        const trimmed = e.target.value.trim();

        if (trimmed.startsWith('=')) {
            // Store the formula so populateJsonFromHtml can save it
            e.target.dataset.formula = trimmed;
            return; // do NOT evaluate or overwrite yet
        }
    }


    // Special handling for overridden number fields (e.g. HP modified by a spell):
    // When the user clicks the spinner arrows, they expect to change the base value,
    // not the override result. We compute the delta between what was shown before
    // and what the user typed, then apply that delta to the raw JSON base.
    if (e.target.dataset.overrideApplied && e.target.type === 'number') {
        const targetId = e.target.id;
        const key = targetId.replace(/_value$/, '');
        const parts = key.split('_');

        // Walk the JSON tree to find the current base value.
        let cursor = characters[selected];
        for (const part of parts) {
            if (cursor && typeof cursor === 'object') cursor = cursor[part];
            else { cursor = undefined; break; }
        }
        const currentBase = (cursor === undefined || typeof cursor === 'object')
            ? 0 : Number(cursor) || 0;

        // overrideValue is the result that was displayed before the user input.
        const previousOverrideResult = Number(e.target.dataset.overrideValue) || currentBase;
        const newDisplayed = Number(e.target.value) || 0;
        const userDelta = newDisplayed - previousOverrideResult; // how much the user changed it
        const newBase = currentBase + userDelta;                 // apply delta to the true base

        // Write the new base directly into the in-memory JSON tree.
        let obj = characters[selected];
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {};
            obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = String(newBase);

        // Temporarily set the field to show the base value so the serialiser
        // (populateJsonFromHtml) reads the base, not the override result.
        e.target.value = newBase;
    }

    // Sync the entire sheet DOM into the in-memory JSON.
    // This is the source of truth update that keeps characters[selected]
    // current for save, formula evaluation, and override resolution.
    characters[selected] = populateJsonFromHtml(characters[selected]);

    const characterData = characters[selected];

    // Re-evaluate every _calculated field using its stored formula.
    // defaultValue holds the formula string as set in the HTML (e.g. "=+strMod[profBonus]").
    document.querySelectorAll('[id$="_calculated"]').forEach(el => {
        if (el.closest('[id$="_panel"]')) return;
        if (el.hasAttribute('data-label')) return;
        const formula = el.dataset.formula || el.defaultValue?.trim();
        if (!formula?.startsWith('=')) return;
        el.value = evaluateOperation(parseFormulaToOperation(formula.slice(1).trim()), characterData);
    });

    // Re-apply panel overrides so any panel-driven bonuses reflect the
    // newly updated base values.
    applyPanelOverrides();
});