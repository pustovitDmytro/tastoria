import type { EntityStorageUI } from '../types';
import firebaseDriver from './firebaseDriver';
import supabaseDriver from './supabaseDriver';
import config from '~/config';

const driver: EntityStorageUI = config.storage.driver === 'supabase' ? supabaseDriver : firebaseDriver;

export default driver;
