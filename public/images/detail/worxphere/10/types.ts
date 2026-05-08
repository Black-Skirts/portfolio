
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface OrbitConfig {
  radius: number;
  normal: Point3D; // Normal vector defining the plane of the orbit
  u: Point3D;      // Basis vector 1
  v: Point3D;      // Basis vector 2
}

export interface Label {
  text: string;
  orbitIndex: number;
  t: number;      // Current position on orbit (0 to 1)
  speed: number;  // Rotation speed
}

export interface SimulationSettings {
  backgroundColor: string;
  orbitCount: number;
  sphereRadius: number;
  fov: number;
  dashStyle: number[];
  minLabelSpeed: number;
  maxLabelSpeed: number;
  labelTiltEnabled: boolean;
  opacityRange: [number, number]; // [minAlpha, maxAlpha]
}
