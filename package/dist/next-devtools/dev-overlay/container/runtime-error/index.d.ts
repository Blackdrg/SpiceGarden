import { type ReadyRuntimeError } from '../../utils/get-error-by-type';
type RuntimeErrorProps = {
    error: ReadyRuntimeError;
    dialogResizerRef: React.RefObject<HTMLDivElement | null>;
};
export declare function RuntimeError({ error, dialogResizerRef }: RuntimeErrorProps): import("react/jsx-runtime").JSX.Element;
export declare const styles = "\n  \n  [data-nextjs-container-errors-pseudo-html] {\n    padding: 8px 0;\n    margin: 8px 0;\n    border: 1px solid var(--color-gray-400);\n    background: var