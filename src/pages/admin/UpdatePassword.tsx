import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo-principal.png';
import { COMPANY_INFO } from '@/lib/constants';

export function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    // If not authenticated (meaning the link didn't work or expired), redirect to login
    if (!authLoading && !session) {
      // We allow a small grace period or check if there's a hash in the URL that Supabase hasn't processed yet
      // But typically useAuth should pick it up.
      // For now, we'll let it stay, but show a message if session is missing.
    }
  }, [session, authLoading]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Senha atualizada com sucesso! Redirecionando...'
      });

      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao atualizar senha.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
           <CardHeader className="space-y-4 pb-2">
             <div className="flex justify-center">
                <img src={logo} alt={COMPANY_INFO.name} className="h-12 w-auto" />
             </div>
             <CardTitle className="text-center text-xl font-bold">Link Inválido</CardTitle>
           </CardHeader>
           <CardContent className="text-center">
             <p className="text-red-500 mb-6">O link de redefinição expirou ou é inválido.</p>
             <Button onClick={() => navigate('/admin/login')} className="w-full">Voltar para Login</Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-center">
             <img src={logo} alt={COMPANY_INFO.name} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-center text-xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription className="text-center">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Nova Senha</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirmar Senha</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white"
                placeholder="••••••••"
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
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Nova Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
