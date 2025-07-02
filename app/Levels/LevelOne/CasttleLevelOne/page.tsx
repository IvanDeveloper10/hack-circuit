'use client';

import { Fragment, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/button';
import Link from 'next/link';


const wires = [
  { color: 'red', symbol: '⭕' },
  { color: 'yellow', symbol: '△' },
  { color: 'blue', symbol: '✖' },
];

export default function CasttleOne() {
  const [connections, setConnections] = useState<{ [key: string]: string }>({});
  const { isOpen: isSuccessOpen, onOpen: openSuccess, onClose: closeSuccess, } = useDisclosure();
  const { isOpen: isErrorOpen, onOpen: openError, onClose: closeError, } = useDisclosure(); 

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, symbol: string) => {
    e.dataTransfer.setData('text/plain', symbol);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, to: string) => {
    const from = e.dataTransfer.getData('text/plain');

    if (from === to) {
      const newConnections = { ...connections, [from]: to };
      setConnections(newConnections);

      if (Object.keys(newConnections).length === wires.length) {
        setTimeout(openSuccess, 100);
      }
    } else {
        openError();
    }
  };

  return (
    <Fragment>
      <section className='w-full h-screen section-casttle-one flex flex-col justify-center items-center'>
        <div className='flex flex-col justify-center items-center gap-y-12'>
          <h1 className='text-hack-casttle text-purple-500 text-3xl'>HACK THE CASTTLE!!</h1>
          <p className='text-paragraph text-black w-96 text-center'>
            Drag the symbol on the left to the corresponding symbol on the right
          </p>
        </div>
        <div className='flex w-96 justify-between px-10 pt-10 h-96 items-center bg-black text-white rounded-large'>
          <div className='flex flex-col gap-6'>
            {wires.map((wire, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, wire.symbol)}
                className={`w-28 h-10 bg-${wire.color}-500 rounded-lg text-center flex items-center justify-center cursor-move`}
              >
                {wire.symbol}
              </div>
            ))}
          </div>

          <div className='flex flex-col gap-6'>
            {wires.map((wire, i) => (
              <div
                key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, wire.symbol)}
                className={`w-28 h-10 bg-${wire.color}-500 text-center flex items-center justify-center border-2 border-white`}
              >
                {connections[wire.symbol] ? '✅' : wire.symbol}
              </div>
            ))}
          </div>
        </div>

        <Modal isOpen={isSuccessOpen} placement='center' radius='none'>
          <ModalContent>
            <ModalHeader className='flex justify-center items-center'>
              <h1 className='text-instructions text-center text-3xl'>CASTTLE HACKED!</h1>
            </ModalHeader>
            <ModalBody>
              <p></p>
            </ModalBody>
            <ModalFooter>
              <Link href='/Levels'>
                <Button className='text-2xl text-next' variant='ghost' color='secondary' radius='none'>NEXT LEVEL</Button>
              </Link>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={ isErrorOpen } onClose={ closeError } placement='center' size='3xl'>
          <ModalContent>
            <ModalHeader className='text-2p'>
              <h1>❌ Incorrect connection</h1>
            </ModalHeader>
          </ModalContent>
        </Modal>
      </section>
    </Fragment>
  );
}
