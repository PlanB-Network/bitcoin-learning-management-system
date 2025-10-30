import type { TypeNode } from 'typescript';
import {
  createPrinter,
  createSourceFile,
  EmitHint,
  ScriptKind,
  ScriptTarget,
} from 'typescript';

// biome-ignore lint/complexity/noStaticOnlyClass: good
export class TsTypePrinter {
  static print(tsType: TypeNode): string {
    const sourceFile = createSourceFile(
      'print.ts',
      '',
      ScriptTarget.Latest,
      false,
      ScriptKind.TS,
    );
    const printer = createPrinter();
    return printer.printNode(EmitHint.Unspecified, tsType, sourceFile);
  }
}
