'use client'

import { useState } from 'react';
import { Fragment } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from '@heroui/navbar';
import { Image } from '@heroui/image';
import Link from 'next/link';

export default function NavBar(): JSX.Element {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Fragment>
      <Navbar disableAnimation isBordered className='flex justify-evenly items-center'>
        <NavbarContent className='sm:hidden' justify='start'>
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarContent className='sm:hidden pr-3' justify='start'>
          <NavbarBrand>
            <Image src='/icono.png' width={'35px'} />
            <h1 className='logo-text ml-2'>Hack Circuit</h1>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden sm:flex gap-4' justify='start'>
          <NavbarBrand>
            <Image src='/icono.png' width={'35px'} />
            <h1 className='logo-text ml-2'>Hack Circuit</h1>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden sm:flex gap-4' justify='end'>
          <NavbarItem>
            <Link href={'/About'} className='text-about'>About</Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
            <NavbarMenuItem>
              hola
            </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </Fragment>
  );
}