import { PauseIcon, PlayIcon, SoundOffIcon, SoundOnIcon } from '../assets/icons'

interface Props {
  secondsLeft: number
  score: number
  /** Bumps every time the score moves, so the number can punch. */
  pop: number
  paused: boolean
  canPause: boolean
  soundOn: boolean
  onTogglePause: () => void
  onToggleSound: () => void
}

const clock = (s: number) => `00:${String(Math.max(0, s)).padStart(2, '0')}`

export const ScoreHUD = ({
  secondsLeft,
  score,
  pop,
  paused,
  canPause,
  soundOn,
  onTogglePause,
  onToggleSound,
}: Props) => (
  <header className="hud">
    <div className="hud__side">
      <button
        type="button"
        className="hud__btn"
        onClick={onTogglePause}
        disabled={!canPause}
        aria-label={paused ? 'Resume game' : 'Pause game'}
      >
        {paused ? <PlayIcon size={17} /> : <PauseIcon size={17} />}
      </button>
      <button
        type="button"
        className="hud__btn"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      >
        {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
      </button>
    </div>

    <div className="hud__clock" role="timer" aria-label={`${secondsLeft} seconds left`}>
      {clock(secondsLeft)}
    </div>

    <div className="hud__score">
      <span className="hud__score-label">Score</span>
      <span key={pop} className={`hud__score-value${pop ? ' is-pop' : ''}`}>
        {score}
      </span>
    </div>
  </header>
)
