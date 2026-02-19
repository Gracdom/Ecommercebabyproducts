import { LegalPage } from './LegalPage';

interface TerminosCondicionesProps {
  onBack: () => void;
}

export function TerminosCondiciones({ onBack }: TerminosCondicionesProps) {
  return (
    <LegalPage title="Términos y Condiciones" onBack={onBack}>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">1. Objeto y aceptación</h2>
        <p>
          Los presentes Términos y Condiciones regulan el uso de la tienda online e-baby y la 
          realización de compras a través de la misma. Al realizar un pedido, el usuario acepta 
          íntegramente estos términos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">2. Productos y precios</h2>
        <p>
          Los productos ofertados incluyen su descripción, precio e impuestos aplicables. Los precios 
          pueden estar sujetos a modificaciones sin previo aviso. El precio aplicable será el vigente 
          en el momento de la confirmación del pedido.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">3. Proceso de compra</h2>
        <p>
          El usuario añade productos al carrito, completa sus datos de contacto y envío, elige el 
          método de pago y confirma el pedido. Una vez confirmado, recibirá un correo de confirmación.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">4. Envíos y entregas</h2>
        <p>
          Los plazos de entrega se indicarán durante el proceso de compra. El envío gratuito se aplica 
          a pedidos a partir de 200€. e-baby no se hace responsable de retrasos por causas ajenas a 
          su control.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">5. Devoluciones</h2>
        <p>
          El usuario dispone de 14 días desde la recepción para ejercer el derecho de desistimiento, 
          según la normativa de consumo. Los productos deben devolverse en perfecto estado. Para más 
          información, contacte en info@ebaby-shop.com o por WhatsApp.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">6. Contacto</h2>
        <p>
          Para cualquier duda sobre estos términos: info@ebaby-shop.com o +34 910 202 911 (WhatsApp).
        </p>
      </section>
    </LegalPage>
  );
}
