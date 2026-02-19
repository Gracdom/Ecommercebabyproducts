import { LegalPage } from './LegalPage';

interface PoliticaCookiesProps {
  onBack: () => void;
}

export function PoliticaCookies({ onBack }: PoliticaCookiesProps) {
  return (
    <LegalPage title="Política de Cookies" onBack={onBack}>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo 
          (ordenador, tablet o móvil) cuando los visita. Permiten que el sitio recuerde sus acciones 
          y preferencias durante un período de tiempo.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">2. Cookies que utilizamos</h2>
        <p>En e-baby utilizamos los siguientes tipos de cookies:</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li><strong>Esenciales:</strong> Necesarias para el funcionamiento básico (carrito, sesión).</li>
          <li><strong>Preferencias:</strong> Recuerdan sus opciones (idioma, aceptación de cookies).</li>
          <li><strong>Analíticas:</strong> Nos ayudan a entender cómo usa el sitio (anónimas).</li>
          <li><strong>Funcionales:</strong> Para características como chat o widgets de terceros.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">3. Gestión de cookies</h2>
        <p>
          Puede configurar su navegador para bloquear o eliminar cookies. Tenga en cuenta que 
          deshabilitar ciertas cookies puede afectar al funcionamiento del sitio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">4. Cookies de terceros</h2>
        <p>
          Algunos servicios (como pasarelas de pago, analíticas o chat) pueden utilizar sus propias 
          cookies. Le recomendamos revisar sus políticas de privacidad.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">5. Más información</h2>
        <p>
          Para consultas sobre el uso de cookies: info@ebaby-shop.com o +34 910 202 911 (WhatsApp).
        </p>
      </section>
    </LegalPage>
  );
}
