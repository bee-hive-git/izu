import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CATEGORIES, COMPANY_INFO } from '@/lib/constants';
import logo from '@/assets/logo-principal.png';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt={COMPANY_INFO.name} className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Link to="/" className={navigationMenuTriggerStyle()}>
                  Início
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[600px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[700px]">
                    {CATEGORIES.map((category) => (
                      <li key={category.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={`/produtos/${encodeURIComponent(category.name)}`}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              {category.name}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                              Ver todos os produtos desta categoria
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                    <li className="col-span-2 mt-2 pt-2 border-t border-slate-100">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/produtos"
                          className="flex items-center justify-center w-full select-none rounded-md bg-primary/10 p-3 text-sm font-medium text-primary no-underline outline-none transition-colors hover:bg-primary/20"
                        >
                          Ver Catálogo Completo
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/sobre" className={navigationMenuTriggerStyle()}>
                  A Empresa
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/#faq" className={navigationMenuTriggerStyle()}>
                  FAQ
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Button asChild className="bg-green-600 hover:bg-green-700 text-white shadow-md font-semibold px-6">
            <a 
              href={`https://wa.me/${COMPANY_INFO.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Fale Conosco
            </a>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
            <div className="flex flex-col gap-6 py-6">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <img src={logo} alt={COMPANY_INFO.name} className="h-8 w-auto" />
              </Link>
              
              <div className="flex flex-col space-y-1">
                <Link 
                  to="/" 
                  className="px-4 py-3 text-lg font-medium hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Início
                </Link>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="produtos" className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-lg font-medium hover:bg-slate-50 rounded-md hover:no-underline">
                      Produtos
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="flex flex-col space-y-1 pl-4 border-l-2 border-slate-100 ml-4">
                        <Link 
                          to="/produtos" 
                          className="px-4 py-2 text-base font-medium text-primary hover:bg-primary/5 rounded-md transition-colors text-left"
                          onClick={() => setIsOpen(false)}
                        >
                          Ver Todos
                        </Link>
                        {CATEGORIES.map((category) => (
                          <Link
                            key={category.name}
                            to={`/produtos/${encodeURIComponent(category.name)}`}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors text-left flex items-center justify-between group"
                            onClick={() => setIsOpen(false)}
                          >
                            {category.name}
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Link 
                  to="/sobre" 
                  className="px-4 py-3 text-lg font-medium hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  A Empresa
                </Link>
                
                <Link 
                  to="/#faq" 
                  className="px-4 py-3 text-lg font-medium hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  FAQ
                </Link>
              </div>

              <div className="pt-6 mt-auto border-t border-slate-100">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm h-12 text-lg">
                  <a 
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Fale Conosco
                  </a>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
