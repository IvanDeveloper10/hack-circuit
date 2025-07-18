'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Image } from '@heroui/image';
import { Button } from '@heroui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/modal';
import Link from 'next/link';
import Chat from '@/components/Chat';

export default function LevelOne() {
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 400 });
  const [playerProjectiles, setPlayerProjectiles] = useState<{ x: number; y: number }[]>([]);
  const [npcPosition, setNpcPosition] = useState({ x: 0, y: 50 });
  const [npcDirection, setNpcDirection] = useState(1);
  const [npcProjectiles, setNpcProjectiles] = useState<{ x: number; y: number }[]>([]);
  const [npcHealth, setNpcHealth] = useState(15);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [paused, setPaused] = useState(false);

  const npcRef = useRef(npcPosition);
  const playerRef = useRef(playerPosition);
  const { isOpen, onOpen } = useDisclosure();
  const [winner, setWinner] = useState<'player' | 'npc' | null>(null);

  useEffect(() => {
    npcRef.current = npcPosition;
  }, [npcPosition]);

  useEffect(() => {
    playerRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paused) return;

      setPlayerPosition((prev) => {
        const step = 15;
        const next = { ...prev };
        if (e.key === 'a' || e.key === 'A') next.x = Math.max(prev.x - step, 0);
        if (e.key === 'd' || e.key === 'D') next.x = Math.min(prev.x + step, 480);
        if (e.key === 'w' || e.key === 'W') next.y = Math.max(prev.y - step, 0);
        if (e.key === 's' || e.key === 'S') next.y = Math.min(prev.y + step, 400);
        return next;
      });

      if (e.code === 'Space') {
        setPlayerProjectiles((prev) => [
          ...prev,
          { x: playerRef.current.x + 12, y: playerRef.current.y - 10 }
        ]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paused]);

  useEffect(() => {
    if (npcHealth <= 0 || paused) return;

    const npcInterval = setInterval(() => {
      setNpcPosition((prev) => {
        let nextX = prev.x + 10 * npcDirection;
        let nextDirection = npcDirection;

        if (nextX <= 0 || nextX >= 540) {
          nextDirection = -npcDirection;
          setNpcDirection(nextDirection);
          nextX = prev.x + 10 * nextDirection;
        }

        setNpcProjectiles((projectiles) => [
          ...projectiles,
          { x: nextX + 20, y: prev.y + 40 }
        ]);

        return { ...prev, x: Math.max(0, Math.min(nextX, 540)) };
      });
    }, 1000);

    return () => clearInterval(npcInterval);
  }, [npcDirection, npcHealth, paused]);

  useEffect(() => {
    if (paused) return;

    const moveInterval = setInterval(() => {
      const npc = npcRef.current;
      const player = playerRef.current;

      setPlayerProjectiles((prev) =>
        prev
          .map((p) => {
            const newY = p.y - 8;
            const hit =
              p.x >= npc.x &&
              p.x <= npc.x + 60 &&
              newY >= npc.y &&
              newY <= npc.y + 60;

            if (hit && npcHealth > 0) {
              setNpcHealth((h) => Math.max(h - 1, 0));
              return null;
            }

            if (newY < -20) return null;
            return { ...p, y: newY };
          })
          .filter((p): p is { x: number; y: number } => p !== null)
      );

      setNpcProjectiles((prev) =>
        prev
          .map((p) => {
            const newY = p.y + 6;
            const hit =
              p.x >= player.x &&
              p.x <= player.x + 60 &&
              newY >= player.y &&
              newY <= player.y + 60;

            if (hit) {
              setPlayerHealth((h) => Math.max(h - 1, 0));
              return null;
            }

            if (newY > 520) return null;
            return { ...p, y: newY };
          })
          .filter((p): p is { x: number; y: number } => p !== null)
      );
    }, 30);

    return () => clearInterval(moveInterval);
  }, [npcHealth, paused]);

  useEffect(() => {
    if (npcHealth <= 0) {
      setWinner('player');
      onOpen();
    } else if (playerHealth <= 0) {
      setWinner('npc');
      onOpen();
    }
  }, [npcHealth, playerHealth, onOpen]);

  return (
    <Fragment>
      <section className='section-level-one w-full h-screen'>
        <div className='relative top-10 bg-gradient-to-b from-gray-900 to-black border-4 w-[600px] h-[500px] mx-auto overflow-hidden game-container'>
          <div className='absolute top-2 left-1/2 transform -translate-x-1/2 z-10'>
            <Button
              onPress={() => setPaused((prev) => !prev)}
              className='text-2p'
              color='secondary'
              radius='none'
              variant='shadow'
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </Button>
          </div>

          {/* Vidas */}
          <div className='absolute left-2 top-2 text-white font-bold text-poppins'>
            ⚡ YOU: {playerHealth}
          </div>
          <div className='absolute right-2 top-2 text-white font-bold text-poppins'>
            🔥 FIRE WIZARD: {npcHealth}
          </div>

          {/* NPC */}
          {npcHealth > 0 && (
            <Image
              src='/wizard-fire.png'
              width={140}
              height={80}
              className='absolute'
              style={{ left: npcPosition.x, top: npcPosition.y }}
            />
          )}

          {/* Jugador */}
          <Image
            src='/wizard-circuit.png'
            width={140}
            height={80}
            className='absolute'
            style={{ left: playerPosition.x, top: playerPosition.y }}
          />

          {/* Proyectiles del jugador */}
          {playerProjectiles.map((p, i) => (
            <div
              key={`elec-${i}`}
              className='absolute text-yellow-300 text-xl animate-projectile'
              style={{ left: p.x, top: p.y }}
            >
              ⚡
            </div>
          ))}

          {/* Proyectiles del NPC */}
          {npcProjectiles.map((p, i) => (
            <div
              key={`fire-${i}`}
              className='absolute text-red-500 text-xl animate-projectile'
              style={{ left: p.x, top: p.y }}
            >
              🔥
            </div>
          ))}
        </div>

        {/* Modal final */}
        <Modal isOpen={isOpen} placement='center' radius='none'>
          <ModalContent>
            <ModalHeader className='flex justify-center items-center text-2xl modal-header'>
              {winner === 'player' ? '¡YOU WIN!' : 'GAME OVER'}
            </ModalHeader>
            <ModalBody className='modal-body'>
              {winner === 'player'
                ? 'Good Job Wizard!'
                : 'The fire mage defeated you.'}
            </ModalBody>
            <ModalFooter>
              {winner === 'player' ? (
                <Link href={'/Levels/LevelOne/CasttleLevelOne'}>
                  <Button
                    variant='ghost'
                    color='secondary'
                    className='text-continue'
                    radius='none'
                  >
                    HACK THE CASTTLE!
                  </Button>
                </Link>
              ) : (
                <Button
                  variant='ghost'
                  color='secondary'
                  className='text-continue'
                  radius='none'
                  onPress={() => window.location.reload()}
                >
                  TRY AGAIN
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </section>

      {/* Chat en tiempo real */}
      <Chat />
    </Fragment>
  );
}
