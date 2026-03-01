import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getSunPosition, getMoonPosition, getSunSubsolarPoint, getMoonSublunarPoint } from '../services/astronomical';
import { calculatePrayerTimes } from '../services/prayerTimes';

interface Earth3DProps {
  userLatitude: number;
  userLongitude: number;
  currentTime: Date;
}

const EARTH_RADIUS = 5;
const SUN_DISTANCE = 12;
const MOON_DISTANCE = 8;
const EARTH_TILT = 23.5 * (Math.PI / 180);

const PRAYER_COLORS = {
  midnight: '#0a0a1a',
  tahajjud: '#1a1a3e',
  astronomicalDawn: '#2d2d5e',
  fajr: '#4a5899',
  sunrise: '#ff8844',
  dhuhr: '#66d9ff',
  asr: '#4db8ff',
  maghrib: '#ff6b35',
  isha: '#3d3d6e'
};

function Earth({ userLatitude, userLongitude, currentTime }: Earth3DProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const earthGroupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const sunSubsolarPoint = useMemo(() => getSunSubsolarPoint(currentTime), [currentTime]);
  const moonSublunarPoint = useMemo(() => getMoonSublunarPoint(currentTime), [currentTime]);

  const prayerZonesMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    const longitudeStep = 0.25;
    const numLongitudes = 360 / longitudeStep;
    const longitudeWidth = canvas.width / numLongitudes;

    for (let lon = -180; lon < 180; lon += longitudeStep) {
      const prayerTimes = calculatePrayerTimes({ latitude: 0, longitude: lon }, currentTime);

      const now = currentTime;
      const nowMs = now.getTime();

      const timesArray = [
        { name: 'midnight', time: prayerTimes.midnight },
        { name: 'tahajjud', time: prayerTimes.tahajjud },
        { name: 'astronomicalDawn', time: prayerTimes.astronomicalDawn },
        { name: 'fajr', time: prayerTimes.fajr },
        { name: 'sunrise', time: prayerTimes.sunrise },
        { name: 'dhuhr', time: prayerTimes.dhuhr },
        { name: 'asr', time: prayerTimes.asr },
        { name: 'maghrib', time: prayerTimes.maghrib },
        { name: 'isha', time: prayerTimes.isha }
      ];

      let currentPrayerName = 'midnight';
      let minDiff = Infinity;

      for (let i = 0; i < timesArray.length; i++) {
        const prayer = timesArray[i];
        const nextPrayer = timesArray[(i + 1) % timesArray.length];

        const prayerMs = prayer.time.getTime();
        const nextPrayerMs = nextPrayer.time.getTime();

        if (nextPrayerMs > prayerMs) {
          if (nowMs >= prayerMs && nowMs < nextPrayerMs) {
            currentPrayerName = prayer.name;
            break;
          }
        } else {
          if (nowMs >= prayerMs || nowMs < nextPrayerMs) {
            currentPrayerName = prayer.name;
            break;
          }
        }
      }

      const color = PRAYER_COLORS[currentPrayerName as keyof typeof PRAYER_COLORS];
      ctx.fillStyle = color;
      const x = ((lon + 180) / 360) * canvas.width;
      ctx.fillRect(Math.floor(x), 0, Math.ceil(longitudeWidth + 1), canvas.height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      emissive: new THREE.Color(0x222222),
      emissiveIntensity: 0.2
    });
  }, [currentTime]);

  const terminatorLine = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const lat = -90 + (180 * i / segments);
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (sunSubsolarPoint.longitude + 90 + 180) * (Math.PI / 180);

      const x = -((EARTH_RADIUS + 0.02) * Math.sin(phi) * Math.cos(theta));
      const z = (EARTH_RADIUS + 0.02) * Math.sin(phi) * Math.sin(theta);
      const y = (EARTH_RADIUS + 0.02) * Math.cos(phi);

      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [sunSubsolarPoint]);

  const midnightLine = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 200;

    for (let i = 0; i <= segments; i++) {
      const lat = -90 + (180 * i / segments);
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (sunSubsolarPoint.longitude - 90 + 180) * (Math.PI / 180);

      const x = -((EARTH_RADIUS + 0.02) * Math.sin(phi) * Math.cos(theta));
      const z = (EARTH_RADIUS + 0.02) * Math.sin(phi) * Math.sin(theta);
      const y = (EARTH_RADIUS + 0.02) * Math.cos(phi);

      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [sunSubsolarPoint]);

  const userMarker = useMemo(() => {
    const phi = (90 - userLatitude) * (Math.PI / 180);
    const theta = (userLongitude + 180) * (Math.PI / 180);

    const x = -(EARTH_RADIUS * Math.sin(phi) * Math.cos(theta));
    const z = EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);
    const y = EARTH_RADIUS * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }, [userLatitude, userLongitude]);

  const noonLabelPosition = useMemo(() => {
    const radius = EARTH_RADIUS + 2.5;
    const theta = (sunSubsolarPoint.longitude + 90 + 180) * (Math.PI / 180);
    const x = -(radius * Math.cos(theta));
    const z = radius * Math.sin(theta);
    return new THREE.Vector3(x, 0, z);
  }, [sunSubsolarPoint]);

  const midnightLabelPosition = useMemo(() => {
    const radius = EARTH_RADIUS + 2.5;
    const theta = (sunSubsolarPoint.longitude - 90 + 180) * (Math.PI / 180);
    const x = -(radius * Math.cos(theta));
    const z = radius * Math.sin(theta);
    return new THREE.Vector3(x, 0, z);
  }, [sunSubsolarPoint]);

  const sixAMLabelPosition = useMemo(() => {
    const radius = EARTH_RADIUS + 2.5;
    const theta = (sunSubsolarPoint.longitude + 180) * (Math.PI / 180);
    const x = -(radius * Math.cos(theta));
    const z = radius * Math.sin(theta);
    return new THREE.Vector3(x, 0, z);
  }, [sunSubsolarPoint]);

  const sixPMLabelPosition = useMemo(() => {
    const radius = EARTH_RADIUS + 2.5;
    const theta = (sunSubsolarPoint.longitude + 180 + 180) * (Math.PI / 180);
    const x = -(radius * Math.cos(theta));
    const z = radius * Math.sin(theta);
    return new THREE.Vector3(x, 0, z);
  }, [sunSubsolarPoint]);

  useEffect(() => {
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.z = EARTH_TILT;
    }

    const phi = (90 - sunSubsolarPoint.latitude) * (Math.PI / 180);
    const theta = (sunSubsolarPoint.longitude + 180) * (Math.PI / 180);

    const x = -(SUN_DISTANCE * Math.sin(phi) * Math.cos(theta));
    const z = SUN_DISTANCE * Math.sin(phi) * Math.sin(theta);
    const y = SUN_DISTANCE * Math.cos(phi);

    if (sunRef.current) {
      sunRef.current.position.set(x, y, z);
    }

    if (sunLightRef.current) {
      sunLightRef.current.position.set(x, y, z);
      sunLightRef.current.target.position.set(0, 0, 0);
      sunLightRef.current.target.updateMatrixWorld();
    }

    if (moonRef.current) {
      const moonPhi = (90 - moonSublunarPoint.latitude) * (Math.PI / 180);
      const moonTheta = (moonSublunarPoint.longitude + 180) * (Math.PI / 180);

      const moonX = -(MOON_DISTANCE * Math.sin(moonPhi) * Math.cos(moonTheta));
      const moonZ = MOON_DISTANCE * Math.sin(moonPhi) * Math.sin(moonTheta);
      const moonY = MOON_DISTANCE * Math.cos(moonPhi);

      moonRef.current.position.set(moonX, moonY, moonZ);
    }
  }, [sunSubsolarPoint, moonSublunarPoint]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight ref={sunLightRef} intensity={1.5} castShadow />

      <group ref={earthGroupRef}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshStandardMaterial color="#1a4d2e" roughness={0.8} />
        </mesh>

        <mesh>
          <sphereGeometry args={[EARTH_RADIUS + 0.01, 64, 64]} />
          <primitive object={prayerZonesMaterial} attach="material" />
        </mesh>

        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[EARTH_RADIUS + 0.3, 64, 64]} />
          <meshBasicMaterial color="#4a90e2" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>

        <line geometry={terminatorLine}>
          <lineBasicMaterial color="#ffaa00" linewidth={2} />
        </line>

        <line geometry={midnightLine}>
          <lineBasicMaterial color="#4444ff" linewidth={2} />
        </line>

        <mesh position={userMarker}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      </group>

      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#FDB813" toneMapped={false} />
      </mesh>

      <pointLight position={sunRef.current?.position || [0, 0, 0]} intensity={150} distance={50} decay={2} color="#FDB813" />

      <mesh ref={moonRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#e8e8e8" emissive="#666666" emissiveIntensity={0.5} />
      </mesh>

      <Text
        position={noonLabelPosition}
        fontSize={1.2}
        color="#ffdd00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
        fontWeight="bold"
      >
        12:00 PM
        {'\n'}
        NOON
      </Text>

      <Text
        position={midnightLabelPosition}
        fontSize={1.2}
        color="#6666ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
        fontWeight="bold"
      >
        12:00 AM
        {'\n'}
        MIDNIGHT
      </Text>

      <Text
        position={sixAMLabelPosition}
        fontSize={1.2}
        color="#ff8844"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
        fontWeight="bold"
      >
        6:00 AM
        {'\n'}
        SUNRISE
      </Text>

      <Text
        position={sixPMLabelPosition}
        fontSize={1.2}
        color="#ff6633"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
        fontWeight="bold"
      >
        6:00 PM
        {'\n'}
        SUNSET
      </Text>
    </>
  );
}

export default function Earth3D(props: Earth3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [15, 12, 15], fov: 65 }}>
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Earth {...props} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={80}
        />
      </Canvas>
    </div>
  );
}
