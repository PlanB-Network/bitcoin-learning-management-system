import fs from 'node:fs';
import { join } from 'node:path';

const dir = import.meta.dirname;

export const fontsBytes = {
  ibmPlexBold: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Bold.ttf'),
  ),
  ibmPlexLight: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Light.ttf'),
  ),
  ibmPlexMedium: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Medium.ttf'),
  ),
  ibmPlexRegular: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Regular.ttf'),
  ),
  ibmPlexSemiBold: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-SemiBold.ttf'),
  ),
  mono: fs.readFileSync(join(dir, './fonts/mono/JetBrainsMono.ttf')),
  notoSansBold: fs.readFileSync(join(dir, './fonts/noto/NotoSans-Bold.ttf')),
  notoSansLight: fs.readFileSync(join(dir, './fonts/noto/NotoSans-Light.ttf')),
  notoSansMedium: fs.readFileSync(
    join(dir, './fonts/noto/NotoSans-Medium.ttf'),
  ),
  notoSansRegular: fs.readFileSync(
    join(dir, './fonts/noto/NotoSans-Regular.ttf'),
  ),
  notoSansSemiBold: fs.readFileSync(
    join(dir, './fonts/noto/NotoSans-SemiBold.ttf'),
  ),
  styleScript: fs.readFileSync(join(dir, './fonts/StyleScript.otf')),
};
