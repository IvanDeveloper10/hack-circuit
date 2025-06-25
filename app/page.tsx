'use client';

import { Fragment } from 'react';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home(): JSX.Element {
  return (
    <Fragment>
      <section className='main-section flex flex-col gap-6 justify-center items-center w-full h-screen'>
        <div className='absolute bg-stars animate-stars z-0 inset-1'></div>
        <motion.h1 className='main-text text-8xl text-white drop-shadow-lg font-extrabold text-center z-10 animate-bounce' initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0}} transition={{ duration: 1.2, type: 'spring'}}>
          <i className='text-yellow-400'>HA</i>CK CIRCU<i className='text-yellow-400'>IT</i>
        </motion.h1>
        <Link href={'/Introduction'}>
          <Button variant='shadow' radius='none' color='secondary' size='lg' className='text-xl px-8 py-4 transition duration-300 hover:scale-105 text-start'>CLICK HERE FOR START</Button>
        </Link>
      </section>
    </Fragment>
  ); 
} 