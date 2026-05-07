// ── Formula Evaluator ────────────────────────────────────────

// Evaluates an "operation" object (as produced by parseFormulaToOperation
// or stored in the character JSON) against a JSON data context and returns
// the computed result as a string or number.
//
// Variable resolution for numeric types prefers JSON path traversal;
// for string types (_mirror), it also checks the live DOM for _calculated fields.
//
// Depends on: nothing external (self-contained recursive evaluator)
export function evaluateOperation(operationObj, jsonData) {
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