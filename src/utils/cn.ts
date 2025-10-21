import classNames from 'classnames';

type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean | undefined | null } | ClassValue[];

/**
 * Utility function to merge CSS classes using classnames library
 * Handles conditional classes and combines them into a single string
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': true })
 * // => 'px-2 py-1 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return classNames(...inputs);
}
