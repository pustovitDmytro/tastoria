import type { FilesStorageUI } from '../types';
import firebaseDriver from './firebaseDriver';
import supabaseDriver from './supabaseDriver';
import config from '~/config';

const driver: FilesStorageUI = config.storage.files === 'supabase' ? supabaseDriver : firebaseDriver;

export default driver;
