import nodepath from 'node:path';
const createTreeNode = (name, isDirectory) => ({ name, children: [], isDirectory });
export const generateFileTree = (files, emptyDirPaths = []) => {
    const root = createTreeNode('root', true);
    for (const file of files) {
        addPathToTree(root, file, false);
    }
    // Add empty directories
    for (const dir of emptyDirPaths) {
        addPathToTree(root, dir, true);
    }
    return root;
};
const addPathToTree = (root, path, isDirectory) => {
    const parts = path.split(nodepath.sep);
    let currentNode = root;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;
        let child = currentNode.children.find((c) => c.name === part);
        if (!child) {
            child = createTreeNode(part, !isLastPart || isDirectory);
            currentNode.children.push(child);
        }
        currentNode = child;
    }
};
const sortTreeNodes = (node) => {
    node.children.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
    });
    for (const child of node.children) {
        sortTreeNodes(child);
    }
};
export const treeToString = (node, prefix = '') => {
    sortTreeNodes(node);
    let result = '';
    for (const child of node.children) {
        result += `${prefix}${child.name}${child.isDirectory ? '/' : ''}\n`;
        if (child.isDirectory) {
            result += treeToString(child, `${prefix}  `);
        }
    }
    return result;
};
export const generateTreeString = (files, emptyDirPaths = []) => {
    const tree = generateFileTree(files, emptyDirPaths);
    return treeToString(tree).trim();
};
//# sourceMappingURL=fileTreeGenerate.js.map