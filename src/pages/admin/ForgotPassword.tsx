import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo-principal.png';
import { COMPANY_INFO } from '@/lib/constants';

export function ForgotPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-center">
             <img src={logo} alt={COMPANY_INFO.name} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-center text-xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            A senha do painel é definida no servidor, na variável ADMIN_PASSWORD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-slate-600 text-center">
            Atualize essa variável no ambiente de produção e faça login novamente.
          </p>
          <div className="text-center pt-2">
            <Button variant="link" asChild className="text-sm text-slate-500 hover:text-primary">
              <Link to="/admin/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
