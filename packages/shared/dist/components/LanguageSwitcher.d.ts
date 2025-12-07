export interface LanguageSwitcherProps {
    /**
     * Function to get current locale
     */
    getLocale: () => string;
    /**
     * Function to set locale
     */
    setLocale: (locale: string) => void;
    /**
     * Optional custom className for the container
     */
    className?: string;
    /**
     * Optional custom className for the select element
     */
    selectClassName?: string;
}
/**
 * Reusable language switcher component
 * Can be used across all portals (Admin, Vendor, Client)
 */
export declare function LanguageSwitcher({ getLocale, setLocale, className, selectClassName, }: LanguageSwitcherProps): import("react/jsx-runtime").JSX.Element;
