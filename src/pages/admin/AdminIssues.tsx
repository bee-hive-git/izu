import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Edit, ImageOff, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { ISSUES_COUNT_EVENT, adminIssuesApi, type ProductIssue } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function describe(issue: ProductIssue) {
  if (issue.problems.includes('no_images')) return 'Produto sem nenhuma foto';
  const missing = issue.missing_images.length;
  if (issue.problems.includes('all_missing')) return `Todas as ${missing} fotos se perderam`;
  return `${missing} de ${issue.total_images} fotos perdidas`;
}

export function AdminIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<ProductIssue[]>([]);
  const [checked, setChecked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminIssuesApi.list();
      window.dispatchEvent(new CustomEvent(ISSUES_COUNT_EVENT, { detail: result.issues.length }));
      if (result.issues.length === 0) {
        navigate('/admin', { replace: true });
        return;
      }
      setIssues(result.issues);
      setChecked(result.checked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar os produtos');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const removeMissing = async (issue: ProductIssue) => {
    setBusyId(issue.id);
    setError(null);
    setNotice(null);
    try {
      const result = await adminIssuesApi.removeMissing(issue.id);
      setNotice(`"${issue.name}": ${result.removed} foto(s) perdida(s) removida(s). Ficaram ${result.remaining}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover as fotos perdidas');
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ajustes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Produtos com fotos que não existem mais no armazenamento. Edite para enviar as fotos certas.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Verificar de novo
          </Button>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Verificando as fotos de todos os produtos...</p>
          </div>
        ) : (
          <>
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {issues.length} de {checked} produtos precisam de ajuste
            </p>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100">
              {issues.map((issue) => {
                const canRemove = !issue.problems.includes('all_missing') && !issue.problems.includes('no_images');
                return (
                  <li key={issue.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-slate-50">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                      {issue.preview ? (
                        <img src={issue.preview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageOff className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-[200px] flex-1">
                      <p className="font-medium text-slate-900">{issue.name}</p>
                      <p className="text-xs text-slate-500">
                        {issue.category}
                        {!issue.active && ' · inativo'}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          {describe(issue)}
                        </span>
                        {issue.problems.includes('missing_cover') && !issue.problems.includes('all_missing') && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Capa perdida
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canRemove && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={busyId === issue.id}>
                              {busyId === issue.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Remover perdidas
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover fotos perdidas?</AlertDialogTitle>
                              <AlertDialogDescription>
                                As {issue.missing_images.length} foto(s) que não existem mais serão tiradas de "{issue.name}".
                                O produto continua com as {issue.total_images - issue.missing_images.length} foto(s) que estão ok
                                {issue.problems.includes('missing_cover') && ', e a primeira delas vira a capa'}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeMissing(issue)}>Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button asChild size="sm" className="bg-green-500 text-white hover:bg-green-600">
                        <Link to={`/admin/produtos/${issue.id}/editar?voltar=/admin/ajustes`}>
                          <Edit className="mr-2 h-4 w-4" /> Editar e enviar fotos
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
