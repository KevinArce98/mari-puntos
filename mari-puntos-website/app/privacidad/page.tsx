import { Metadata } from 'next';

import LegalLayout from '../components/legal-layout';

export const metadata: Metadata = {
  title: 'Política de Privacidad - MariPuntos',
  description:
    'Política de privacidad de MariPuntos - Cómo recopilamos, usamos y protegemos tu información personal.',
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Política de Privacidad de MariPuntos"
      lastUpdated="28 de abril de 2026"
    >
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
        <p className="text-gray-700 leading-relaxed">
          Bienvenido a MariPuntos. Esta Política de Privacidad describe cómo recopilamos,
          usamos y protegemos tu información personal cuando utilizas nuestra aplicación
          móvil.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          2. Información que Recopilamos
        </h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
          2.1 Información de Cuenta
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Nombre</li>
          <li>Correo electrónico</li>
          <li>Información de perfil</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
          2.2 Datos de Uso
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Acciones completadas</li>
          <li>Permisos solicitados y aprobados</li>
          <li>Puntos ganados y nivel actual</li>
          <li>Logros desbloqueados</li>
          <li>Rachas semanales</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
          2.3 Información Técnica
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Tipo de dispositivo</li>
          <li>Sistema operativo</li>
          <li>Identificadores únicos del dispositivo</li>
          <li>Datos de uso de la aplicación</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          3. Cómo Usamos tu Información
        </h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Utilizamos la información recopilada para:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Proporcionar y mantener nuestro servicio</li>
          <li>Gestionar tu cuenta y relación con tu pareja</li>
          <li>Calcular puntos y niveles</li>
          <li>Mejorar la experiencia del usuario</li>
          <li>Comunicarnos contigo sobre actualizaciones</li>
          <li>Garantizar la seguridad de la aplicación</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          4. Compartir Información
        </h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          MariPuntos comparte información únicamente:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Con tu pareja vinculada dentro de la aplicación</li>
          <li>Cuando sea requerido por ley</li>
          <li>
            Con proveedores de servicios de confianza (autenticación, almacenamiento)
          </li>
        </ul>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
          <p className="text-gray-800 font-semibold">
            NO vendemos ni compartimos tu información con terceros para fines
            publicitarios.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seguridad de Datos</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Implementamos medidas de seguridad técnicas y organizativas para proteger tus
          datos:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Cifrado de datos en tránsito (HTTPS/TLS)</li>
          <li>Autenticación segura mediante Clerk</li>
          <li>Almacenamiento seguro de credenciales</li>
          <li>Acceso restringido a datos personales</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Tus Derechos</h2>
        <p className="text-gray-700 leading-relaxed mb-3">Tienes derecho a:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Acceder a tus datos personales</li>
          <li>Corregir información inexacta</li>
          <li>Eliminar tu cuenta y datos</li>
          <li>Exportar tus datos</li>
          <li>Revocar consentimientos</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Retención de Datos</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Conservamos tu información personal mientras:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Tu cuenta esté activa</li>
          <li>Sea necesario para proporcionar servicios</li>
          <li>Sea requerido por obligaciones legales</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          8. Servicios de Terceros
        </h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          MariPuntos utiliza los siguientes servicios de terceros:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Clerk</strong>: Autenticación de usuarios
          </li>
          <li>
            <strong>Backend propio</strong>: Almacenamiento de datos de la aplicación
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
        <p className="text-gray-700 leading-relaxed">
          MariPuntos está diseñado para usuarios mayores de 18 años. No recopilamos
          intencionalmente información de menores de edad.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          10. Cambios a esta Política
        </h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos
          sobre cambios significativos mediante:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Notificación en la aplicación</li>
          <li>Correo electrónico</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contacto</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Si tienes preguntas sobre esta Política de Privacidad, contáctanos en:
        </p>
        <ul className="list-none text-gray-700 space-y-2">
          <li>
            <strong>Email:</strong> arias9068@gmail.com
          </li>
          <li>
            <strong>Sitio web:</strong> https://maripuntos.com/contacto
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Jurisdicción</h2>
        <p className="text-gray-700 leading-relaxed">
          Esta aplicación está diseñada principalmente para usuarios en Costa Rica y
          cumple con las leyes de protección de datos aplicables.
        </p>
      </section>

      <div className="border-t border-gray-300 pt-8 mt-12">
        <p className="text-gray-600">
          <strong>MariPuntos</strong>
          <br />
          Costa Rica
          <br />
          arias9068@gmail.com
        </p>
      </div>
    </LegalLayout>
  );
}
