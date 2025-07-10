'use client';

import { Fragment } from 'react';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Image } from '@heroui/image';

export default function Home(): JSX.Element {
  return (
    <Fragment>
      <Image src='/sprig.svg' width={120} className='absolute top-96 left-10' />
      <Image src='/flag-orpheus-top.svg' width={200} className='absolute left-full' /> 

      <section className='main-section flex flex-col gap-6 justify-center items-center w-full h-screen'>
        <div className='absolute bg-stars animate-stars z-0 inset-1'></div>
        <motion.h1 className='main-text text-8xl text-white drop-shadow-lg font-extrabold text-center z-10 animate-bounce' initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0}} transition={{ duration: 1.2, type: 'spring'}}>
          <i className='text-yellow-400'>HA</i>CK CIRCU<i className='text-yellow-400'>IT</i>
        </motion.h1>
        <div className='flex justify-evenly w-full items-center'>
          <Link href={'/Introduction'}>
            <Button variant='shadow' radius='none' color='secondary' size='lg' className='text-xl px-8 py-4 transition duration-300 hover:scale-105 text-start'>SINGLE PLAYER</Button>
          </Link>
          <Link href={'/Cooperative'}>
            <Button variant='shadow' radius='none' color='success' size='lg' className='text-xl px-8 py-4 transition duration-300 hover:scale-105 text-start'>BLOG GAME</Button>
          </Link>
        </div>
      </section>
    </Fragment>
  ); 
} 