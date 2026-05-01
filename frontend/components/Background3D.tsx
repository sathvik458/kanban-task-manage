"use client";

// A subtle 3D background: a few low-poly wireframe shapes that slowly rotate
// and bob up and down. Sits behind the whole app.
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

type ShapeProps = {
  position: [number, number, number];
  color: string;
};

// One floating shape. useFrame runs every animation frame.
function FloatingShape({ position, color }: ShapeProps) {
  const ref = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // Spin a little each frame
    ref.current.rotation.x += delta * 0.2;
    ref.current.rotation.y += delta * 0.3;
    // Drift up and down based on a sine wave
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

export function Background3D() {
  // A handful of shapes scattered across the scene
  const shapes: ShapeProps[] = [
    { position: [-4, 1, -2], color: "#a1a1aa" },
    { position: [4, -1, -3], color: "#71717a" },
    { position: [-2, -2, -1], color: "#d4d4d8" },
    { position: [3, 2, -2], color: "#a1a1aa" },
    { position: [0, 0, -4], color: "#e4e4e7" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-50">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        {shapes.map((s, i) => (
          <FloatingShape key={i} {...s} />
        ))}
      </Canvas>
    </div>
  );
}
