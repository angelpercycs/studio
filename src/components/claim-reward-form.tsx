'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase/hooks';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const claimSchema = z.object({
  kofiEmail: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  message: z.string().optional(),
});

export function ClaimRewardForm() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
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
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para reclamar.' });
            return;
        }

        try {
            await addDoc(collection(firestore, 'donation_claims'), {
                userId: user.uid,
                userEmail: user.email,
                kofiEmail: values.kofiEmail,
                message: values.message,
                status: 'pending',
                claimedAt: serverTimestamp(),
            });
            toast({ title: 'Reclamación enviada', description: 'Hemos recibido tu solicitud. La revisaremos y activaremos tu mes premium en las próximas horas. ¡Gracias por tu apoyo!' });
            router.push('/');
        } catch (error) {
            console.error('Error sending claim:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar la reclamación. Por favor, inténtalo de nuevo.' });
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
                    ¡Gracias por tu donación! Por favor, completa el siguiente formulario para que podamos activar tu mes sin anuncios.
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
