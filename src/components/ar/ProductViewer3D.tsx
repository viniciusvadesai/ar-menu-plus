import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Html, useGLTF } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { Product } from '@/data/mockData';
import * as THREE from 'three';

interface ProductViewer3DProps {
  product: Product;
}

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = scene.clone(true);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const normalizeScale = 2.5 / maxDim;

    cloned.scale.setScalar(normalizeScale);
    cloned.position.set(-center.x * normalizeScale, -box.min.y * normalizeScale, -center.z * normalizeScale);
  }, [cloned]);

  return <primitive object={cloned} />;
}

function PlateWithTexture({ image, ingredients }: { image: string; ingredients?: string[] }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.08, 64]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[1.3, 64]} />
        <meshStandardMaterial color="#ddd" roughness={0.6} />
      </mesh>
      {ingredients?.slice(0, 3).map((ing, i) => {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        return (
          <Html key={ing} position={[x, 0.8 + i * 0.15, z]} center distanceFactor={6}>
            <div className="glass-strong px-3 py-1.5 rounded-full whitespace-nowrap">
              <span className="text-xs font-medium text-foreground">{ing}</span>
            </div>
          </Html>
        );
      })}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground">Carregando 3D...</span>
      </div>
    </Html>
  );
}

const ProductViewer3D = ({ product }: ProductViewer3DProps) => {
  const hasGLB = !!product.model3dUrl;

  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-card border border-border relative">
      {hasGLB && (
        <div className="absolute top-3 left-3 z-10 glass-strong px-3 py-1.5 rounded-full">
          <span className="text-[10px] font-semibold gold-text">✦ Modelo 3D real</span>
        </div>
      )}
      <Canvas camera={{ position: [0, 3, 4], fov: 45 }} shadows dpr={[1, 2]}>
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
            {hasGLB ? (
              <GLBModel url={product.model3dUrl!} />
            ) : (
              <PlateWithTexture image={product.image} ingredients={product.ingredients} />
            )}
          </Float>
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={8} blur={2} far={4} />
          <Environment preset="studio" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            autoRotate
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ProductViewer3D;
