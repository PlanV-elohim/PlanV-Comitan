import { Link } from 'react-router-dom';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-800">
        
        {/* Icono de Éxito Animado (Simple SVG) */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/40 p-4">
            <svg className="h-16 w-16 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-primary dark:text-white mb-2">
          ¡Cuenta Activada!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Tu correo ha sido verificado con éxito. Ya eres parte de la comunidad de <strong className="font-bold text-gray-900 dark:text-white">Plan B Ministerio Heloim</strong>.
        </p>

        {/* Sección de "Próximos Pasos" */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8 text-left border border-blue-100 dark:border-blue-800/50">
          <h3 className="text-primary dark:text-blue-400 font-bold mb-3 flex items-center">
            <span className="bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2">!</span>
            ¿Qué sigue ahora?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-3">
            <li className="flex items-start">
              <span className="mr-2 font-bold opacity-70">1.</span>
              Entra a tu panel y selecciona el campamento activo.
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold opacity-70">2.</span>
              <span>Realiza tu aportación y <strong className="font-bold">toma una foto del comprobante</strong>.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold opacity-70">3.</span>
              Súbelo en la sección de "Pagos" para asegurar tu lugar.
            </li>
          </ul>
        </div>

        {/* Botón de Acción Principal */}
        <Link 
          to="/portal" 
          className="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/30 active:scale-95 text-center tracking-wide"
        >
          IR A MI PANEL
        </Link>

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          ¿Tienes dudas? Contáctanos por WhatsApp al número oficial del ministerio.
        </p>
      </div>
    </div>
  );
}
