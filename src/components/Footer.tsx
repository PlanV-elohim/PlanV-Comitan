export default function Footer() {
    return (
        <footer id="contacto" className="bg-dark text-white py-16 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                <div className="md:col-span-2">
                    <div className="font-bold text-3xl tracking-tight mb-6">
                        PLAN <span className="text-primary">V</span>
                    </div>
                    <p className="text-gray-400 max-w-sm">
                        Elohim. Transformando vidas a través de experiencias espirituales y campamentos que marcan un antes y un después.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-lg">Enlaces</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
                        <li><a href="#campamentos" className="hover:text-white transition-colors">Campamentos</a></li>
                        <li><a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-lg">Contacto</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li>info@planvelohim.org</li>
                        <li>+52 963 000 0000</li>
                        <li>Comitán de Domínguez, Chiapas</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Plan V Elohim. Todos los derechos reservados.
            </div>
        </footer>
    );
}
