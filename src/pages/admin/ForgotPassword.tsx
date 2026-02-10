import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import logo from '@/assets/logo-principal.png';
import { COMPANY_INFO } from '@/lib/constants';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/redefinir-senha`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao enviar email de recuperação.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-center">
             <img src={logo} alt={COMPANY_INFO.name} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-center text-xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu email para receber o link de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Link'}
            </Button>

            <div className="text-center pt-2">
              <Button variant="link" asChild className="text-sm text-slate-500 hover:text-primary">
                <Link to="/admin/login">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
