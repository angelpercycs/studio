'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser } from '@/firebase/hooks';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const claimSchema = z.object({
  kofiEmail: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  message: z.string().optional(),
});

export function ClaimRewardForm() {
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof claimSchema>>({
        resolver: zodResolver(claimSchema),
        defaultValues: {
            kofiEmail: '',
            message: '',
        },
    });

    async function onSubmit(values: z.infer<typeof claimSchema>) {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para reclamar.' });
            return;
        }

        const { error } = await supabase
            .from('donation_claims')
            .insert({
                user_id: user.uid,
                user_email: user.email,
                kofi_email: values.kofiEmail,
                message: values.message,
                status: 'pending',
                claimed_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Error sending claim to Supabase:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar la reclamación. Por favor, inténtalo de nuevo.' });
        } else {
            toast({ title: 'Reclamación enviada', description: 'Hemos recibido tu solicitud. La revisaremos y activaremos tu mes premium en las próximas horas. ¡Gracias por tu apoyo!' });
            router.push('/');
        }
    }

    if (isUserLoading) {
        return <p>Cargando...</p>;
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inicia Sesión para Reclamar</CardTitle>
                    <CardDescription>Para reclamar tu recompensa por donación, primero debes iniciar sesión.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login">Ir a Iniciar Sesión</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reclamar Mes Premium</CardTitle>
                <CardDescription>
                    ¡Gracias por tu donación! Por favor, completa el siguiente formulario para que podamos activar tu mes sin publicidad.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="kofiEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email usado en Ko-fi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="El email con el que hiciste la donación" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Esto nos ayuda a verificar tu donación.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensaje (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Puedes añadir el ID de la transacción de Ko-fi o cualquier otro detalle aquí." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Reclamación'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
