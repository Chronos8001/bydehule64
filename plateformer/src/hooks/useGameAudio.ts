import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameStatus } from '../game/types';
import ambianceMusic from '../../Songs/ambiance bidule.mp3';
import bossMusic from '../../Songs/Boss fight.mp3';
import loseSound from '../../Songs/Loose.mp3';

interface UseGameAudioOptions {
  status: GameStatus;
  isBossLevel: boolean;
  spokenText: string;
  isVillain: boolean;
}

export const useGameAudio = ({ status, isBossLevel, spokenText, isVillain }: UseGameAudioOptions) => {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);
  const dialogueAudioRef = useRef<AudioContext | null>(null);
  const [visibleChars, setVisibleChars] = useState(0);
  const musicSource = isBossLevel ? bossMusic : ambianceMusic;

  const startMusic = useCallback(() => {
    void musicRef.current?.play().catch(() => undefined);
  }, []);

  const playDialogueClick = useCallback((villain = false) => {
    const context = dialogueAudioRef.current ?? new AudioContext();
    dialogueAudioRef.current = context;
    void context.resume().then(() => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = villain ? 'triangle' : 'square';
      oscillator.frequency.setValueAtTime(villain ? 470 : 900, now);
      oscillator.frequency.exponentialRampToValueAtTime(villain ? 300 : 520, now + 0.045);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.06);
    });
  }, []);

  const revealDialogue = useCallback(() => {
    setVisibleChars(spokenText.length);
  }, [spokenText.length]);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    if (status === 'playing') {
      startMusic();
      return;
    }

    music.pause();
    if (status === 'lost' || (status === 'won' && isBossLevel)) music.currentTime = 0;
  }, [isBossLevel, startMusic, status]);

  useEffect(() => {
    if (status !== 'lost') return;
    const sound = loseSoundRef.current;
    if (!sound) return;
    sound.currentTime = 0;
    void sound.play().catch(() => undefined);
  }, [status]);

  useEffect(() => {
    if (status !== 'intro') return;

    let characterIndex = 0;
    setVisibleChars(0);
    const intervalId = window.setInterval(() => {
      characterIndex += 1;
      setVisibleChars(characterIndex);
      if (spokenText[characterIndex - 1] !== ' ') playDialogueClick(isVillain);
      if (characterIndex >= spokenText.length) window.clearInterval(intervalId);
    }, 32);

    return () => window.clearInterval(intervalId);
  }, [isVillain, playDialogueClick, spokenText, status]);

  useEffect(() => () => {
    musicRef.current?.pause();
    loseSoundRef.current?.pause();
    void dialogueAudioRef.current?.close();
  }, []);

  return {
    loseSoundRef,
    loseSoundSource: loseSound,
    musicRef,
    musicSource,
    playDialogueClick,
    revealDialogue,
    startMusic,
    visibleChars,
  };
};
