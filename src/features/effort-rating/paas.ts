import raw from '../../../content/instruments/paas.json';
import { PaasSchema } from '../../data/schemas';

export const paas = PaasSchema.parse(raw);
export const PAAS_VERSION = paas.version;
