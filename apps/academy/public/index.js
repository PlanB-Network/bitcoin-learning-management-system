import Bridge from 'pear-bridge';
import Runtime from 'pear-electron';

const bridge = new Bridge();
await bridge.ready();

const runtime = new Runtime();
const pipe = await runtime.start({ bridge });
pipe.on('close', () => Pear.exit());
