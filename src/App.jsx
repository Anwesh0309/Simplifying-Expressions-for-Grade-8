import React, { useState, useCallback } from 'react';
import { setMuted, stopNarration } from './utils/audio.js';
import { TopNav } from './components/TopNav.jsx';
import { IntroModal } from './stages/IntroPhase.jsx';
import { WonderPhase } from './stages/WonderPhase.jsx';
import { StoryPhase } from './stages/StoryPhase.jsx';
import { SimulatePhase } from './stages/SimulatePhase.jsx';
import { PracticeWorldSelect, PracticeQuiz } from './stages/PracticePhase.jsx';
import { ReflectPhase, CelebrationScreen } from './stages/ReflectPhase.jsx';

export function App() {
  const [phase, setPhase] = useState('intro');
  const [muted, setMutedState] = useState(false);
  const [xp, setXp] = useState(0);
  const [worldResults, setWorldResults] = useState(Array(10).fill(null));
  const [activeWorld, setActiveWorld] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [storySlideInfo, setStorySlideInfo] = useState(null);

  const completed = {
    wonder: phase !== 'intro' && phase !== 'wonder',
    story: !['intro', 'wonder', 'story'].includes(phase),
    simulate: !['intro', 'wonder', 'story', 'simulate'].includes(phase),
    practice: worldResults.some(r => r != null && r > 0),
    reflect: done
  };

  // stable callback: prevents the Story phase effect (and its narration) from restarting on every render
  const handleSlideChange = useCallback((current, total) => {
    setStorySlideInfo(prev => (prev && prev.current === current && prev.total === total ? prev : { current, total }));
  }, []);

  const totalStars = worldResults.reduce((a, b) => a + (b || 0), 0);

  const toggleMute = () => {
    setMutedState(m => {
      setMuted(!m);
      return !m;
    });
  };

  // Completely reset user progress whenever entering or restarting the module
  const resetProgress = () => {
    stopNarration();
    setXp(0);
    setWorldResults(Array(10).fill(null));
    setBestStreak(0);
    setDone(false);
    setStorySlideInfo(null);
    setActiveWorld(0);
  };

  const reset = () => {
    resetProgress();
    setPhase('intro');
  };

  const goPhase = (key) => {
    stopNarration(); // Immediately stop any running audio when skipping/navigating phases
    if (key !== 'story') setStorySlideInfo(null);
    if (key === 'practice') {
      setPhase('practice-worlds');
    } else {
      setPhase(key);
    }
  };

  const finishQuiz = (idx, starsEarned) => {
    stopNarration();
    if (starsEarned != null) {
      setWorldResults(prev => {
        const next = [...prev];
        next[idx] = starsEarned;
        return next;
      });
      setBestStreak(b => Math.max(b, starsEarned));
    }
    setPhase('practice-worlds');
  };

  return (
    <div className="app-container w-screen h-screen">
      {/* Top Navbar (Hidden on Intro Phase as requested) */}
      {phase !== 'intro' && (
        <TopNav
          phase={phase === 'practice-quiz' || phase === 'practice-worlds' ? 'practice' : phase}
          completed={completed}
          muted={muted}
          onToggleMute={toggleMute}
          onHome={() => {
            resetProgress();
            setPhase('intro');
          }}
          onGoPhase={goPhase}
          slideInfo={phase === 'story' ? storySlideInfo : null}
        />
      )}

      {/* Main Viewport Content Area */}
      <main className={`flex-1 min-h-0 flex flex-col relative overflow-hidden ${phase !== 'intro' ? 'pt-12' : ''}`}>
        {phase === 'intro' && (
          <IntroModal onBegin={() => {
            resetProgress();
            setPhase('wonder');
          }} />
        )}

        {phase === 'wonder' && (
          <WonderPhase muted={muted} onNext={() => {
            stopNarration();
            setPhase('story');
          }} />
        )}

        {phase === 'story' && (
          <StoryPhase
            muted={muted}
            onSlideChange={handleSlideChange}
            onDone={() => {
              stopNarration();
              setStorySlideInfo(null);
              setPhase('simulate');
            }}
          />
        )}

        {phase === 'simulate' && (
          <SimulatePhase muted={muted} onNext={() => {
            stopNarration();
            setPhase('practice-worlds');
          }} />
        )}

        {phase === 'practice-worlds' && !done && (
          <PracticeWorldSelect
            worldResults={worldResults}
            onPlay={i => {
              stopNarration();
              setActiveWorld(i);
              setPhase('practice-quiz');
            }}
            onGoReflect={() => {
              stopNarration();
              setPhase('reflect');
            }}
          />
        )}

        {phase === 'practice-quiz' && (
          <PracticeQuiz
            worldIndex={activeWorld}
            muted={muted}
            addXp={n => setXp(x => x + n)}
            onFinish={finishQuiz}
          />
        )}

        {phase === 'reflect' && !done && (
          <ReflectPhase
            xp={xp}
            stars={totalStars}
            bestStreak={bestStreak}
            worldResults={worldResults}
            muted={muted}
            onComplete={() => {
              stopNarration();
              setDone(true);
            }}
          />
        )}

        {done && (
          <CelebrationScreen
            xp={xp}
            stars={totalStars}
            muted={muted}
            onRestart={reset}
          />
        )}
      </main>
    </div>
  );
}
