'use client';

import { Fragment, useEffect, useState } from 'react';
import { Image } from '@heroui/image';

export default function FinishGame() {
  const [fireworks, setFireworks] = useState<
    { id: number; left: number; top: number; color: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random();
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      setFireworks((prev) => [...prev.slice(-20), { id, left, top, color }]);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <Fragment>
      <Image src='/flag-orpheus-left.svg' width={200} className='absolute' />
      <div className='absolute inset-0 bg-stars animate-stars z-0'></div>
      <section className='w-full h-screen flex flex-col justify-center items-center z-10'>
        <h1 className='text-8xl text-2p animate-bounce text-white'><i className='text-purple-500'>FINISH</i> GAME!</h1>
        <p className='text-poppins text-white text-center px-4'>
          Many thanks to the hackers who played and I hope you enjoyed it a lot.
        </p>
      </section>
    </Fragment>
  );
}
