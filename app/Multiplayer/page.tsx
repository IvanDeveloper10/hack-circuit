import { Fragment } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import Link from 'next/link';

export default function Multiplayer() {
  return (
    <Fragment>
      <section className='p-20'>
        <h1 className='text-6xl text-2p text-center animate-bounce font-bold'><i className='text-cyan-300'>MUL</i>TIPLA<i className='text-green-300'>YER</i></h1>
        <div className='flex w-full justify-evenly items-center mt-20'>
          <Link href={'/Multiplayer/WizzardDuel'}>
            <Card isHoverable isPressable isBlurred className='w-96 h-72 p-10'>
              <CardHeader className='flex justify-center items-center'>
                <h1 className='text-center text-xl text-2p'>Wizzard Duel</h1>
              </CardHeader>
              <CardBody>
                <p className='text-poppins'>The wizard duel is based on facing a player who is online from another device and thus being able to fight in a PvP</p>
              </CardBody>
            </Card>
          </Link>
        </div>
      </section>
    </Fragment>
  );
}