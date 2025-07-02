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

const correctOrder = ['3', '2', '1'];

export default function CasttleLevelTwo() {
  const [slots, setSlots] = useState<string[]>(['', '', '']);
  const { isOpen: isSuccessOpen, onOpen: openSuccess } = useDisclosure();
  const {
    isOpen: isErrorOpen,
    onOpen: openError,
    onClose: closeError
  } = useDisclosure();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const number = e.dataTransfer.getData('text');
    const newSlots = [...slots];

    if (newSlots[index] === '' && !newSlots.includes(number)) {
      newSlots[index] = number;
      setSlots(newSlots);

      if (newSlots.every((val) => val !== '')) {
        const isCorrect = newSlots.every((val, i) => val === correctOrder[i]);
        isCorrect ? openSuccess() : openError();
      }
    }
  };

  const handleReset = () => {
    setSlots(['', '', '']);
    closeError(); // Cierra el modal de error si está abierto
  };

  return (
    <Fragment>
      <section className='flex justify-center items-center section-casttle-two'>
        <section className='h-screen flex flex-col justify-center items-center gap-y-8 bg-black px-10'>
          <h1 className='text-3xl text-purple-500 text-2p'>🔐 HACK THE CASTLE !</h1>
          <p className='w-[80%] md:w-[500px] text-white text-poppins'>
            Arrange the numbers in the correct order based on these clues:
            <br />
            <strong>1.</strong> 2 is not in the middle. <br />
            <strong>2.</strong> 3 is first. <br />
            <strong>3.</strong> 1 comes after 2.
          </p>

          <div className='flex gap-4 text-2p'>
            {['1', '2', '3'].map((num) => (
              <div
                key={num}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text', num)}
                className='w-16 h-16 bg-blue-600 text-white text-2xl rounded-full flex items-center justify-center cursor-move'
              >
                {num}
              </div>
            ))}
          </div>

          <div className='flex gap-4 pt-6'>
            {slots.map((val, i) => (
              <div
                key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                className='w-16 h-16 bg-gray-800 text-white text-2xl border-2 border-white rounded-full flex items-center justify-center text-2p'
              >
                {val || '?'}
              </div>
            ))}
          </div>

          <Button onPress={handleReset} variant='ghost' color='secondary' radius='none' className='mt-4 text-2p w-full' >
            🔁 RESTART
          </Button>

          <Modal isOpen={isSuccessOpen} placement='center'>
            <ModalContent>
              <ModalHeader className='flex justify-center text-green-500 text-2xl text-2p'>
                CASTTLE HACKED!
              </ModalHeader>
              <ModalBody className='text-center text-poppins'>
                The code was correct. The gate is open.
              </ModalBody>
              <ModalFooter>
                <Link href='/Levels'>
                  <Button variant='ghost' color='secondary' radius='none' className='text-2p'>
                    NEXT LEVEL
                  </Button>
                </Link>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal isOpen={isErrorOpen} onClose={closeError} placement='center'>
            <ModalContent>
              <ModalHeader className='text-red-500 text-2p'>❌ Incorrect Code</ModalHeader>
              <ModalBody className='text-center text-poppins'>
                Try to analyze the clues again.
              </ModalBody>
            </ModalContent>
          </Modal>
        </section>
      </section>
    </Fragment>
  );
}
