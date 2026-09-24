/**
 * Script de narration du jeu.
 * Chaque clé est un numéro de niveau ; le dialogue se joue avant que le niveau démarre,
 * moteur et chronomètre en pause. Un niveau absent de cette table démarre sans dialogue.
 */

/** Une réplique : une simple chaîne pour le héros, un objet dès qu'un autre personnage parle. */
export type DialogueLine = string | { speaker: string; text: string };

export const HERO_NAME = 'The Hero';

/** Nom du boss du niveau 4 : le changer ici le met à jour partout. */
export const BOSS_NAME = 'The Gatekeeper';

const boss = (text: string): DialogueLine => ({ speaker: BOSS_NAME, text });

export const levelDialogues: Record<number, DialogueLine[]> = {
  1: [
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAH *boom*',
    'ouch...',
    'that really hurt...',
    'I need to get up...',
    'Where am I?',
    'ah shit... here we go again...',
    'another dungeon',
    'I remember Chtululu killing me...',
    'why am I still here?',
    'and... why do i look like that?',
    'why the fuck do i have a beard?',
    'kinda like it actually.',
    'but still, this is weird...',
    'I need to figure out what is going on...',
    'I should start by exploring this place...',
  ],
  2: [
    'shit...',
    'another room?',
    'how many are they?',
    'those monsters are not like the ones before i fell',
    'and i lost all my skills',
    'i remember magic? or was it rage?',
    'i had a sword, or maybe a stick i dont remember clearly',
    'i would definitely love to have a sword right now...',
    'alright... focus, lets continue.',
    'I need to stay alert.',
  ],
  
  4: [
    'wait...',
    'its different here.',
    boss('well hello you'),
    'who are you? where am I? what is going on?',
    boss('ahahah, a lot of questions you ask.'),
    boss('you will find the answers soon enough.'),
    'how did i fell here?',
    boss('you died'),
    'yes but... i am not supposed to be here then',
    'and everything is so... vertical.',
    boss('that is the effect of Chtululus magic'),
    'what do you mean?',
    boss('you will have to understand it for yourself.'),
    boss('but not right now. i cant let you pass just yet.'),
    'im going through.',
    'one way or another',
    boss('we shall see about that.'),
  ],
};
