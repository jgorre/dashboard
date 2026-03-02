// ─── SUBSTACK DATA ───

/**
 * @typedef {Object} Substack
 * @property {string} name
 * @property {string} author
 * @property {string} emoji
 * @property {string} url
 * @property {string} description
 * @property {'Deep AI'|'Data Engineering'|'Developing with AI'|'Philosophy'} category
 * @property {boolean} [featured]
 */

/** @type {Substack[]} */
import substacksData from '../data/substacks.json';
export const substacks = substacksData;
