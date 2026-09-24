import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameEngine } from 'react-game-engine';
import { Button } from '../components/ui/Button';
import { introLines } from '../data/scriptDialogue';
import { initialWorld, WorldSprite } from '../game/level1';
import { gameSystems } from '../game/systems';
import type { GameEvent, GameStatus } from '../game/types';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GameStatus>('intro');
  const [runId, setRunId] = useState(0);
  const [introIndex, setIntroIndex] = useState(0);

  const advanceIntro = useCallback(() => {
    setIntroIndex((current) => {
      const nextIndex = current + 1;
      if (nextIndex >= introLines.length) {
        setStatus('playing');
        setRunId((run) => run + 1);
        return 0;
      }
      return nextIndex;
    });
  }, []);

  const restart = useCallback(() => {
    setStatus('playing');
    setIntroIndex(0);
    setRunId((run) => run + 1);
  }, []);

  const handleEvent = useCallback((event: GameEvent) => {
    if (event.type === 'win') setStatus('won');
    if (event.type === 'lose') setStatus('lost');
  }, []);

  useEffect(() => {
    if (status !== 'intro') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      advanceIntro();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceIntro, status]);
  const focusEngine = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.querySelector<HTMLElement>('.platformer-engine')?.focus();
  };

  return (
    <section className="platformer-shell">
      <div className="platformer-stage" onClick={focusEngine} aria-label="Platformer game. Use arrow keys or A and D to move, and Up or W to jump.">
        <GameEngine className="platformer-engine" key={runId} systems={gameSystems} entities={{ world: { ...initialWorld(), renderer: WorldSprite } }} onEvent={handleEvent} running={status === 'playing'} />
        {status === 'intro' && (
          <div className="platformer-overlay platformer-intro" aria-live="polite">
            <div className="dialogue-box" role="dialog" aria-label="Intro dialogue" onClick={advanceIntro}>
              <p className="dialogue-name">The Hero</p>
              <p>{introLines[introIndex] ?? introLines[introLines.length - 1]}</p>
              <span className="dialogue-hint">Press Enter</span>
            </div>
          </div>
        )}
        {status !== 'playing' && status !== 'intro' && <div className="platformer-overlay"><p>{status === 'won' ? 'LEVEL CLEAR' : 'TRY AGAIN'}</p><Button onClick={restart}>{status === 'won' ? 'NEXT LEVEL' : 'RESTART'}</Button></div>}
      </div>
      <Button variant="danger" onClick={() => navigate('/')}>BACK TO MENU</Button>
    </section>
  );
};