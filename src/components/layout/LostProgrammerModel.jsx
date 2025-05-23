import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

// 🎵 Background Music Player Component with auto-play
function BackgroundMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create a new audio element if it doesn't exist in session storage
    if (!window.bgMusicElement) {
      window.bgMusicElement = new Audio('/3D/music.mp3');
      window.bgMusicElement.volume = 0.1;
      window.bgMusicElement.loop = true;
    }
    
    // Use the global audio element
    audioRef.current = window.bgMusicElement;
    
    // Check if music should be playing based on localStorage
    const shouldPlay = localStorage.getItem("bg-music-playing") !== "false";
    
    // Set initial state based on the audio's current playing status
    setIsPlaying(!audioRef.current.paused);
    
    // Auto-play if it should be playing
    if (shouldPlay && audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem("bg-music-playing", "true");
      }).catch(err => {
        console.log("Autoplay blocked by browser:", err);
      });
    }

    const resumeOnInteraction = () => {
      const shouldPlay = localStorage.getItem("bg-music-playing") !== "false";
      if (shouldPlay && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay still blocked:", err);
        });
      }
    };

    window.addEventListener("click", resumeOnInteraction);
    window.addEventListener("keydown", resumeOnInteraction);

    return () => {
      window.removeEventListener("click", resumeOnInteraction);
      window.removeEventListener("keydown", resumeOnInteraction);
      // Don't stop the music when component unmounts
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("bg-music-playing", "false");
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem("bg-music-playing", "true");
      }).catch(e => {
        console.log("Playback error:", e);
      });
    }
  };

  return (
    <div style={{
      position: 'fixed', // Changed from 'absolute' to 'fixed' to stay in view across pages
      bottom: '10px',
      right: '10px',
      zIndex: 1000,
      translate: 'translateY(-50%)'
    }}>
      <button
        onClick={togglePlay}
        style={{
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? (
          <i className="fa-solid fa-pause"></i>
        ) : (
          <i className="fa-solid fa-play"></i>
        )}
      </button>
    </div>
  );
}

// 🧍‍♂️ 3D Model Component
function LostProgrammerModel() {
  const modelRef = useRef();
  const { scene } = useGLTF('/3D/lost_programmer.glb');

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={2}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// 🎨 Main Canvas Component
export default function LostProgrammerCanvas() {
  return (
    <div style={{
      width: '100%',
      height: '300px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <BackgroundMusic />

      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.6} penumbra={0.5} />

        <Suspense fallback={null}>
          <LostProgrammerModel />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          enableDamping
          dampingFactor={0.1}
          autoRotate={true}
          autoRotateSpeed={2}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
}