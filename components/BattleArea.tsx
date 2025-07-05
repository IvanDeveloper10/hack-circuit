'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from '@heroui/image';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';

// ======= TIPOS DE DATOS ======= //
type ProjectileType = 'lightning' | 'fire';
type ProjectileOwner = 'player' | 'opponent';

interface Projectile {
  id: string;
  x: number;
  y: number;
  speed: number;
  owner: ProjectileOwner;
  type: ProjectileType;
}

interface Player {
  id: string;
  name: string;
  health: number;
  position: { x: number; y: number };
  score: number;
  type: 'lightning' | 'fire';
}

interface GameState {
  player: Player;
  opponent: Player;
  projectiles: Projectile[];
  winner: 'player' | 'opponent' | null;
  showModal: boolean;
  gameStarted: boolean;
  countdown: number;
  lastUpdate: number;
}

// ======= CONFIGURACIÓN DEL JUEGO ======= //
const GAME_CONFIG = {
  width: 600,
  height: 500,
  playerSize: 60,
  projectileSize: 20,
  moveStep: 15,
  playerSpeed: 8,
  opponentSpeed: 6,
  maxHealth: 20, // 20 de vida
  fireRate: 500, // ms entre disparos
  damagePerHit: 1, // 1 de daño por disparo
};

// Posiciones iniciales
const PLAYER_START_POSITION = { x: 270, y: 400 }; // Abajo
const OPPONENT_START_POSITION = { x: 270, y: 20 }; // Arriba

