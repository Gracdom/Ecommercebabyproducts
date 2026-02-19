import { LegalPage } from './LegalPage';

interface AvisoLegalProps {
  onBack: () => void;
}

export function AvisoLegal({ onBack }: AvisoLegalProps) {
  return (
    <LegalPage title="Aviso Legal" onBack={onBack}>
      <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">1. Datos identificativos</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad 
          de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li><strong>Denominación social:</strong> e-baby</li>
          <li><strong>Email:</strong> info@ebaby-shop.com</li>
          <li><strong>Teléfono/WhatsApp:</strong> +34 910 202 911</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">2. Objeto</h2>
        <p>
          El presente aviso legal regula el uso y utilización del sitio web e-baby, del que es titular 
          la entidad anteriormente identificada. La navegación por el sitio web atribuye la condición de 
          usuario e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones 
          incluidas en este Aviso Legal.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">3. Condiciones de uso</h2>
        <p>
          El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que se ofrecen 
          a través de este sitio web y a no emplearlos para realizar actividades ilícitas o contrarias 
          a la buena fe y al orden público.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">4. Propiedad intelectual</h2>
        <p>
          e-baby por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e 
          industrial de su página web, así como de los elementos contenidos en la misma. Todos los 
          derechos quedan reservados.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900 mt-8 mb-3">5. Contacto</h2>
        <p>
          Para cualquier consulta relacionada con el presente aviso legal, puede contactar a través de 
          info@ebaby-shop.com o por WhatsApp al +34 910 202 911.
        </p>
      </section>
    </LegalPage>
  );
}
