/**
 * With this Remark plugin, you can use `::include{file=path.md}`
 * directive to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * @packageDocumentation
 */

import * as path from 'node:path';
import * as url from 'node:url';
import RelateUrl from 'relateurl';
import isRelativeUrl from 'is-relative-url';
import convertPath from '@stdlib/utils-convert-path';
import { accessSync } from 'node:fs';
import { asDefined, assertDefined, isDefined } from 'ts-runtime-typecheck';
import markdownExtensions from 'markdown-extensions';
import type { Transformer, Plugin, Processor } from 'unified';
import type { Node, Root, Parent, Heading, Resource, Code } from 'mdast';
import type { LeafDirective } from 'mdast-util-directive';
import type { VFile } from 'vfile';
import { readSync } from 'to-vfile';
import { visit } from 'unist-util-visit';
import { convert, is } from 'unist-util-is';

/* eslint-disable max-statements */

/**
 * Plugin fabric function.
 *
 * With this Remark plugin, you can use `::include{file=path.md}`
 * directive to compose markdown files together.
 *
 * This plugin is a modern fork of
 * {@link https://github.com/BrekiTomasson/remark-import| remark-import}
 * and {@link https://github.com/Qard/remark-include| remark-include},
 * compatible with Remark v15.
 *
 * @public
 */
export const remarkInclude: Plugin<[], Root> = function (): Transformer<Root> {

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const unified: Processor = this;

  function getFilePath(node: LeafDirective, file: VFile): string | undefined {
    let attrFile: string;
    try {
      assertDefined(node.attributes);
      attrFile = asDefined(node.attributes.file);
    } catch {
      file.fail(
        '::include, `file` attribute expected',
        node,
        '@it-service-npm/remark-include'
      );
    };
    if (!isDefined(file.dirname)) {
      file.fail(
        '::include, unexpected error: "file" should be an instance of VFile',
        node,
        '@it-service-npm/remark-include'
      );
    };

    let includedFilePath: string = path.resolve(
      file.dirname,
      attrFile
    );
    const paths: string[] = [includedFilePath].concat(
      markdownExtensions.map((ext: string) => includedFilePath + '.' + ext)
    );
    if (paths.some(
      function (filePath: string): boolean {
        try {
          accessSync(filePath);
          includedFilePath = filePath;
          return true;
        } catch {
          return false;
        };
      }
    )) {
      return includedFilePath;
    } else {
      if (isDefined(asDefined(node.attributes).optional)) {
        file.info(
          `::include, file not found - "${includedFilePath}"`,
          node,
          '@it-service-npm/remark-include'
        );
      } else {
        file.fail(
          `::include, file not found - "${includedFilePath}"`,
          node,
          '@it-service-npm/remark-include'
        );
      };
      return;
    };
  };

  return function (tree: Root, file: VFile): Root {

    let depth = 0;

    visit(
      tree,
      convert([
        { type: 'leafDirective', name: 'include' },
        { type: 'heading' }
      ]),
      function (_node: Node, index?: number, parent?: Parent): void {
        if (is(_node, 'heading')) {
          const node: Heading = _node as Heading;
          depth = node.depth;
        } else {
          const node: LeafDirective = _node as LeafDirective;
          const _includedFilePath = getFilePath(node, file);
          if (isDefined(_includedFilePath)) {
            const includedFilePath: string = _includedFilePath;
            const includedFile: VFile = readSync(includedFilePath, 'utf-8');
            const includedAST: Root = unified.parse(includedFile) as Root;

            let depthDelta: number | undefined;
            visit(includedAST,
              ['heading', 'image', 'link', 'definition', 'code'],
              function (_node: Node): void {

                if (is(_node, 'heading')) {
                  const node: Heading = _node as Heading;
                  depthDelta ??= node.depth - depth - 1;
                  node.depth -= depthDelta;

                } else if (is(_node, ['image', 'link', 'definition'])) {
                  const node: Resource = _node as unknown as Resource;
                  if (isRelativeUrl(node.url,
                    { allowProtocolRelative: false })
                  ) {
                    node.url = RelateUrl.relate(
                      url.pathToFileURL(file.path).href,
                      new URL(
                        node.url,
                        url.pathToFileURL(includedFilePath)
                      ).href
                    );
                  };

                } else { // if (is(_node, 'code')) {
                  const node: Code = _node as Code;
                  const fileMeta: string | undefined = (node.meta ?? '')
                    // Allow escaping spaces
                    .split(/(?<!\\) /g)
                    .find((meta) => meta.startsWith('file='));
                  if (!isDefined(fileMeta)) {
                    return;
                  };
                  // eslint-disable-next-line max-len
                  const fileAttrRegExp = /^file=(?<path>.+?)(?:(?:#(?:L(?<from>\d+)(?<dash>-)?)?)(?:L(?<to>\d+))?)?$/;
                  const res = fileAttrRegExp.exec(fileMeta);
                  if (res?.groups?.path) {
                    const filePath = res.groups.path;
                    const normalizedFilePath = filePath
                      .replace(/\\ /g, ' ');
                    if (!path.isAbsolute(normalizedFilePath)) {
                      const rebasedFilePath = convertPath(
                        path.relative(
                          file.dirname!,
                          path.resolve(
                            path.dirname(includedFilePath),
                            normalizedFilePath
                          )
                        ),
                        'posix'
                      );
                      // eslint-disable-next-line max-len
                      node.meta = `file=${rebasedFilePath}${res.groups.from ? '#L' + res.groups.from : ''}${res.groups.to ? '-L' + res.groups.to : ''}`;
                    };
                  }
                };
              }
            );

            parent!.children.splice(
              index!, 1,
              ...includedAST.children
            );
          } else {
            parent!.children.splice(index!, 1,);
          };
        };
      }
    );
    return tree;
  };
};

export default remarkInclude;
