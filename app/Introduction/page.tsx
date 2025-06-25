'use client';

import { Fragment, useEffect, useState, useRef } from 'react';
import { Image } from '@heroui/image';
import { Button } from '@heroui/button';
import Link from 'next/link';


export default function Game() {
  const fullText = `Hello! I'm Merlin, the circuit wizard. My specific power is electricity. Help me defeat the evil fire wizard and hack his castle's circuit.`;
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[index]);
        setIndex(prev => prev + 1);
      }, 15);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);
  return (
    <Fragment>
      <section className='w-full h-screen flex flex-col justify-center items-center gap-10 px-20 bg-black text-white section-game'>
        <div className='w-full h-screen flex justify-center items-center gap-10 px-20 bg-black text-white'>
          <div className='flex flex-col'>
            <h1 className='text-instructions text-center text-3xl text-purple-500'>INTRODUCTION</h1>
            <p className='paragraph-merlin w-96'>
              {displayedText}
              {index < fullText.length && <span className='animate-pulse'>|</span>}
            </p>
          </div>
          <div>
            <Image src='/merlin.png' width='300px' />
          </div>
        </div>
        <div className='w-full flex justify-evenly items-center'>
          <Link href={'/'}><Button variant='ghost' color='secondary' radius='none' className='text-back w-72' size='lg'>BACK</Button></Link>
          <Link href={'/Instructions'}><Button variant='ghost' color='secondary' radius='none' className='text-continue w-72' size='lg'>CONTINUE</Button></Link>
        </div>
      </section>
    </Fragment>
  );
}