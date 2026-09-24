declare module 'react-game-engine' {
  import type { ReactElement } from 'react';

  interface InputEvent {
    name: string;
    payload?: { key?: string };
  }

  interface EngineEvent {
    type: string;
  }

  interface EngineTime {
    current: number;
    previous: number | null;
    /** Millisecondes écoulées depuis la frame précédente. */
    delta: number;
    previousDelta: number | null;
  }

  interface GameEngineProps<Entities, Event extends EngineEvent> {
    entities: Entities;
    systems: ReadonlyArray<(entities: Entities, context: { input: readonly InputEvent[]; time: EngineTime; dispatch: (event: Event) => void }) => Entities>;
    onEvent?: (event: Event) => void;
    running?: boolean;
    className?: string;
  }

  export function GameEngine<Entities, Event extends EngineEvent>(props: GameEngineProps<Entities, Event>): ReactElement | null;
}