'use client'

import { Fragment, useState, useEffect } from 'react';
import { Image } from '@heroui/image';
import { Button } from '@heroui/button';
import Link from 'next/link';

export default function Instructions() {
  const fullText = `The instructions are simple: press A, W, S, and D to move around the game, and press Space to shoot. Once you defeat the wizard, hack his castle circuit and continue to the next level.`;
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

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
      <section className='w-full h-screen flex flex-col justify-center items-center gap-10 px-20 bg-black section-instructions'>
        <div className='w-full h-screen flex justify-center items-center gap-10 bg-black px-20'>
          <div className='flex flex-col'>
            <h1 className='text-center text-3xl text-purple-500 text-instructions'>INSTRUCTIONS</h1>
            <p className='paragraph-merlin w-96'>
              {displayedText}
              {index < fullText.length && <span className='animate-pulse'>|</span>}
            </p>
          </div>
          <div>
            <Image src='/merlin1.png' width={'300px'} />
          </div>
        </div>
        <div className='w-full flex justify-evenly items-center'>
          <Button variant='ghost' color='secondary' radius='none' className='text-back' size='lg'><Link href={'/Introduction'}>BACK</Link></Button>
          <Button variant='ghost' color='secondary' radius='none' className='text-continue' size='lg'><Link href={'/LevelOne'}>CONTINUE</Link></Button>
        </div>
      </section>
    </Fragment>
  );
}