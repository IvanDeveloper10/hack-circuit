'use client';

import { Fragment, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/modal';
import { Button } from '@heroui/button';
import Link from 'next/link';

const wires = [
  { color: 'red', id: 'R' },
  { color: 'blue', id: 'B' },
  { color: 'green', id: 'G' },
  { color: 'yellow', id: 'Y' },
  { color: 'white', id: 'W' }
];

// La lógica correcta para este juego
const correctWires = ['B', 'W']; // Los que se deben cortar para ganar

export default function CasttleLevelThree() {
  const [cutWires, setCutWires] = useState<string[]>([]);
  const { isOpen: winOpen, onOpen: openWin } = useDisclosure();
  const { isOpen: loseOpen, onOpen: openLose } = useDisclosure();

  const handleCut = (id: string) => {
    if (cutWires.includes(id)) return;

    const newCuts = [...cutWires, id];
    setCutWires(newCuts);

    if (correctWires.every((w) => newCuts.includes(w)) && newCuts.length === correctWires.length) {
      openWin();
    } else if (newCuts.some((w) => !correctWires.includes(w))) {
      openLose();
    }
  };

  const handleRestart = () => setCutWires([]);

  return (
    <Fragment>
      <section className='flex justify-center items-center section-casttle-three'>
        <section className='h-screen flex flex-col justify-center items-center gap-y-8 bg-black px-10'>
          <h1 className='text-3xl text-purple-500 text-2p'>HACK THE CASTTLE</h1>
          <h1 className='text-3xl text-red-500 text-2p'>✂️ CUT THE WIRES</h1>
          <p className='text-white text-poppins max-w-lg'>
            A trap has been activated. You must cut the correct wires to disarm it.
            <br />
            <br />
            <strong>Clues:</strong>
            <br />
            - The blue wire is safe to cut.<br />
            - The white wire should be cut only if the red wire is untouched.<br />
            - Never cut the green wire.<br />
          </p>

          <div className='flex gap-6 flex-wrap justify-center'>
            {wires.map((wire) => (
              <div
                key={wire.id}
                onClick={() => handleCut(wire.id)}
                className={`w-24 h-6 rounded-full cursor-pointer ${cutWires.includes(wire.id) ? 'opacity-20' : ''
                  }`}
                style={{ backgroundColor: wire.color }}
              ></div>
            ))}
          </div>

          <Button onPress={handleRestart} variant='ghost' color='secondary' radius='none' className='w-full mt-6 text-2p'>
            🔁 RESTART
          </Button>

          <Modal isOpen={winOpen} placement='center'>
            <ModalContent>
              <ModalHeader className='text-green-500 text-2p'>🎉 Bomb Defused</ModalHeader>
              <ModalBody className='text-center text-poppins'>
                You cut the right wires. The trap is disabled!
              </ModalBody>
              <ModalFooter>
                <Link href='/FinishGame'>
                  <Button variant='ghost' color='secondary' radius='none' className='text-2p'>
                    FINISH GAME
                  </Button>
                </Link>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal isOpen={loseOpen} placement='center'>
            <ModalContent>
              <ModalHeader className='text-red-500 text-2p'>💥 Explosion!</ModalHeader>
              <ModalBody className='text-center text-poppins'>
                You cut the wrong wire. The trap exploded!
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => window.location.reload()}
                  variant='ghost'
                  color='secondary'
                  radius='none'
                  className='text-2p'
                >
                  TRY AGAIN
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </section>
      </section>
    </Fragment>
  );
}
