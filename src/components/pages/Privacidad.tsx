import { LegalPage } from './LegalPage';

interface PrivacidadProps {
  onBack: () => void;
}

export function Privacidad({ onBack }: PrivacidadProps) {
  return (
    <LegalPage title="Política de Privacidad" onBack={onBack}>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de los datos personales que facilite el usuario es e-baby.
          Puede contactar en info@ebaby-shop.com o por WhatsApp al +34 910 202 911.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">2. Datos que recogemos</h2>
        <p>Podemos recoger los siguientes datos cuando interactúe con nuestra tienda:</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Datos de identificación: nombre, apellidos, email</li>
          <li>Datos de contacto: teléfono, dirección de envío</li>
          <li>Datos de transacción: productos comprados, importes</li>
          <li>Datos técnicos: dirección IP, tipo de navegador (de forma anónima)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">3. Finalidad del tratamiento</h2>
        <p>Sus datos se tratan para:</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Gestionar pedidos y compras</li>
          <li>Atender sus consultas y solicitudes</li>
          <li>Enviar comunicaciones comerciales (si ha dado su consentimiento)</li>
          <li>Cumplir obligaciones legales</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">4. Derechos</h2>
        <p>
          Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y
          oposición contactando a info@ebaby-shop.com. También tiene derecho a reclamar ante la AEPD.
        </p>
      </section>
    </LegalPage>
  );
}
