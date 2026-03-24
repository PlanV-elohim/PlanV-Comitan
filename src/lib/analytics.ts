/**
 * Analytics wrapper for Google Analytics 4.
 * Set VITE_GA_MEASUREMENT_ID in your .env file.
 * Example: VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 
 * All events are no-ops when the measurement ID is not set,
 * so this won't interfere with local development.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

// Bootstrap GA4 script dynamically
if (GA_ID && typeof window !== 'undefined' && !window.gtag) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer!.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: true });
}

type EventName =
    | 'register_started'
    | 'register_completed'
    | 'modal_opened'
    | 'whatsapp_clicked'
    | 'pwa_installed'
    | 'gallery_opened'
    | 'testimonial_viewed';

interface EventParams {
    label?: string;
    value?: number;
    [key: string]: string | number | boolean | undefined;
}

export function trackEvent(name: EventName, params?: EventParams) {
    if (!GA_ID || !window.gtag) return;
    window.gtag('event', name, {
        event_category: 'engagement',
        ...params,
    });
}

export function trackPageView(path: string, title?: string) {
    if (!GA_ID || !window.gtag) return;
    window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
    });
}
