import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex min-h-[50vh] flex-1 flex-col justify-center overflow-hidden rounded-xl border bg-[url(/images/hero.jpeg)] bg-cover pl-4 md:pl-24">
                    <h1 className="text-2xl font-semibold">Selamat Datang, Admin</h1>
                    <p className="mb-4 text-sm text-gray-500 md:w-2xl">
                        Temukan koleksi sepatu terbaik untuk setiap langkahmu. Dari sepatu dewasa hingga anak-anak, kami punya semua yang kamu
                        butuhkan.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
