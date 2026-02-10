import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES, PARTNERS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const faqs = [
    {
      question: "Como solicitar um orçamento?",
      answer: "Para solicitar um orçamento, basta navegar pelo nosso catálogo, escolher o produto desejado e clicar no botão 'Solicitar Orçamento via WhatsApp'. Você será redirecionado para o nosso atendimento com as informações do produto já preenchidas."
    },
    {
      question: "Qual o prazo de entrega?",
      answer: "O prazo de entrega varia de acordo com o produto e a quantidade solicitada. Geralmente, após a aprovação da arte, o prazo médio é de 10 a 15 dias úteis."
    },
    {
      question: "Vocês fazem personalização com a minha logomarca?",
      answer: "Sim! Todos os nossos produtos podem ser personalizados com a logomarca da sua empresa. Utilizamos diversas técnicas como silk, laser, transfer e bordado."
    },
    {
      question: "Existe quantidade mínima para pedido?",
      answer: "Sim, a maioria dos nossos produtos possui uma quantidade mínima que varia entre 20 e 50 unidades, dependendo do item escolhido."
    },
    {
      question: "Quais são as formas de pagamento?",
      answer: "Trabalhamos com faturamento para empresas (mediante análise), boleto bancário, PIX e cartões de crédito."
    }
  ];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <HeroCarousel>
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center py-24">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Brindes que marcam sua história
            </h1>
            <p className="text-lg text-neutral-300">
              Na Izu, transformamos produtos em experiências. Encontre o brinde perfeito para sua empresa com qualidade e personalização exclusiva.
            </p>
            <div className="flex gap-4 pt-4">
              <Button size="lg" asChild className="text-base">
                <Link to="/produtos">
                  Ver Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent text-white border-white hover:bg-white hover:text-neutral-950">
                <Link to="/sobre">
                  Conheça a Izu
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Abstract Background for first slide */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
      </HeroCarousel>

      {/* Categories Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Nossas Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Link to={`/produtos/${encodeURIComponent(cat.name)}`}>
                <Card className="group h-full hover:shadow-lg transition-all cursor-pointer border-none overflow-hidden relative">
                  <CardContent className="flex flex-col items-center justify-end p-6 h-48 md:h-64 text-center space-y-2 relative z-10">
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-neutral-900/40 group-hover:bg-neutral-900/50 transition-colors z-0" />
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover -z-10 transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    <span className="font-bold text-white text-xl drop-shadow-md z-10">{cat.name}</span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features / Why Us */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary"
              >
                <Truck className="h-8 w-8" />
              </motion.div>
              <h3 className="text-xl font-bold">Entrega Rápida</h3>
              <p className="text-muted-foreground">Compromisso com prazos para que seu evento seja um sucesso.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary"
              >
                <ShieldCheck className="h-8 w-8" />
              </motion.div>
              <h3 className="text-xl font-bold">Qualidade Garantida</h3>
              <p className="text-muted-foreground">Produtos selecionados e personalização de alta durabilidade.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center text-primary"
              >
                <Zap className="h-8 w-8" />
              </motion.div>
              <h3 className="text-xl font-bold">Atendimento Ágil</h3>
              <p className="text-muted-foreground">Orçamentos rápidos via WhatsApp para facilitar sua decisão.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="w-full bg-neutral-950 py-32 overflow-hidden">
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-lg md:text-4xl font-bold text-center text-white px-4">Nossos Parceiros e Clientes</h2>
        </div>
        
        {/* Infinite marquee effect */}
        <div className="relative flex w-full overflow-hidden mask-gradient-x">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />
          
          {/* Mobile Marquee */}
          <div className="flex md:hidden w-full">
            {[0, 1].map((i) => (
              <motion.div 
                key={i}
                className="flex shrink-0 gap-16 items-center pr-16 min-w-full justify-around"
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ 
                  repeat: Infinity, 
                  ease: "linear", 
                  duration: 48
                }}
              >
                {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                  <div key={`mobile-${i}-${partner.name}-${index}`} className="flex-shrink-0">
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="h-20 w-auto object-contain max-w-[150px] grayscale opacity-100 invert"
                    />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Desktop Marquee */}
          <div className="hidden md:flex w-full">
            {[0, 1].map((i) => (
              <motion.div 
                key={i}
                className="flex shrink-0 gap-24 items-center pr-24 min-w-full justify-around"
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ 
                  repeat: Infinity, 
                  ease: "linear", 
                  duration: 44
                }}
              >
                {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                  <div key={`desktop-${i}-${partner.name}-${index}`} className="flex-shrink-0">
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="h-32 w-auto object-contain max-w-[200px] grayscale opacity-100 invert transition-all duration-300 hover:scale-110 hover:grayscale-0 hover:invert-0"
                    />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8 relative z-10"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                A Izu nasceu da paixão por <span className="text-primary">conectar marcas e pessoas.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Acreditamos que um brinde não é apenas um objeto, mas uma ferramenta poderosa de marketing e relacionamento. Nossa missão é ajudar sua empresa a criar conexões duradouras através de produtos personalizados de alta qualidade.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" className="px-8 h-14 text-lg shadow-lg shadow-primary/20" asChild>
                  <Link to="/sobre">
                    Conheça Nossa História
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/10 rounded-2xl transform rotate-3 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80" 
                alt="Equipe Izu" 
                className="rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-16"
          >
            O que nossos clientes dizem
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Excelente atendimento e produtos de altíssima qualidade. As mochilas ficaram incríveis!",
                author: "Carlos Silva",
                role: "Gerente de Marketing"
              },
              {
                text: "Os kits de boas-vindas foram um sucesso total na empresa. Recomendo muito a Izu.",
                author: "Ana Souza",
                role: "RH"
              },
              {
                text: "Pontualidade na entrega e gravação perfeita. Parceiros de longa data.",
                author: "Marcos Oliveira",
                role: "Diretor Comercial"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <Card className="bg-white/10 border-none text-white backdrop-blur-sm hover:bg-white/15 transition-colors duration-300 h-full">
                  <CardContent className="pt-8 px-8 pb-8 flex flex-col h-full justify-between">
                    <div className="mb-6">
                      <div className="flex text-yellow-400 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="text-lg italic leading-relaxed text-slate-200">"{testimonial.text}"</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{testimonial.author}</p>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-slate-50 py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900">Perguntas Frequentes</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Tire suas dúvidas sobre nossos processos, prazos e personalização de forma rápida e clara.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-100 last:border-0 px-2">
                  <AccordionTrigger className="text-left font-bold text-lg py-6 hover:no-underline hover:text-primary transition-colors data-[state=open]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6 pl-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="container mx-auto px-4 text-center py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl font-bold text-primary">Brindes Personalizados para Empresas é na Izu!</h2>
          <p className="text-lg text-muted-foreground">
            Solicite um orçamento sem compromisso e descubra como podemos ajudar a alavancar sua marca.
          </p>
          <Button size="lg" className="px-8 text-lg" asChild>
             <Link to="/produtos">Ver Catálogo Completo</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