// ======= COMPONENTE PRINCIPAL ======= //
export default function BattleArea({ socket, player, opponent }: BattleAreaProps) {
  // Determinar roles (jugador con ID menor es el mago eléctrico)
  const isLightningMage = player.id < opponent.id;

  // Estado del juego
  const [gameState, setGameState] = useState<GameState>({
    player: {
      ...player,
      health: GAME_CONFIG.maxHealth,
      position: PLAYER_START_POSITION,
      score: 0,
      type: isLightningMage ? 'lightning' : 'fire',
    },
    opponent: {
      ...opponent,
      health: GAME_CONFIG.maxHealth,
      position: OPPONENT_START_POSITION,
      score: 0,
      type: isLightningMage ? 'fire' : 'lightning',
    },
    projectiles: [],
    winner: null,
    showModal: false,
    gameStarted: false,
    countdown: 3,
    lastUpdate: 0,
  });

  // Referencias
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastProjectileTime = useRef(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameRestarting = useRef(false);

  // Generar ID único para proyectiles
  const generateId = useCallback(() => Math.random().toString(36).substr(2, 9), []);

  // ======= EFECTOS PRINCIPALES ======= //

  // 1. Sincronizar inicio/restart del juego
  useEffect(() => {
    if (!socket) return;

    const handleGameRestart = () => {
      gameRestarting.current = true;
      setGameState({
        player: {
          ...player,
          health: GAME_CONFIG.maxHealth,
          position: PLAYER_START_POSITION,
          score: 0,
          type: isLightningMage ? 'lightning' : 'fire',
        },
        opponent: {
          ...opponent,
          health: GAME_CONFIG.maxHealth,
          position: OPPONENT_START_POSITION,
          score: 0,
          type: isLightningMage ? 'fire' : 'lightning',
        },
        projectiles: [],
        winner: null,
        showModal: false,
        gameStarted: false,
        countdown: 3,
        lastUpdate: 0,
      });
    };

    socket.on('gameRestart', handleGameRestart);
    return () => { socket.off('gameRestart', handleGameRestart); };
  }, [socket]);

  // 2. Contador inicial sincronizado (3, 2, 1)
  useEffect(() => {
    if (!gameState.gameStarted && !gameRestarting.current) {
      const timer = setInterval(() => {
        setGameState(prev => {
          if (prev.countdown <= 1) {
            clearInterval(timer);
            socket.emit('gameStart');
            return { ...prev, countdown: 0, gameStarted: true, lastUpdate: Date.now() };
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    gameRestarting.current = false;
  }, [gameState.gameStarted, gameState.countdown, socket]);

  // 3. Manejar eventos del socket
  useEffect(() => {
    if (!socket) return;

    const handleOpponentMove = (position: { x: number }) => {
      setGameState(prev => ({
        ...prev,
        opponent: {
          ...prev.opponent,
          position: { ...prev.opponent.position, x: position.x }
        },
      }));
    };

    const handleOpponentShoot = (projectile: Omit<Projectile, 'id'>) => {
      setGameState(prev => ({
        ...prev,
        projectiles: [...prev.projectiles, { ...projectile, id: generateId() }],
      }));
    };

    const handleOpponentHit = () => {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: Math.max(prev.player.health - GAME_CONFIG.damagePerHit, 0),
        },
      }));
    };

    const handleGameOver = (winner: 'player' | 'opponent') => {
      setGameState(prev => ({
        ...prev,
        winner,
        showModal: true,
        player: {
          ...prev.player,
          score: winner === 'player' ? prev.player.score + 1 : prev.player.score,
        },
        opponent: {
          ...prev.opponent,
          score: winner === 'opponent' ? prev.opponent.score + 1 : prev.opponent.score,
        },
      }));
    };

    socket.on('opponentMove', handleOpponentMove);
    socket.on('opponentShoot', handleOpponentShoot);
    socket.on('opponentHit', handleOpponentHit);
    socket.on('gameOver', handleGameOver);

    return () => {
      socket.off('opponentMove', handleOpponentMove);
      socket.off('opponentShoot', handleOpponentShoot);
      socket.off('opponentHit', handleOpponentHit);
      socket.off('gameOver', handleGameOver);
    };
  }, [socket, generateId]);

  // 4. Bucle principal del juego
  useEffect(() => {
    if (!gameState.gameStarted || gameState.winner) return;

    const gameLoop = () => {
      setGameState(prev => {
        if (!prev.gameStarted || prev.winner) return prev;

        // Mover proyectiles y detectar colisiones
        const newProjectiles = prev.projectiles
          .map(proj => {
            const speed = proj.owner === 'player' ? GAME_CONFIG.playerSpeed : GAME_CONFIG.opponentSpeed;
            const direction = proj.owner === 'player' ? -1 : 1;
            const newY = proj.y + (speed * direction);

            // Detectar colisión con el oponente
            const target = proj.owner === 'player' ? prev.opponent : prev.player;
            const hit = checkCollision(
              { x: proj.x, y: newY },
              target.position,
              GAME_CONFIG.projectileSize,
              GAME_CONFIG.playerSize
            );

            if (hit) {
              if (proj.owner === 'player') {
                socket.emit('playerHit');
              }
              return null; // Eliminar proyectil
            }

            // Eliminar si sale de la pantalla
            if (newY < -50 || newY > GAME_CONFIG.height + 50) {
              return null;
            }

            return { ...proj, y: newY };
          })
          .filter(Boolean) as Projectile[];

        // Verificar si hay un ganador
        let winner: 'player' | 'opponent' | null = null;
        if (prev.player.health <= 0) winner = 'opponent';
        if (prev.opponent.health <= 0) winner = 'player';

        return {
          ...prev,
          projectiles: newProjectiles,
          winner,
          showModal: winner !== null,
          lastUpdate: Date.now(),
        };
      });
    };

    const interval = setInterval(gameLoop, 30);
    return () => clearInterval(interval);
  }, [gameState.gameStarted, gameState.winner, socket]);

  // 5. Manejadores de teclado
  useEffect(() => {
    if (!gameState.gameStarted || gameState.winner) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = GAME_CONFIG.moveStep;
      const newPosition = { ...gameState.player.position };

      if (e.key === 'a' || e.key === 'A') newPosition.x = Math.max(newPosition.x - step, 0);
      if (e.key === 'd' || e.key === 'D') newPosition.x = Math.min(newPosition.x + step, GAME_CONFIG.width - GAME_CONFIG.playerSize);
      if (e.key === 'w' || e.key === 'W') newPosition.y = Math.max(newPosition.y - step, 50);
      if (e.key === 's' || e.key === 'S') newPosition.y = Math.min(newPosition.y + step, GAME_CONFIG.height - GAME_CONFIG.playerSize);

      setGameState(prev => ({
        ...prev,
        player: { ...prev.player, position: newPosition },
      }));
      socket.emit('playerMove', { x: newPosition.x });

      // Disparar con ESPACIO
      if (e.code === 'Space') {
        const now = Date.now();
        if (now - lastProjectileTime.current < GAME_CONFIG.fireRate) return;

        lastProjectileTime.current = now;

        const projectile = {
          id: generateId(),
          x: newPosition.x + GAME_CONFIG.playerSize / 2 - GAME_CONFIG.projectileSize / 2,
          y: newPosition.y,
          speed: GAME_CONFIG.playerSpeed,
          owner: 'player' as const,
          type: gameState.player.type,
        };

        setGameState(prev => ({
          ...prev,
          projectiles: [...prev.projectiles, projectile],
        }));

        socket.emit('playerShoot', {
          ...projectile,
          y: OPPONENT_START_POSITION.y + GAME_CONFIG.playerSize,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStarted, gameState.winner, socket, generateId]);

  // Función auxiliar para colisiones
  const checkCollision = (
    proj: { x: number; y: number },
    target: { x: number; y: number },
    projSize: number,
    targetSize: number
  ) => {
    return (
      proj.x < target.x + targetSize &&
      proj.x + projSize > target.x &&
      proj.y < target.y + targetSize &&
      proj.y + projSize > target.y
    );
  };

  // Reiniciar juego
  const restartGame = useCallback(() => {
    socket.emit('restartGame');
    setGameState({
      player: {
        ...player,
        health: GAME_CONFIG.maxHealth,
        position: PLAYER_START_POSITION,
        score: 0,
        type: isLightningMage ? 'lightning' : 'fire',
      },
      opponent: {
        ...opponent,
        health: GAME_CONFIG.maxHealth,
        position: OPPONENT_START_POSITION,
        score: 0,
        type: isLightningMage ? 'fire' : 'lightning',
      },
      projectiles: [],
      winner: null,
      showModal: false,
      gameStarted: false,
      countdown: 3,
      lastUpdate: 0,
    });
  }, [socket]);

  // ======= RENDERIZADO ======= //
  return (
    <div className="relative h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Marcador */}
      <div className="text-white text-xl mb-4">
        {gameState.player.name}: {gameState.player.score} - {gameState.opponent.name}: {gameState.opponent.score}
      </div>

      {/* Área de juego */}
      <div
        ref={gameAreaRef}
        className="relative bg-gradient-to-b from-gray-900 to-black border-4 border-purple-600 rounded-lg overflow-hidden"
        style={{ width: GAME_CONFIG.width, height: GAME_CONFIG.height }}
      >
        {/* Contador inicial */}
        {!gameState.gameStarted && gameState.countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-9xl font-bold z-10">
            {gameState.countdown}
          </div>
        )}

        {/* Barras de salud */}
        <div className="absolute top-2 left-0 right-0 flex justify-between px-4">
          <div className="flex items-center">
            <div className="text-white font-bold text-sm mr-2">
              {gameState.player.health}/{GAME_CONFIG.maxHealth}
            </div>
            <div
              className="bg-red-500 h-4 rounded"
              style={{
                width: `${(gameState.player.health / GAME_CONFIG.maxHealth) * 100}%`,
                maxWidth: '200px',
              }}
            />
          </div>
          <div className="flex items-center">
            <div
              className="bg-red-500 h-4 rounded mr-2"
              style={{
                width: `${(gameState.opponent.health / GAME_CONFIG.maxHealth) * 100}%`,
                maxWidth: '200px',
              }}
            />
            <div className="text-white font-bold text-sm">
              {gameState.opponent.health}/{GAME_CONFIG.maxHealth}
            </div>
          </div>
        </div>

        {/* Jugador local (Mago Eléctrico) */}
        <div
          className="absolute transition-all duration-100 z-10"
          style={{
            left: gameState.player.position.x,
            top: gameState.player.position.y,
            width: GAME_CONFIG.playerSize,
            height: GAME_CONFIG.playerSize,
          }}
        >
          <Image
            src="/wizard-circuit.png"
            width={GAME_CONFIG.playerSize}
            height={GAME_CONFIG.playerSize}
            alt="Tu personaje"
            className="w-full h-full"
          />
        </div>

        {/* Oponente (Mago de Fuego) */}
        <div
          className="absolute transition-all duration-100"
          style={{
            left: gameState.opponent.position.x,
            top: gameState.opponent.position.y,
            width: GAME_CONFIG.playerSize,
            height: GAME_CONFIG.playerSize,
          }}
        >
          <Image
            src="/wizard-fire.png"
            width={GAME_CONFIG.playerSize}
            height={GAME_CONFIG.playerSize}
            alt="Oponente"
            className="w-full h-full"
          />
        </div>

        {/* Proyectiles */}
        {gameState.projectiles.map(proj => (
          <div
            key={proj.id}
            className={`absolute text-2xl ${proj.type === 'lightning' ? 'text-yellow-300' : 'text-red-500'
              }`}
            style={{
              left: proj.x,
              top: proj.y,
              width: GAME_CONFIG.projectileSize,
              height: GAME_CONFIG.projectileSize,
            }}
          >
            {proj.type === 'lightning' ? '⚡' : '🔥'}
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      <div className="text-white mt-4 text-center">
        <p>Controles: WASD para moverte, ESPACIO para disparar</p>
        <p className="text-sm text-gray-400">
          Jugando como: {gameState.player.name} (Mago Eléctrico)
        </p>
      </div>

      {/* Modal de fin de juego */}
      <Modal isOpen={gameState.showModal} onClose={() => setGameState(prev => ({ ...prev, showModal: false }))}>
        <ModalContent>
          <ModalHeader className="text-2xl font-bold">
            {gameState.winner === 'player' ? '🎉 ¡Ganaste! 🎉' : '😢 ¡Perdiste! 😢'}
          </ModalHeader>
          <ModalBody className="text-center py-4">
            {gameState.winner === 'player'
              ? `¡Derrotaste a ${gameState.opponent.name}!`
              : `${gameState.opponent.name} te ha derrotado.`}
            <div className="mt-4 text-lg">
              Marcador: {gameState.player.score} - {gameState.opponent.score}
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-center">
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              onClick={restartGame}
            >
              Jugar de nuevo
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

interface BattleAreaProps {
  socket: any;
  player: { id: string; name: string };
  opponent: { id: string; name: string };
}