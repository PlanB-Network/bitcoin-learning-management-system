import fs from 'node:fs';
import { join } from 'node:path';

const dir = import.meta.dirname;

export const fontsBytes = {
  mono: fs.readFileSync(join(dir, './fonts/mono/JetBrainsMono.ttf')),
  ibmPlexLight: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Light.ttf'),
  ),
  ibmPlexRegular: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Regular.ttf'),
  ),
  ibmPlexMedium: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Medium.ttf'),
  ),
  ibmPlexSemiBold: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-SemiBold.ttf'),
  ),
  ibmPlexBold: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Bold.ttf'),
  ),
  styleScript: fs.readFileSync(join(dir, './fonts/StyleScript.otf')),
};
