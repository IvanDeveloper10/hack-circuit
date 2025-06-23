'use client';

import { Fragment } from 'react';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { playBackgroundMusic } from '@/components/AudioController'; 

export default function Home(): JSX.Element {
  return (
    <Fragment>
      <section className='main-section flex flex-col gap-6 justify-center items-center w-full h-screen'>
        <h1 className='main-text text-8xl text-center'><i>HA</i>CK CIRCU<i>IT</i></h1>
        <Button onPress={() => {
          playBackgroundMusic();
        }} variant='shadow' radius='none' color='secondary' size='lg' className='text-button text-xl'><Link href={'/Introduction'}>CLICK HERE FOR START</Link></Button>
      </section>
    </Fragment>
  ); 
} 