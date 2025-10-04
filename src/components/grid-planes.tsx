import { type ThreeEvent, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type PlaneProps = {
  position: [number, number, number]
  planeDepth: number
  planeWidth: number
}

type GridPlanesProps = {
  position?: [number, number, number]
  rows: number
  columns: number
  planeWidth: number
  planeDepth: number
  spacing: number
}

export function GridPlanes({
  position = [0, 0, 0],
  rows,
  columns,
  planeWidth,
  planeDepth,
  spacing,
}: GridPlanesProps) {
  const gridWidth = columns * (planeWidth + spacing) - spacing
  const gridDepth = rows * (planeDepth + spacing) - spacing // ← باگ قبلی اصلاح شد

  const startX = planeWidth / 2 - gridWidth / 2
  const startZ = planeDepth / 2 - gridDepth / 2

  const planes: React.ReactNode[] = []

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const x = startX + column * (planeWidth + spacing)
      const z = startZ + row * (planeDepth + spacing)

      planes.push(
        <Plane
          key={`plane-${row}-${column}`}
          planeDepth={planeDepth}
          planeWidth={planeWidth}
          position={[x, -0.125, z]}
        />,
      )
    }
  }

  return <group position={position}>{planes}</group>
}

function Plane({ position, planeDepth, planeWidth }: PlaneProps) {
  const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>>(null)

  const [hovered, setHovered] = useState(false)
  const [opacity, setOpacity] = useState(0)

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f2f2f2',
      emissive: '#f2f2f2',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0,
    })
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const mat = meshRef.current.material
    const targetColorObj = new THREE.Color('#000000')

    gsap.to(mat.color, {
      r: targetColorObj.r,
      g: targetColorObj.g,
      b: targetColorObj.b,
      duration: 0.4,
      ease: 'power2.out',
    })
    gsap.to(mat.emissive, {
      r: targetColorObj.r,
      g: targetColorObj.g,
      b: targetColorObj.b,
      duration: 0.4,
      ease: 'power2.out',
    })
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const targetOpacity = hovered ? 0.8 : 0.1
    const lerpFactor = hovered ? 0.1 : 0.03
    const next = THREE.MathUtils.lerp(opacity, targetOpacity, lerpFactor)
    setOpacity(next)

    const mat = meshRef.current.material
    mat.opacity = next
    mat.emissiveIntensity = hovered ? 1.5 : 0.8
  })

  const handlePointerMove = (_e: ThreeEvent<PointerEvent>) => setHovered(true)
  const handlePointerOut = (_e: ThreeEvent<PointerEvent>) => setHovered(false)

  return (
    <mesh
      material={material}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      position={position}
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[planeWidth, planeDepth]} />
    </mesh>
  )
}
