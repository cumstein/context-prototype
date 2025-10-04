import { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";
import "./App.css";
import { GridPlanes } from "./components/grid-planes";

// 🧊 Solid Cube with edges + GSAP scroll rotation
function SolidCubeWithEdges({ cubeRef }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(3, 3, 3), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  const { camera } = useThree();

useEffect(() => {
  let rotationY = 0;

  const handleScroll = (e) => {
    rotationY += e.deltaY * 0.002; // حساسیت
    gsap.to(camera.position, {
      x: Math.sin(rotationY) * 8, // شعاع چرخش (۸ مثاله)
      z: Math.cos(rotationY) * 8,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        camera.lookAt(cubeRef.current.position); // همیشه به کیوب نگاه کنه
      },
    });
  };

  window.addEventListener("wheel", handleScroll, { passive: true });
  return () => window.removeEventListener("wheel", handleScroll);
}, [camera, cubeRef]);

  return (
    <group ref={cubeRef} position={[0, 1.5, 0]}>
      {/* solid white cube */}
      <mesh geometry={geometry}>
  <meshBasicMaterial color="#ffffff" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/>
  <Edges color="#999" /* threshold={15} */ />
</mesh>

      {/* wireframe overlay */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#999" linewidth={1} />
      </lineSegments>
    </group>
  );
}

// 🏷 Labels that follow the cube dynamically
function LabelsOnCube({ cubeRef }) {
  const labelGroup = useRef();

  // Sync the label group’s transform to the cube’s every frame
  useFrame(() => {
    if (cubeRef.current && labelGroup.current) {
      labelGroup.current.position.copy(cubeRef.current.position);
      labelGroup.current.quaternion.copy(cubeRef.current.quaternion);
    }
  });

  return (
    <group ref={labelGroup}>
      {/* CONTACT - front face */}
      <Text
        position={[0, 0, 1.51]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        CONTACT
      </Text>

      {/* ABOUT - back face */}
      <Text
        position={[0, 0, -1.51]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        ABOUT
      </Text>

      {/* PROJECTS - right face */}
      <Text
        position={[1.51, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        PROJECTS
      </Text>

      {/* NEWS - left face */}
      <Text
        position={[-1.51, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.25}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        NEWS
      </Text>
    </group>
  );
}

function Scene() {
  const cubeRef = useRef();

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

      {/* Cube & labels */}
      <SolidCubeWithEdges cubeRef={cubeRef} />
      <LabelsOnCube cubeRef={cubeRef} />

      {/* Grid backdrop */}
      <GridPlanes
        columns={20}
        planeDepth={3}
        planeWidth={3}
        position={[0, 0, 0]}
        rows={20}
        spacing={0.05}
      />
    </>
  );
}

// 💫 Splash Screen Component
function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="text-center space-y-6">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-7xl font-thin tracking-widest text-gray-800"
        >
          CONTEXT
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="h-px w-48 mx-auto bg-gray-800"
        />
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-xl font-light tracking-widest text-gray-600"
        >
          STUDIO
        </motion.p>
      </div>
    </motion.div>
  );
}

// 🎬 Main App
function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="w-full h-screen bg-white font-sans">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="w-full h-full"
        >
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute top-0 left-0 right-0 z-10 p-10"
          >
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <h1 className="text-3xl font-thin tracking-widest text-gray-800">
                CONTEXT STUDIO
              </h1>
              <nav className="space-x-10 text-base font-light tracking-wider text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors">
                  PROJECTS
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  ABOUT
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  CONTACT
                </a>
              </nav>
            </div>
          </motion.header>

          {/* 3D Scene */}
          <Canvas camera={{ position: [5, 5, 10], fov: 50, near: 0.1, far: 60 }} shadows>
            <Scene />
          </Canvas>

          {/* Footer */}
        </motion.div>
      )}
    </div>
  );
}

export default App;
