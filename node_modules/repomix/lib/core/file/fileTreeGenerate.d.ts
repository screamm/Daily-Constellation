interface TreeNode {
    name: string;
    children: TreeNode[];
    isDirectory: boolean;
}
export declare const generateFileTree: (files: string[], emptyDirPaths?: string[]) => TreeNode;
export declare const treeToString: (node: TreeNode, prefix?: string) => string;
export declare const generateTreeString: (files: string[], emptyDirPaths?: string[]) => string;
export {};
//# sourceMappingURL=fileTreeGenerate.d.ts.map