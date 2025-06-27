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

export default function LevelOne() {
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 400 });
  const [playerProjectiles, setPlayerProjectiles] = useState<{ x: number; y: number }[]>([]);
  const [npcPosition, setNpcPosition] = useState({ x: 0, y: 50 });
  const [npcDirection, setNpcDirection] = useState(1);
  const [npcProjectiles, setNpcProjectiles] = useState<{ x: number; y: number }[]>([]);
  const [npcHealth, setNpcHealth] = useState(15);
  const [playerHealth, setPlayerHealth] = useState(10);

  const [dragonPosition, setDragonPosition] = useState({ x: 480, y: 100 });
  const [dragonProjectiles, setDragonProjectiles] = useState<{ x: number; y: number }[]>([]);
  const [dragonHealth, setDragonHealth] = useState(8);

  const npcRef = useRef(npcPosition);
  const playerRef = useRef(playerPosition);
  const dragonRef = useRef(dragonPosition);

  const { isOpen, onOpen } = useDisclosure();
  const [winner, setWinner] = useState<'player' | 'npc' | null>(null);

  useEffect(() => {
    npcRef.current = npcPosition;
  }, [npcPosition]);

  useEffect(() => {
    playerRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    dragonRef.current = dragonPosition;
  }, [dragonPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPlayerPosition((prev) => {
        const step = 15;
        const next = { ...prev };
        if (e.key === 'a' || e.key === 'A') next.x = Math.max(prev.x - step, 0);
        if (e.key === 'd' || e.key === 'D') next.x = Math.min(prev.x + step, 530);
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
  }, []);

  useEffect(() => {
    if (npcHealth <= 0) return;

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
  }, [npcDirection, npcHealth]);

  useEffect(() => {
    if (dragonHealth <= 0) return;

    const dragonInterval = setInterval(() => {
      setDragonPosition((prev) => {
        const dx = (Math.random() - 0.5) * 20;
        const dy = (Math.random() - 0.5) * 20;

        const minX = 350;
        const maxX = 540;
        const minY = 20;
        const maxY = 200;

        const newX = Math.min(Math.max(prev.x + dx, minX), maxX);
        const newY = Math.min(Math.max(prev.y + dy, minY), maxY);

        return { x: newX, y: newY };
      });

      if (Math.random() < 0.5) {
        setDragonProjectiles((prev) => [
          ...prev,
          { x: dragonRef.current.x + 20, y: dragonRef.current.y + 40 }
        ]);
      }
    }, 1000);

    return () => clearInterval(dragonInterval);
  }, [dragonHealth]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      const npc = npcRef.current;
      const player = playerRef.current;

      setPlayerProjectiles((prev) =>
        prev
          .map((p) => {
            const newY = p.y - 8;

            const hitNpc =
              npcHealth > 0 &&
              p.x >= npc.x &&
              p.x <= npc.x + 60 &&
              newY >= npc.y &&
              newY <= npc.y + 60;

            if (hitNpc) {
              setNpcHealth((h) => Math.max(h - 1, 0));
              return null;
            }

            const hitDragon =
              dragonHealth > 0 &&
              p.x >= dragonRef.current.x &&
              p.x <= dragonRef.current.x + 60 &&
              newY >= dragonRef.current.y &&
              newY <= dragonRef.current.y + 60;

            if (hitDragon) {
              setDragonHealth((h) => Math.max(h - 1, 0));
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

      setDragonProjectiles((prev) =>
        prev
          .map((p) => {
            const newY = p.y + 5;
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
  }, [npcHealth, dragonHealth]);

  useEffect(() => {
    if (npcHealth <= 0 && dragonHealth <= 0) {
      setWinner('player');
      onOpen();
    } else if (playerHealth <= 0) {
      setWinner('npc');
      onOpen();
    }
  }, [npcHealth, dragonHealth, playerHealth, onOpen]);

  return (
    <Fragment>
      <div className='relative top-10 bg-gradient-to-b from-gray-900 to-black border-4 w-[600px] h-[500px] mx-auto overflow-hidden game-container2'>
        <div className='absolute left-2 top-2 text-white font-bold text-poppins'>
          ⚡ YOU: {playerHealth}
        </div>
        <div className='absolute right-2 top-2 text-white font-bold text-poppins'>
          🔥 FIRE WIZARD: {npcHealth}
        </div>
        <div className='absolute right-2 top-10 text-white font-bold text-poppins'>
          🐉 DRAGON: {dragonHealth}
        </div>

        {npcHealth > 0 && (
          <Image
            src='/wizard-fire.png'
            width={60}
            height={60}
            className='absolute'
            style={{ left: npcPosition.x, top: npcPosition.y }}
          />
        )}

        <Image
          src='/wizard-circuit.png'
          width={60}
          height={60}
          className='absolute'
          style={{ left: playerPosition.x, top: playerPosition.y }}
        />

        {dragonHealth > 0 && (
          <Image
            src='/dragon-fire.png'
            width={90}
            height={60}
            className='absolute'
            style={{ left: dragonPosition.x, top: dragonPosition.y }}
          />
        )}

        {playerProjectiles.map((p, i) => (
          <div
            key={`elec-${i}`}
            className='absolute text-yellow-300 text-xl animate-projectile'
            style={{ left: p.x, top: p.y }}
          >
            ⚡
          </div>
        ))}

        {npcProjectiles.map((p, i) => (
          <div
            key={`fire-${i}`}
            className='absolute text-red-500 text-xl animate-projectile'
            style={{ left: p.x, top: p.y }}
          >
            🔥
          </div>
        ))}

        {dragonProjectiles.map((p, i) => (
          <div
            key={`dragon-${i}`}
            className='absolute text-orange-400 text-xl animate-projectile'
            style={{ left: p.x, top: p.y }}
          >
            🔥
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} placement='center' radius='none'>
        <ModalContent>
          <ModalHeader className='flex justify-center items-center text-2xl modal-header'>
            {winner === 'player' ? '¡YOU WIN!' : 'GAME OVER'}
          </ModalHeader>
          <ModalBody className='modal-body'>
            {winner === 'player'
              ? 'Good Job Wizard!'
              : 'The fire mage and dragon defeated you.'}
          </ModalBody>
          <ModalFooter>
            {winner === 'player' ? (
              <Link href={'/CasttleLevelTwo'}>
                <Button variant='ghost' color='secondary' className='text-continue' radius='none'>
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
    </Fragment>
  );
}
