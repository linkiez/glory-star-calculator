import type { MachineProfile } from './MachineProfile';
import type { MachineProfileId } from './MachineProfileId';
import { HPR_CARBON_STEEL_RECIPES } from './hprCarbonSteelRecipes';
import {
  ACCELERATION_TIME, CUTTING_SPEEDS, KERF_DISTANCE, MAX_DISTANCE_FOR_HEAD_DOWN,
  MAX_DISTANCE_FOR_JUMP, MIN_DISTANCE_FOR_ACCELERATION, PIERCE_TIMES, RAPID_SPEED, SETUP_TIME
} from '../reference/index';

/** Machine catalog; missing process or table-motion parameters always require explicit caller input. */
export const MACHINE_PROFILES: Readonly<Record<MachineProfileId, MachineProfile>> = Object.freeze({
  'glory-star-gs3015': Object.freeze({
    id: 'glory-star-gs3015',
    name: 'Glory Star GS3015',
    parameterStatus: 'reference',
    cuttingSpeeds: Object.freeze({ ...CUTTING_SPEEDS }),
    pierceTimes: Object.freeze({ ...PIERCE_TIMES }),
    rapidSpeed: RAPID_SPEED,
    setupTimeSec: SETUP_TIME,
    referenceMotion: Object.freeze({
      accelerationTimeSec: ACCELERATION_TIME,
      minDistanceMm: MIN_DISTANCE_FOR_ACCELERATION
    }),
    kerfDistances: Object.freeze({ ...KERF_DISTANCE }),
    maxDistanceForHeadDown: MAX_DISTANCE_FOR_HEAD_DOWN,
    maxDistanceForJump: MAX_DISTANCE_FOR_JUMP
  }),
  'talvi-6000w-raytools': Object.freeze({
    id: 'talvi-6000w-raytools',
    name: 'Talvi 6000 W / Raytools',
    laserPowerW: 6000,
    cuttingHead: 'Raytools',
    parameterStatus: 'requires-parameters'
  }),
  'hypertherm-hpr400xd': Object.freeze({
    id: 'hypertherm-hpr400xd',
    name: 'Hypertherm HPR400XD / aço carbono O₂/ar',
    maxCurrentA: 400,
    material: 'carbon-steel',
    plasmaGas: 'O2',
    shieldGas: 'Air',
    parameterStatus: 'reference',
    exactThicknessOnly: true,
    cuttingSpeeds: Object.freeze(Object.fromEntries(
      HPR_CARBON_STEEL_RECIPES.map(recipe => [recipe.thicknessMm, recipe.cuttingSpeedMmPerMin])
    )),
    pierceTimes: Object.freeze(Object.fromEntries(
      HPR_CARBON_STEEL_RECIPES.map(recipe => [recipe.thicknessMm, recipe.pierceTimeSec])
    )),
    kerfDistances: Object.freeze(Object.fromEntries(
      HPR_CARBON_STEEL_RECIPES.map(recipe => [recipe.thicknessMm, recipe.kerfMm])
    ))
  })
});
