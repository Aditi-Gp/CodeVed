/**
 * Execution engine - Unified interface for all language executors
 * Provides factory pattern for creating language-specific executors
 */

import { CppExecutor } from "./cppExecutor.js";
import { JavaExecutor } from "./javaExecutor.js";
import { PythonExecutor } from "./pythonExecutor.js";

// Executor registry
const executors = {
  cpp: CppExecutor,
  java: JavaExecutor,
  python: PythonExecutor,
};

/**
 * Get executor instance for a given language
 * @param {string} language - Language identifier (cpp, java, python)
 * @param {object} config - Optional configuration overrides
 * @returns {BaseExecutor} Executor instance
 */
export function getExecutor(language, config = {}) {
  const normalizedLang = language.toLowerCase();
  
  if (!executors[normalizedLang]) {
    throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(executors).join(", ")}`);
  }

  return new executors[normalizedLang](config);
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language) {
  return language && executors[language.toLowerCase()] !== undefined;
}

/**
 * Get list of supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(executors);
}

export { CppExecutor, JavaExecutor, PythonExecutor };





