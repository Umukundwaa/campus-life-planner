//handles the regex search and highlighting

export function compileRegex(input, flags ='i'){
    try{
        return input ? new RegExp(input, flags) : null;
    } catch {
        return null;
    }
}
export function highlightText(text, regex){
    if(!regex) return text;
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
}