
import { SimulationSettings } from './types';

export const SETTINGS: SimulationSettings & { loopDuration: number } = {
  backgroundColor: '#1C1C1C', 
  orbitCount: 5, 
  sphereRadius: 280, 
  fov: 1500, 
  dashStyle: [1, 3], 
  minLabelSpeed: 0.0003,
  maxLabelSpeed: 0.001,
  labelTiltEnabled: false,
  opacityRange: [0.4, 0.7], 
  loopDuration: 30000, 
};

export const LABELS = [
  'Klik', 'Ninehire', 'Gigmon', 'Loop AI', 'Jobkorea', 
  'Bossmon', 'Jobplanet', 'Nooc', 'Gamejob', 'Albamon'
];