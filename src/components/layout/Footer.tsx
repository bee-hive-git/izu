import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';
import logo from '@/assets/logo-principal.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-200 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="bg-white/10 p-2 rounded-lg inline-block backdrop-blur-sm w-fit">
              <img src={logo} alt={COMPANY_INFO.name} className="h-10 w-auto invert brightness-0" />
            </div>
            <p className="text-sm text-neutral-400">
              Transformando momentos em memórias através de brindes personalizados de alta qualidade.
            </p>
            <div className="flex gap-4">
              <a href={COMPANY_INFO.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={COMPANY_INFO.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/produtos" className="hover:text-white transition-colors">Produtos</Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">A Empresa</Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Área do Cliente</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/produtos/Mochilas" className="hover:text-white transition-colors">Mochilas</Link>
              </li>
              <li>
                <Link to="/produtos/Copos%20e%20Garrafas" className="hover:text-white transition-colors">Copos e Garrafas</Link>
              </li>
              <li>
                <Link to="/produtos/Canetas" className="hover:text-white transition-colors">Canetas</Link>
              </li>
              <li>
                <Link to="/produtos/Churrasco" className="hover:text-white transition-colors">Kit Churrasco</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-neutral-400 mt-0.5" />
                <span>{COMPANY_INFO.whatsapp_display}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-neutral-400 mt-0.5" />
                <span>{COMPANY_INFO.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
                <span>{COMPANY_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-sm text-neutral-500">
          <p>&copy; {currentYear} {COMPANY_INFO.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
