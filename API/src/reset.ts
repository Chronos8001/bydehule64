import { db } from './db.js';

/** Vide la table des scores : `npm run reset`. */
const result = db.prepare('DELETE FROM scores').run();
console.log(`${result.changes} partie(s) supprimée(s). Base de scores vide.`);
