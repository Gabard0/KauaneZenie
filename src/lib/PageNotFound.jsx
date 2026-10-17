import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-gold/60">404</h1>
                        <div className="h-0.5 w-16 bg-gold/40 mx-auto"></div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-medium">
                            Página não encontrada
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A página <span className="font-medium text-foreground">"{pageName}"</span> não foi encontrada neste aplicativo.
                        </p>
                    </div>

                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 rounded-xl bg-card border border-border/60">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-gold"></div>
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-medium">Nota da administradora</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Isto pode significar que esta página ainda não foi implementada. Peça no chat para implementá-la.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gold border border-gold/50 rounded-lg hover:bg-gold/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Voltar ao início
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}