import { useCallback, useEffect, useRef } from 'react';
import menuMusic from '../../Songs/World of Bidule.mp3';

export const useMenuAudio = () => {
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const startMenuMusic = useCallback(() => {
    void musicRef.current?.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    startMenuMusic();
    return () => {
      const music = musicRef.current;
      music?.pause();
      if (music) music.currentTime = 0;
    };
  }, [startMenuMusic]);

  return { menuMusic, musicRef, startMenuMusic };
};
