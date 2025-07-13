'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/modal';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

interface Message {
  id: string;
  text: string;
  name: string;
  replyTo?: string;
  replyText?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Mostrar modal hasta que se ingrese nombre
  useEffect(() => {
    onOpen();
  }, []);

  // Agregar usuario en línea y limpiar mensajes al iniciar
  useEffect(() => {
    if (!name.trim()) return;

    const userId = crypto.randomUUID();
    const userRef = doc(db, 'online-players', userId);
    setDoc(userRef, { name: name.trim(), lastSeen: Date.now() });

    const cleanup = async () => {
      await deleteDoc(userRef);
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [name]);

  // Escuchar usuarios conectados
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'online-players'), (snapshot) => {
      const now = Date.now();
      const users = snapshot.docs
        .map(doc => doc.data())
        .filter(user => now - user.lastSeen < 60000) // activos últimos 60s
        .map(user => user.name);
      setOnlineUsers(users);
    });
    return () => unsub();
  }, []);

  // Escuchar últimos mensajes
  useEffect(() => {
    const q = query(collection(db, 'global-chat'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        name: doc.data().name,
        replyTo: doc.data().replyTo,
        replyText: doc.data().replyText
      })));
    });
    return () => unsub();
  }, []);

  // Borrar mensajes antiguos al cargar
  useEffect(() => {
    const clearMessages = async () => {
      const ref = collection(db, 'global-chat');
      const snap = await getDocs(ref);
      snap.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    };
    clearMessages();
  }, []);

  // Enviar mensaje
  const sendMessage = async () => {
    if (!input.trim() || !name.trim()) return;

    await addDoc(collection(db, 'global-chat'), {
      text: input.trim(),
      name: name.trim(),
      createdAt: serverTimestamp(),
      replyTo: replyingTo?.id || null,
      replyText: replyingTo ? `${replyingTo.name}: ${replyingTo.text}` : null
    });

    setInput('');
    setReplyingTo(null);
  };

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Modal de nombre */}
      <Modal isOpen={isOpen} placement='center'>
        <ModalContent>
          <ModalHeader className='flex justify-center items-center'>
            <h1 className='text-poppins text-center'>ENTER YOUR PLAYER NAME</h1>
          </ModalHeader>
          <ModalBody>
            <Input
              label='Your Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='text-white text-poppins'
              radius='none'
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={() => name.trim() && onClose()}
              className='text-2p'
              color='secondary'
              variant='shadow'
              radius='none'
            >
              START CHATTING
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Chat principal */}
      <div className='fixed right-2 top-2 w-[300px] h-[500px] bg-black text-white p-2 flex flex-col border border-gray-600 z-50 shadow-xl text-poppins'>
        <div className='text-sm mb-2 text-poppins'>Online: {onlineUsers.join(', ')}</div>
        <div className='overflow-y-auto flex-1 mb-2 space-y-1 text-sm'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className='bg-gray-800 p-1 rounded relative group'
            >
              {msg.replyText && (
                <div className='text-xs text-gray-400 border-l-2 border-blue-400 pl-2 mb-1'>
                  ↪ {msg.replyText}
                </div>
              )}
              <span className='text-blue-400 font-bold'>{msg.name}:</span> {msg.text}
              <button
                className='absolute right-1 top-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100'
                onClick={() => setReplyingTo(msg)}
              >
                Reply
              </button>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {replyingTo && (
          <div className='text-xs text-gray-300 mb-1'>
            Replying to: {replyingTo.name}: {replyingTo.text}
            <button
              className='ml-2 text-red-400'
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </button>
          </div>
        )}
        <div className='flex gap-1'>
          <Input
            className='h-full'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            label='Say something...'
            radius='none'
          />
          <Button
            onPress={sendMessage}
            className='text-2p h-full'
            color='danger'
            variant='shadow'
            radius='none'
            size='lg'
          >
            Send
          </Button>
        </div>
      </div>
    </>
  );
}
