'use client';

import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Fragment } from 'react';
import Link from 'next/link';

interface WaitingRoomProps {
  players: Array<{ id: string; name: string; ready: boolean }>;
  currentPlayer: { id: string; name: string; ready: boolean } | null;
  invitation: { from: string; to: string; status: string; fromName?: string } | null;
  onInvite: (playerId: string) => void;
  onRespondInvitation: (accept: boolean) => void;
}

export default function WaitingRoom({
  players,
  currentPlayer,
  invitation,
  onInvite,
  onRespondInvitation
}: WaitingRoomProps) {
  return (
    <Fragment>
      <Link href={'/'}>
        <Button radius='none' className='text-poppins absolute'>Back</Button>
      </Link>
      <div className='flex flex-col items-center justify-center h-screen text-white'>
        <h1 className='text-4xl font-bold mb-8 text-2p'>⚔️ <strong className='text-green-400'>WIZARD</strong><i className='text-pink-400'>ARENA</i> ⚔️</h1>
        <p className='text-center text-poppins mb-10'>Challenge players online to battle them.</p>

        <div className=' p-6 rounded-lg w-96 mb-8 flex flex-col justify-center items-center'>
          <h2 className='text-2xl font-semibold mb-4 text-poppins'>Players Online ({players.length})</h2>

          {players.length === 0 ? (
            <p className='text-gray-400 text-poppins'>Waiting for other players...</p>
          ) : (
            <ul className='space-y-2'>
              {players.map(player => (
                <li key={player.id} className='flex justify-between items-center p-2 hover:bg-gray-600 rounded'>
                  <span className='text-poppins'>🧙 {player.name}</span>
                  <Button
                    size='sm'
                    radius='none'
                    variant='ghost'
                    color='secondary'
                    className='text-2p ml-6'
                    onPress={() => onInvite(player.id)}
                  >
                    Challenge
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='text-white text-poppins'>
          {currentPlayer && `You are: ${currentPlayer.name}`}
        </div>

        <Modal isOpen={!!invitation} onClose={() => onRespondInvitation(false)}>
          <ModalContent>
            <ModalHeader>
              <h1 className='text-2p text-2xl'>DUEL INVITATION</h1>
            </ModalHeader>
            <ModalBody>
              <p className='text-poppins'>{invitation?.fromName} challenges you to a wizard duel!</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color='danger'
                variant='ghost'
                size='lg'
                radius='none'
                className='text-2p'
                onPress={() => onRespondInvitation(false)}
              >Reject</Button>
              <Button
                color='success'
                variant='ghost'
                size='lg'
                radius='none'
                className='text-2p'
                onPress={() => onRespondInvitation(true)}
              >Accept</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Fragment>
  );
}