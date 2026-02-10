import { useEffect } from 'react';

/**
 * Componente para integración avanzada con Zoho SalesIQ
 * Este componente proporciona métodos helper para interactuar con el widget
 */

// Tipos para el objeto global de Zoho
declare global {
  interface Window {
    $zoho?: {
      salesiq?: {
        ready: () => void;
        floatwindow: {
          visible: (action: 'show' | 'hide') => void;
          open: () => void;
          close: () => void;
        };
        chat: {
          start: () => void;
          greetings: (config: { name: string; text: string; delay: number }) => void;
        };
        visitor: {
          name: (name: string) => void;
          email: (email: string) => void;
          contactnumber: (phone: string) => void;
          customaction: (actionName: string, data: Record<string, any>) => void;
        };
      };
    };
  }
}

export interface ZohoSalesIQProps {
  /**
   * Mostrar mensaje de bienvenida automático
   */
  showWelcomeMessage?: boolean;
  /**
   * Delay en milisegundos antes de mostrar el mensaje
   */
  welcomeDelay?: number;
  /**
   * Texto del mensaje de bienvenida
   */
  welcomeText?: string;
  /**
   * Información del visitante (si está autenticado)
   */
  visitorInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function ZohoSalesIQ({
  showWelcomeMessage = true,
  welcomeDelay = 5000,
  welcomeText = '¡Hola! 👶 ¿En qué puedo ayudarte con productos para tu bebé?',
  visitorInfo,
}: ZohoSalesIQProps = {}) {
  
  useEffect(() => {
    // Esperar a que el script de Zoho se cargue
    const initZoho = () => {
      if (window.$zoho?.salesiq) {
        // Configurar mensaje de bienvenida
        if (showWelcomeMessage) {
          window.$zoho.salesiq.chat.greetings({
            name: 'Bienvenida e-baby',
            text: welcomeText,
            delay: welcomeDelay,
          });
        }

        // Configurar información del visitante si está disponible
        if (visitorInfo) {
          if (visitorInfo.name) {
            window.$zoho.salesiq.visitor.name(visitorInfo.name);
          }
          if (visitorInfo.email) {
            window.$zoho.salesiq.visitor.email(visitorInfo.email);
          }
          if (visitorInfo.phone) {
            window.$zoho.salesiq.visitor.contactnumber(visitorInfo.phone);
          }
        }
      }
    };

    // Intentar inicializar inmediatamente
    initZoho();

    // Si no está listo, esperar a que se cargue el script
    const checkInterval = setInterval(() => {
      if (window.$zoho?.salesiq) {
        initZoho();
        clearInterval(checkInterval);
      }
    }, 500);

    // Limpiar intervalo después de 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [showWelcomeMessage, welcomeDelay, welcomeText, visitorInfo]);

  // Este componente no renderiza nada visualmente
  return null;
}

/**
 * Helper functions para interactuar con Zoho SalesIQ desde cualquier parte de la app
 */

/**
 * Abrir el widget de chat
 */
export const openZohoChat = () => {
  if (window.$zoho?.salesiq?.floatwindow) {
    window.$zoho.salesiq.floatwindow.visible('show');
    window.$zoho.salesiq.floatwindow.open();
  }
};

/**
 * Cerrar el widget de chat
 */
export const closeZohoChat = () => {
  if (window.$zoho?.salesiq?.floatwindow) {
    window.$zoho.salesiq.floatwindow.close();
  }
};

/**
 * Mostrar el widget
 */
export const showZohoWidget = () => {
  if (window.$zoho?.salesiq?.floatwindow) {
    window.$zoho.salesiq.floatwindow.visible('show');
  }
};

/**
 * Ocultar el widget
 */
export const hideZohoWidget = () => {
  if (window.$zoho?.salesiq?.floatwindow) {
    window.$zoho.salesiq.floatwindow.visible('hide');
  }
};

/**
 * Rastrear evento personalizado
 */
export const trackZohoEvent = (eventName: string, data?: Record<string, any>) => {
  if (window.$zoho?.salesiq?.visitor) {
    window.$zoho.salesiq.visitor.customaction(eventName, data || {});
  }
};

/**
 * Actualizar información del visitante
 */
export const updateZohoVisitor = (info: {
  name?: string;
  email?: string;
  phone?: string;
}) => {
  if (window.$zoho?.salesiq?.visitor) {
    if (info.name) {
      window.$zoho.salesiq.visitor.name(info.name);
    }
    if (info.email) {
      window.$zoho.salesiq.visitor.email(info.email);
    }
    if (info.phone) {
      window.$zoho.salesiq.visitor.contactnumber(info.phone);
    }
  }
};

/**
 * Hook personalizado para usar Zoho SalesIQ
 */
export const useZohoSalesIQ = () => {
  return {
    openChat: openZohoChat,
    closeChat: closeZohoChat,
    showWidget: showZohoWidget,
    hideWidget: hideZohoWidget,
    trackEvent: trackZohoEvent,
    updateVisitor: updateZohoVisitor,
  };
};
