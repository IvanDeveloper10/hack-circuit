// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { Volume2, VolumeX } from 'lucide-react';
// import { Button } from '@heroui/button';

// // Hacemos una función global para iniciar el audio
// export let playBackgroundMusic: () => void = () => { };

// export default function AudioController() {
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [isMuted, setIsMuted] = useState(false);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     audio.loop = true;
//     audio.volume = 0.3;

//     // Exponer función global
//     playBackgroundMusic = () => {
//       audio.play().catch(() => { });
//     };
//   }, []);

//   const toggleMute = () => {
//     if (audioRef.current) {
//       audioRef.current.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   };

//   return (
//     <>
//       <audio controls>
//         <source src='/audio.mp3' type='audio/mp3' />
//         <track kind='captions' src='/captions.vtt' srcLang='en' label='English captions' default />
//       </audio>
//       <Button
//         onPress={toggleMute}
//         className='fixed top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full z-50'
//       >
//         {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
//       </Button>
//     </>
//   );
// }
