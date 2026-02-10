import { ShoppingBag, Target, Users, ShieldCheck } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';
import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-slate-900"
          >
            Sobre a {COMPANY_INFO.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Mais do que brindes, entregamos soluções memoráveis para fortalecer a conexão entre marcas e pessoas.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold">Nossa Jornada</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A Izu iniciou suas atividades com um propósito claro: elevar o padrão dos brindes corporativos no mercado brasileiro. Entendemos que um brinde não é apenas um objeto, mas uma extensão da identidade de uma empresa.
              </p>
              <p>
                Ao longo dos anos, investimos em tecnologia de personalização e em uma curadoria rigorosa de produtos, garantindo que cada item que sai de nossa expedição carregue a excelência que nossos clientes esperam.
              </p>
              <p>
                Hoje, somos parceiros de grandes marcas, ajudando-as a serem lembradas em momentos estratégicos, desde eventos corporativos até kits de boas-vindas para colaboradores.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-100 rounded-2xl aspect-square flex items-center justify-center text-slate-300"
          >
             <ShoppingBag className="h-32 w-32" />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Target, title: "Missão", text: "Proporcionar a melhor experiência em brindes personalizados, unindo qualidade, inovação e atendimento excepcional." },
              { icon: Users, title: "Visão", text: "Ser a maior referência nacional em soluções corporativas de fidelização e branding através de produtos personalizados." },
              { icon: ShieldCheck, title: "Valores", text: "Integridade, compromisso com o cliente, qualidade impecável e pontualidade acima de tudo." }
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center space-y-4"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mx-auto h-16 w-16 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <item.icon className="h-8 w-8" />
                </motion.div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-primary-foreground/80">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners/Clients grid placeholder */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-12">Quem confia no nosso trabalho</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 opacity-50 grayscale">
          {[1,2,3,4,5].map(i => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="h-12 bg-slate-200 rounded flex items-center justify-center font-bold"
            >
              LOGO
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
