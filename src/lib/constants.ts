import bolsasTermicasImg from '../assets/categorias/bolsas-termicas.png';
import bolsasEMalasImg from '../assets/categorias/bolsas-e-malas.png';
import coposEGarrafasImg from '../assets/categorias/copos-e-garrafas.jpeg';
import churrascoImg from '../assets/categorias/churrasco-card.jpeg';

import logoCityLogo from '../assets/parceiros/logo-city.svg';
import logoFooterLogo from '../assets/parceiros/logo-footer.svg';
import sescSeeklogo from '../assets/parceiros/sesc-seeklogo.svg';
import sesiLogo1 from '../assets/parceiros/sesi-logo-1.svg';
import sicoobLogo1 from '../assets/parceiros/sicoob-logo-1-1.svg';

export const PARTNERS = [
  { name: "City Soluções Urbanas", logo: logoCityLogo },
  { name: "Trilhas da Amazônia", logo: logoFooterLogo },
  { name: "Sesc", logo: sescSeeklogo },
  { name: "Sesi", logo: sesiLogo1 },
  { name: "Sicoob", logo: sicoobLogo1 },
];

export const CATEGORIES = [
  {
    name: "Mochilas",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "Mochila Executiva",
      "Mochila Notebook",
      "Mochila Esportiva",
      "Mochila para Eventos"
    ]
  },
  {
    name: "Bolsas Térmicas",
    image: bolsasTermicasImg,
    subcategories: []
  },
  {
    name: "Bolsas e Malas",
    image: bolsasEMalasImg,
    subcategories: [
      "Bolsa Esportiva",
      "Mala de Viagem",
      "Mala de bordo"
    ]
  },
  {
    name: "Copos e Garrafas",
    image: coposEGarrafasImg,
    subcategories: [
      "Garrafas",
      "Copos",
      "Canecas",
      "Kits"
    ]
  },
  {
    name: "Agendas",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "Agendas",
      "Blocos",
      "Cadernetas",
      "Kits"
    ]
  },
  {
    name: "Churrasco",
    image: churrascoImg,
    subcategories: [
      "Facas",
      "Tábuas",
      "Canivetes",
      "Kits"
    ]
  },
  {
    name: "Canetas",
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "Canetas Plásticas",
      "Canetas de Metal",
      "Canetas Ecológicas"
    ]
  },
  {
    name: "Diversos",
    image: "https://images.unsplash.com/photo-1616400619175-5beda3a17896?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "Informática",
      "Necessáires",
      "Mais"
    ]
  }
];

export const COMPANY_INFO = {
  name: "Izu",
  whatsapp: "5562995021226",
  whatsapp_display: "(62) 99502-1226",
  email: "contato@izu.com.br", // Placeholder
  address: "Goiânia, GO", // Placeholder
  social: {
    instagram: "https://instagram.com/izu",
    facebook: "https://facebook.com/izu"
  }
};
