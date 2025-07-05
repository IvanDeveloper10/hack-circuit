'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import WaitingRoom from '@/components/WaitingRoom';
import BattleArea from '@/components/BattleArea';

type Player = {
  id: string;
  name: string;
  ready: boolean;
};

type Invitation = {
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export default function WizzardDuel() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [opponent, setOpponent] = useState<Player | null>(null);

  useEffect(() => {
    // Conectar al servidor Socket.io
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001');
    setSocket(newSocket);

    // Obtener nombre del jugador (puedes modificar esto para que el usuario lo ingrese)
    const playerName = `Player_${Math.floor(Math.random() * 1000)}`;

    // Registrar jugador
    newSocket.emit('register', playerName);

    // Escuchar lista de jugadores
    newSocket.on('players', (playersList: Player[]) => {
      setPlayers(playersList);
      const me = playersList.find(p => p.id === newSocket.id);
      if (me) setCurrentPlayer(me);
    });

    // Escuchar invitaciones
    newSocket.on('invitation', (inv: Invitation) => {
      setInvitation(inv);
    });

    // Escuchar inicio de juego
    newSocket.on('gameStart', (opponentData: Player) => {
      setOpponent(opponentData);
      setGameStarted(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendInvitation = (playerId: string) => {
    if (!socket || !currentPlayer) return;
    socket.emit('invite', {
      from: currentPlayer.id,
      to: playerId,
      fromName: currentPlayer.name
    });
  };

  const respondInvitation = (accept: boolean) => {
    if (!socket || !invitation) return;
    socket.emit('respondInvitation', {
      ...invitation,
      status: accept ? 'accepted' : 'rejected'
    });
    setInvitation(null);
  };

  if (gameStarted && opponent && currentPlayer) {
    return <BattleArea
      socket={socket}
      player={currentPlayer}
      opponent={opponent}
    />;
  }

  return (
    <WaitingRoom
      players={players.filter(p => p.id !== currentPlayer?.id)}
      currentPlayer={currentPlayer}
      invitation={invitation}
      onInvite={sendInvitation}
      onRespondInvitation={respondInvitation}
    />
  );
}