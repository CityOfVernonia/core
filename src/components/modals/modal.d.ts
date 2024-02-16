/**
 * Shared modal options.
 */
interface ModalOptions {
  /**
   * Modal content.
   */
  content: string;
  /**
   * Modal header.
   */
  header: string;
  /**
   * Modal kind.
   */
  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
}

/**
 * AlertModal options.
 */
export interface AlertModalOptions extends ModalOptions {
  /**
   * Primary button text.
   * @default Ok
   */
  primaryButtonText?: string;
}

/**
 * ConfirmModal options.
 */
export interface ConfirmModalOptions extends ModalOptions {
  /**
   * Primary button text.
   * @default Ok
   */
  primaryButtonText?: string;
  /**
   * Secondary button text.
   * @default Cancel
   */
  secondaryButtonText?: string;
}
