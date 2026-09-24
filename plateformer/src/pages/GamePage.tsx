import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GameEngine } from 'react-game-engine';
import { Button } from '../components/ui/Button';
import { introLines } from '../data/scriptDialogue';
import { levels } from '../game/levels';
import { WorldSprite } from '../game/WorldSprite';
import { gameSystems } from '../game/systems';
import type { GameEvent, GameStatus } from '../game/types';
import { ApiError, createScore, GAME_NAME } from '../services/api';
import './GamePage.css';

type SubmitState = 'idle' | 'saving' | 'saved' | 'error';

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
};

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // `?level=3` : entrée directe depuis le Dev Mode, sans l'introduction.
  const requested = Number(searchParams.get('level'));
  const startIndex = Number.isInteger(requested) && requested >= 1 && requested <= levels.length ? requested - 1 : 0;

  const [status, setStatus] = useState<GameStatus>(startIndex === 0 ? 'intro' : 'playing');
  const [runId, setRunId] = useState(0);
  const [introIndex, setIntroIndex] = useState(0);
  const [levelIndex, setLevelIndex] = useState(startIndex);
  const [coins, setCoins] = useState(0);
  const [clearedLevels, setClearedLevels] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // La durée envoyée à l'API doit être lisible hors du cycle de rendu.
  const elapsedRef = useRef(0);
  // Le moteur dispatche encore quelques ticks avant de s'arrêter : on filtre les doublons.
  const statusRef = useRef<GameStatus>('intro');
  statusRef.current = status;

  useEffect(() => {
    if (status !== 'playing') return;
    const origin = Date.now() - elapsedRef.current;
    const intervalId = window.setInterval(() => {
      elapsedRef.current = Date.now() - origin;
      setElapsedMs(elapsedRef.current);
    }, 100);
    return () => window.clearInterval(intervalId);
  }, [status]);

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

  /** Niveau suivant : les pièces et le chrono de la partie sont conservés. */
  const nextLevel = useCallback(() => {
    setLevelIndex((current) => current + 1);
    setStatus('playing');
    setRunId((run) => run + 1);
  }, []);

  /** Nouvelle partie : tous les compteurs repartent de zéro. */
  const newGame = useCallback(() => {
    elapsedRef.current = 0;
    setElapsedMs(0);
    setCoins(0);
    setClearedLevels(0);
    setLevelIndex(startIndex);
    setSubmitState('idle');
    setSubmitError(null);
    setIntroIndex(0);
    setStatus('playing');
    setRunId((run) => run + 1);
  }, [startIndex]);

  const handleEvent = useCallback((event: GameEvent) => {
    if (statusRef.current !== 'playing') return;
    if (event.type === 'coin') setCoins((current) => current + 1);
    if (event.type === 'win') {
      statusRef.current = 'won';
      setClearedLevels((current) => current + 1);
      setStatus('won');
    }
    if (event.type === 'lose') {
      statusRef.current = 'lost';
      setStatus('lost');
    }
  }, []);

  const submitScore = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitState('saving');
      setSubmitError(null);
      try {
        await createScore({
          player: playerName.trim(),
          game: GAME_NAME,
          coins,
          levels: clearedLevels,
          durationMs: elapsedRef.current,
        });
        setSubmitState('saved');
      } catch (error) {
        setSubmitError(
          error instanceof ApiError
            ? (error.fields[0]?.message ?? error.message)
            : 'Erreur inattendue pendant l’enregistrement.',
        );
        setSubmitState('error');
      }
    },
    [clearedLevels, coins, playerName],
  );

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

  const isLastLevel = levelIndex >= levels.length - 1;
  const recap = `${coins} pièces · ${clearedLevels} niveau(x) · ${formatTime(elapsedMs)}`;

  const scoreForm =
    submitState === 'saved' ? (
      <>
        <p className="platformer-recap">Score enregistré pour {playerName.trim()}.</p>
        <div className="platformer-actions">
          <Button onClick={() => navigate('/leaderboard')}>VOIR LE CLASSEMENT</Button>
          <Button variant="secondary" onClick={newGame}>REJOUER</Button>
        </div>
      </>
    ) : (
      <form className="platformer-form" onSubmit={submitScore}>
        <label htmlFor="player-name">Entrez votre nom</label>
        <input
          id="player-name"
          name="player"
          autoFocus
          maxLength={20}
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          placeholder="Votre pseudo"
        />
        {submitError && <p role="alert" className="platformer-error">{submitError}</p>}
        <div className="platformer-actions">
          <Button type="submit" disabled={submitState === 'saving' || playerName.trim().length < 2}>
            {submitState === 'saving' ? 'ENVOI…' : 'ENREGISTRER'}
          </Button>
          <Button type="button" variant="secondary" onClick={newGame}>REJOUER</Button>
        </div>
      </form>
    );

  return (
    <section className="platformer-shell">
      <div className="platformer-hud">
        <span className="hud-item"><b>PIÈCES</b> {coins}</span>
        <span className="hud-item"><b>NIVEAU</b> {levelIndex + 1}/{levels.length}</span>
        <span className="hud-item"><b>TEMPS</b> {formatTime(elapsedMs)}</span>
      </div>

      <div className="platformer-stage" onClick={focusEngine} aria-label="Platformer game. Use arrow keys or A and D to move, and Up or W to jump. Reach the door on the right to finish the level.">
        <GameEngine className="platformer-engine" key={runId} systems={gameSystems} entities={{ world: { ...levels[levelIndex]!.build(), renderer: WorldSprite } }} onEvent={handleEvent} running={status === 'playing'} />

        {status === 'intro' && (
          <div className="platformer-overlay platformer-intro" aria-live="polite">
            <div className="dialogue-box" role="dialog" aria-label="Intro dialogue" onClick={advanceIntro}>
              <p className="dialogue-name">The Hero</p>
              <p>{introLines[introIndex] ?? introLines[introLines.length - 1]}</p>
              <span className="dialogue-hint">Press Enter</span>
            </div>
          </div>
        )}

        {status === 'won' && !isLastLevel && (
          <div className="platformer-overlay">
            <p>LEVEL CLEAR</p>
            <p className="platformer-recap">{recap}</p>
            <Button onClick={nextLevel}>NEXT LEVEL</Button>
          </div>
        )}

        {status === 'won' && isLastLevel && (
          <div className="platformer-overlay">
            <p>VICTOIRE</p>
            <p className="platformer-recap">{recap}</p>
            {scoreForm}
          </div>
        )}

        {status === 'lost' && (
          <div className="platformer-overlay">
            <p>GAME OVER</p>
            <p className="platformer-recap">{recap}</p>
            {scoreForm}
          </div>
        )}
      </div>

      <Button variant="danger" onClick={() => navigate('/')}>BACK TO MENU</Button>
    </section>
  );
};