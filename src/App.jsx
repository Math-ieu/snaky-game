import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [level, setLevel] = useState(1);
  const [foodEaten, setFoodEaten] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const gameRef = useRef(null);

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood([15, 15]);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
    setIsPlaying(false);
    setLevel(1);
    setFoodEaten(0);
  };

  const checkCollision = useCallback((head) => {
    if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
      return true;
    }
    for (let i = 1; i < snake.length; i++) {
      if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
        return true;
      }
    }
    return false;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const head = [snake[0][0] + direction.x, snake[0][1] + direction.y];

    if (checkCollision(head)) {
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    const newSnake = [head, ...snake];

    if (head[0] === food[0] && head[1] === food[1]) {
      setFood(generateFood());
      const newFoodEaten = foodEaten + 1;
      setFoodEaten(newFoodEaten);
      setScore(prev => prev + (10 * level));
      
      // Augmenter le niveau tous les 10 aliments mangés
      if (newFoodEaten % 10 === 0) {
        setLevel(prev => prev + 1);
        setSpeed(prev => Math.max(50, prev - 10));
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, checkCollision, generateFood]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [isPlaying, moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying && !gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying, gameOver]);

  // Gestion des contrôles tactiles pour mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !isPlaying || gameOver) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Swipe horizontal
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction.x === 0) {
          setDirection({ x: 1, y: 0 });
        } else if (deltaX < 0 && direction.x === 0) {
          setDirection({ x: -1, y: 0 });
        }
      }
    } else {
      // Swipe vertical
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && direction.y === 0) {
          setDirection({ x: 0, y: 1 });
        } else if (deltaY < 0 && direction.y === 0) {
          setDirection({ x: 0, y: -1 });
        }
      }
    }

    setTouchStart(null);
  };

  const handleDirectionClick = (newDirection) => {
    if (!isPlaying || gameOver) return;

    if (newDirection === 'up' && direction.y === 0) {
      setDirection({ x: 0, y: -1 });
    } else if (newDirection === 'down' && direction.y === 0) {
      setDirection({ x: 0, y: 1 });
    } else if (newDirection === 'left' && direction.x === 0) {
      setDirection({ x: -1, y: 0 });
    } else if (newDirection === 'right' && direction.x === 0) {
      setDirection({ x: 1, y: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 max-w-2xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6 text-green-800">
          🐍 Jeu du Serpent
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="space-y-1">
            <div className="text-2xl md:text-3xl font-bold text-green-700">
              Score: {score}
            </div>
            <div className="text-xs md:text-sm text-gray-600 flex gap-2 md:gap-4">
              <span>🍎 Mangées: {foodEaten}</span>
              <span>⚡ Niveau: {level}</span>
            </div>
            {highScore > 0 && (
              <div className="text-xs md:text-sm text-yellow-600 font-semibold">
                🏆 Meilleur: {highScore}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={gameOver}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm md:text-base"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'Pause' : 'Jouer'}
            </button>
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm md:text-base"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div 
          ref={gameRef}
          className="border-4 border-green-800 rounded-lg relative bg-green-50 mx-auto touch-none"
          style={{ 
            width: GRID_SIZE * CELL_SIZE, 
            height: GRID_SIZE * CELL_SIZE,
            maxWidth: '100%',
            aspectRatio: '1/1'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {snake.map((segment, i) => (
            <div
              key={i}
              className={`absolute ${i === 0 ? 'bg-green-700' : 'bg-green-500'} rounded-sm`}
              style={{
                left: segment[0] * CELL_SIZE,
                top: segment[1] * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}

          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              left: food[0] * CELL_SIZE,
              top: food[1] * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />

          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Game Over!
                </h2>
                <p className="text-2xl text-white mb-2">Score: {score}</p>
                <p className="text-lg text-yellow-300 mb-2">Niveau atteint: {level}</p>
                <p className="text-md text-green-300 mb-4">Nourriture mangée: {foodEaten}</p>
                {score === highScore && score > 0 && (
                  <p className="text-xl text-yellow-400 mb-4 animate-pulse">
                    🏆 Nouveau record! 🏆
                  </p>
                )}
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
                >
                  Rejouer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles tactiles pour mobile */}
        <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto md:hidden">
          <div></div>
          <button
            onClick={() => handleDirectionClick('up')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-4 rounded-lg flex items-center justify-center transition"
          >
            <ArrowUp size={24} />
          </button>
          <div></div>
          
          <button
            onClick={() => handleDirectionClick('left')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-4 rounded-lg flex items-center justify-center transition"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={() => handleDirectionClick('down')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-4 rounded-lg flex items-center justify-center transition"
          >
            <ArrowDown size={24} />
          </button>
          <button
            onClick={() => handleDirectionClick('right')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-4 rounded-lg flex items-center justify-center transition"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        <div className="mt-4 text-center text-gray-600">
          <p className="text-xs md:text-sm">
            <span className="hidden md:inline">Utilisez les flèches du clavier</span>
            <span className="md:hidden">Glissez sur l'écran ou utilisez les boutons</span>
          </p>
          <p className="text-xs mt-2">
            🎯 Tous les 10 aliments: +1 niveau et vitesse augmentée!
          </p>
          <p className="text-xs text-green-600 font-semibold mt-1">
            Points par aliment: {10 * level} (x{level})
          </p>
        </div>
      </div>
    </div>
  );
}