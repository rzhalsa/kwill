/**
 * Rule set that confirms each field has a value
 * @param value input value
 */
export function required (value){
    return !!value || 'Field is required';
}