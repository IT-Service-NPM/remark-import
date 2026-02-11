// https://github.com/unifiedjs/unified-engine#config-files

import remarkGfm from 'remark-gfm';
import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';
import remarkLicense from 'remark-license';
import remarkTypography from 'remark-typography';
import remarkValidateLinks from 'remark-validate-links';
import remarkLintCodeBlockStyle from 'remark-lint-code-block-style';
import codeImport from 'remark-code-import';
import remarkDirective from 'remark-directive';
import remarkInclude from '#@it-service/remark-include';
import remarkToc from 'remark-toc';

export default {
  plugins: [
    codeImport,
    remarkDirective,
    remarkInclude,
    remarkToc,
    remarkLicense,
    remarkGfm,
    remarkValidateLinks,
    remarkTypography,
    remarkPresetLintConsistent,
    remarkPresetLintRecommended,
    remarkLintCodeBlockStyle,
  ],
  settings: {
    bullet: '*'
  }
}
