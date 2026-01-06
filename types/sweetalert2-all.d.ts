// types/sweetalert2-all.d.ts
declare module 'SuiteScripts/HUL_DEV/Third_Party_Applications/sweetalert2.all' {
    // Export the value as a CommonJS-style assignment
    const Swal: Swal.Static;
    export = Swal;
}

/**
 * Merged namespace carries all the types used by the exported value.
 * You can reference them as Swal.Options, Swal.Result, Swal.SweetAlertIcon, etc.
 */
declare namespace Swal {
    type SweetAlertIcon = 'warning' | 'error' | 'success' | 'info' | 'question';

    type SweetAlertInput =
        | 'text' | 'email' | 'number' | 'password' | 'tel' | 'url'
        | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | null;

    interface ShowHideClass {
        popup?: string;
        backdrop?: string;
        icon?: string;
    }

    interface CustomClass {
        container?: string;
        popup?: string;
        header?: string;
        title?: string;
        closeButton?: string;
        icon?: string;
        image?: string;
        htmlContainer?: string;
        input?: string;
        inputLabel?: string;
        validationMessage?: string;
        actions?: string;
        confirmButton?: string;
        denyButton?: string;
        cancelButton?: string;
        loader?: string;
        footer?: string;
        timerProgressBar?: string;
    }

    interface Options {
        // Core content
        title?: string;
        titleText?: string;
        text?: string;
        html?: string;
        footer?: string;

        // Icon / toast
        icon?: SweetAlertIcon;
        iconColor?: string;
        iconHtml?: string;
        toast?: boolean;

        // Position & sizing
        position?:
            | 'top' | 'top-start' | 'top-end'
            | 'center' | 'center-start' | 'center-end'
            | 'bottom' | 'bottom-start' | 'bottom-end';
        grow?: 'row' | 'column' | 'fullscreen' | false;
        width?: number | string;
        padding?: number | string;
        background?: string;
        color?: string;
        heightAuto?: boolean;

        // Buttons
        showConfirmButton?: boolean;
        showCancelButton?: boolean;
        showDenyButton?: boolean;
        confirmButtonText?: string;
        denyButtonText?: string;
        cancelButtonText?: string;
        confirmButtonColor?: string;
        denyButtonColor?: string;
        cancelButtonColor?: string;
        confirmButtonAriaLabel?: string;
        denyButtonAriaLabel?: string;
        cancelButtonAriaLabel?: string;
        buttonsStyling?: boolean;
        reverseButtons?: boolean;
        focusConfirm?: boolean;
        focusDeny?: boolean;
        focusCancel?: boolean;

        // Timer
        timer?: number;
        timerProgressBar?: boolean;

        // Backdrop & behavior
        backdrop?: boolean | string;
        allowOutsideClick?: boolean | (() => boolean);
        allowEscapeKey?: boolean | (() => boolean);
        allowEnterKey?: boolean | (() => boolean);
        returnFocus?: boolean;
        stopKeydownPropagation?: boolean;
        keydownListenerCapture?: boolean;
        scrollbarPadding?: boolean;
        zIndex?: number;
        target?: HTMLElement | string;

        // Input
        input?: SweetAlertInput;
        inputLabel?: string;
        inputPlaceholder?: string;
        inputValue?: any;
        inputOptions?: Record<string, string> | Promise<Record<string, string>>;
        inputAttributes?: Record<string, string>;
        inputAutoTrim?: boolean;
        inputValidator?: (value: any) => string | null | Promise<string | null>;
        validationMessage?: string;

        // Loader / async
        showLoaderOnConfirm?: boolean;
        preConfirm?: (value: any) => any | Promise<any>;
        loaderHtml?: string;

        // Images
        imageUrl?: string;
        imageWidth?: number;
        imageHeight?: number;
        imageAlt?: string;

        // CSS classes & animations
        customClass?: CustomClass;
        showClass?: ShowHideClass;
        hideClass?: ShowHideClass;

        // Progress steps (wizard)
        progressSteps?: string[];
        currentProgressStep?: number;
        progressStepsDistance?: string;

        // Lifecycle
        willOpen?: (popup: HTMLElement) => any;
        didOpen?: (popup: HTMLElement) => any;
        willClose?: (popup: HTMLElement) => any;
        didClose?: () => any;
        didDestroy?: () => any;

        // Future-proofing
        [key: string]: any;
    }

    interface Result<T = any> {
        isConfirmed: boolean;
        isDenied: boolean;
        isDismissed: boolean;
        value?: T;
        dismiss?: any;
    }

    interface Static {
        fire<T = any>(options?: Options): Promise<Result<T>>;
        fire<T = any>(title: string, html?: string, icon?: SweetAlertIcon): Promise<Result<T>>;
        mixin(options: Options): Static;
        update(options: Partial<Options>): void;
        close(result?: any): void;
        isVisible(): boolean;
        getHtmlContainer(): HTMLElement | null;
        getPopup(): HTMLElement | null;
        getTitle(): HTMLElement | null;
        getConfirmButton(): HTMLElement | null;
        getDenyButton(): HTMLElement | null;
        getCancelButton(): HTMLElement | null;
        showLoading(): void;
        hideLoading(): void;
    }
}
