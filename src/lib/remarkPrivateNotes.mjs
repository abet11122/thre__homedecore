/** Owner-input comments stay in source control, never in the public HTML or reading time. */
import { defineMdastPlugin } from 'satteri';
export default defineMdastPlugin({
  name: 'private-owner-notes',
  html(node, context) {
    if (/^\s*<!--[\s\S]*-->\s*$/.test(node.value ?? '')) context.removeNode(node);
  },
});
