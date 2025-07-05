'use client';

import { useState, useEffect, useRef } from 'react';
import { Image } from '@heroui/image';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';

interface Projectile {
  x: number;
  y: number;
}

interface BattleAreaProps {
  socket: any;
  player: { id: string; name: string };
  opponent: { id: string; name: string };
}

export default function BattleArea({ socket, player, opponent }: BattleAreaProps) {
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 400 });
  const [opponentPosition, setOpponentPosition] = useState({ x: 300, y: 50 });
  const [playerProjectiles, setPlayerProjectiles] = useState<Projectile[]>([]);
  const [opponentProjectiles, setOpponentProjectiles] = useState<Projectile[]>([]);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [opponentHealth, setOpponentHealth] = useState(10);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [showModal, setShowModal] = useState(false);

  const playerPosRef = useRef(playerPosition);
  const opponentPosRef = useRef(opponentPosition);

  useEffect(() => {
    playerPosRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    opponentPosRef.current = opponentPosition;
  }, [opponentPosition]);

  useEffect(() => {
    if (!socket) return;

    socket.on('opponentMove', (position: { x: number; y: number }) => {
      setOpponentPosition(position);
    });

    socket.on('opponentShoot', (projectile: Projectile) => {
      setOpponentProjectiles(prev => [...prev, projectile]);
    });

    socket.on('opponentHit', () => {
      setPlayerHealth(prev => prev - 1);
    });

    return () => {
      socket.off('opponentMove');
      socket.off('opponentShoot');
      socket.off('opponentHit');
    };
  }, [socket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 15;
      const newPosition = { ...playerPosRef.current };

      if (e.key === 'a' || e.key === 'A') newPosition.x = Math.max(newPosition.x - step, 0);
      if (e.key === 'd' || e.key === 'D') newPosition.x = Math.min(newPosition.x + step, 480);
      if (e.key === 'w' || e.key === 'W') newPosition.y = Math.max(newPosition.y - step, 0);
      if (e.key === 's' || e.key === 'S') newPosition.y = Math.min(newPosition.y + step, 400);

      setPlayerPosition(newPosition);
      socket.emit('playerMove', newPosition);

      if (e.code === 'Space') {
        const projectile = { x: newPosition.x + 12, y: newPosition.y - 10 };
        setPlayerProjectiles(prev => [...prev, projectile]);
        socket.emit('playerShoot', projectile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      // Proyectiles del jugador
      setPlayerProjectiles(prev =>
        prev
          .map(proj => {
            const newY = proj.y - 8;
            const hit =
              proj.x >= opponentPosRef.current.x &&
              proj.x <= opponentPosRef.current.x + 60 &&
              newY >= opponentPosRef.current.y &&
              newY <= opponentPosRef.current.y + 60;

            if (hit && opponentHealth > 0) {
              setOpponentHealth(h => Math.max(h - 1, 0));
              socket.emit('playerHit');
              return undefined;
            }

            return newY < -20 ? undefined : { ...proj, y: newY };
          })
          .filter((p): p is Projectile => p !== undefined)
      );

      // Proyectiles del oponente
      setOpponentProjectiles(prev =>
        prev
          .map(proj => {
            const newY = proj.y + 6;
            const hit =
              proj.x >= playerPosRef.current.x &&
              proj.x <= playerPosRef.current.x + 60 &&
              newY >= playerPosRef.current.y &&
              newY <= playerPosRef.current.y + 60;

            if (hit && playerHealth > 0) {
              setPlayerHealth(h => Math.max(h - 1, 0));
              return undefined;
            }

            return newY > 520 ? undefined : { ...proj, y: newY };
          })
          .filter((p): p is Projectile => p !== undefined)
      );
    }, 30);

    return () => clearInterval(gameLoop);
  }, [socket, opponentHealth, playerHealth]);

  useEffect(() => {
    if (opponentHealth <= 0) {
      setWinner('player');
      setShowModal(true);
    } else if (playerHealth <= 0) {
      setWinner('opponent');
      setShowModal(true);
    }
  }, [opponentHealth, playerHealth]);

  return (
    <div className="relative h-screen bg-gray-900">
      <div className="relative top-10 bg-gradient-to-b from-gray-900 to-black border-4 w-[600px] h-[500px] mx-auto overflow-hidden game-container">
        <div className="absolute left-2 top-2 text-white font-bold">
          ⚡ {player.name}: {playerHealth}
        </div>
        <div className="absolute right-2 top-2 text-white font-bold">
          🔥 {opponent.name}: {opponentHealth}
        </div>

        <Image
          src="/wizard-fire.png"
          width={140}
          height={80}
          className="absolute"
          style={{ left: opponentPosition.x, top: opponentPosition.y }}
          alt="Opponent"
        />

        <Image
          src="/wizard-circuit.png"
          width={140}
          height={80}
          className="absolute"
          style={{ left: playerPosition.x, top: playerPosition.y }}
          alt="Player"
        />

        {playerProjectiles.map((p, i) => (
          <div
            key={`player-proj-${i}`}
            className="absolute text-yellow-300 text-xl"
            style={{ left: p.x, top: p.y }}
          >
            ⚡
          </div>
        ))}

        {opponentProjectiles.map((p, i) => (
          <div
            key={`opponent-proj-${i}`}
            className="absolute text-red-500 text-xl"
            style={{ left: p.x, top: p.y }}
          >
            🔥
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>{winner === 'player' ? 'You Win!' : 'You Lost'}</ModalHeader>
          <ModalBody>
            {winner === 'player'
              ? `You defeated ${opponent.name}!`
              : `${opponent.name} was victorious.`}
          </ModalBody>
          <ModalFooter>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
