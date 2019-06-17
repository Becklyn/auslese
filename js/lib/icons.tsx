import {h} from "preact";


/**
 * For the dropdown indicator
 */
export function ChevronIcon ()
{
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>;
}

/**
 * For the check mark inside selected choices
 */
export function CheckIcon ()
{
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.3 18.7L2.7 12l1.8-1.9 4.8 4.8L19.5 4.8l1.8 1.9z" /></svg>;
}

/**
 * As prefix for the search input
 */
export function SearchIcon ()
{
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
}

/**
 * The loading spinner
 */
export function LoadingIcon ()
{
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="15" height="15"><path d="M7.5 1.5a6 6 0 0 1 0 12V15A7.5 7.5 0 1 0 0 7.5h1.5a6.018 6.018 0 0 1 6-6z" /></svg>;
}


/**
 * Closing / deleting icon
 */
export function DeleteIcon ()
{
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
