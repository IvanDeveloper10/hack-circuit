import { Fragment } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';

export default function Levels() {
  return (
    <Fragment>
      <div className='absolute inset-0 bg-stars animate-stars z-0'></div>
      <section className='w-full h-screen flex flex-col gap-10 justify-center items-center'>
        <div>
          <h1 className='text-2p text-8xl text-center animate-pulse'><i className='text-cyan-300'>LE</i>VE<i className='text-purple-300'>LS</i></h1>
        </div>
        <div className='flex w-full justify-around items-center'>
          <Card className='p-10'>
            <CardHeader>
              <h2 className='text-2p animate-sway'>Level One</h2>
            </CardHeader>
            <CardBody className='flex justify-center items-center'>
              <Link href={'/LevelOne'}>
                <Button color='success' variant='ghost' radius='none' className='text-xl text-2p '>LEVEL ONE</Button>
              </Link>
            </CardBody>
          </Card>
          <Card className='p-10'>
            <CardHeader>
              <h2 className='text-2p animate-sway'>Level Two</h2>
            </CardHeader>
            <CardBody className='flex justify-center items-center'>
              <Link href={'/LevelTwo'}>
                <Button color='warning' variant='ghost' radius='none' className='text-xl text-2p'>LEVEL TWO</Button>
              </Link>
            </CardBody>
          </Card>
          <Card className='p-10'>
            <CardHeader>
              <h2 className='text-2p animate-sway'>Level Three</h2>
            </CardHeader>
            <CardBody className='flex justify-center items-center'>
              <Link href={'/LevelThree'}>
                <Button color='danger' variant='ghost' radius='none' className='text-xl text-2p'>LEVEL THREE</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>
    </Fragment>
  ); 
}